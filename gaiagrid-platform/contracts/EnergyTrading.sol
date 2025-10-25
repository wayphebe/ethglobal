// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title EnergyTrading
 * @dev Handles energy trading between producers and consumers
 * @notice Supports both ETH and ERC-20 token payments
 */
contract EnergyTrading is Ownable, Pausable, ReentrancyGuard {
    struct EnergyListing {
        address seller;
        address nodeAddress;
        uint256 energyAmount; // in kWh (scaled by 1e18)
        uint256 pricePerKWh; // in wei per kWh
        address paymentToken; // address(0) for ETH, token address for ERC-20
        bool isActive;
        uint256 createdAt;
        uint256 expiresAt;
    }
    
    struct EnergyTransaction {
        address buyer;
        address seller;
        address nodeAddress;
        uint256 energyAmount;
        uint256 totalPrice;
        address paymentToken;
        uint256 transactionId;
        bool isCompleted;
        uint256 createdAt;
        uint256 completedAt;
    }
    
    // State variables
    mapping(uint256 => EnergyListing) public listings;
    mapping(uint256 => EnergyTransaction) public transactions;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256[]) public userTransactions;
    
    uint256 public nextListingId;
    uint256 public nextTransactionId;
    uint256 public totalEnergyTraded; // in kWh
    uint256 public totalVolume; // in wei
    
    // Platform fee (in basis points, 100 = 1%)
    uint256 public platformFeeBps = 250; // 2.5%
    address public feeRecipient;
    
    // Supported payment tokens
    mapping(address => bool) public supportedTokens;
    
    // Events
    event EnergyListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nodeAddress,
        uint256 energyAmount,
        uint256 pricePerKWh,
        address paymentToken
    );
    
    event EnergyPurchased(
        uint256 indexed transactionId,
        uint256 indexed listingId,
        address indexed buyer,
        address seller,
        uint256 energyAmount,
        uint256 totalPrice,
        address paymentToken
    );
    
    event ListingCancelled(uint256 indexed listingId, address indexed seller);
    event PlatformFeeUpdated(uint256 newFeeBps);
    event TokenSupportUpdated(address indexed token, bool supported);
    
    // Modifiers
    modifier validListing(uint256 listingId) {
        require(listingId < nextListingId, "EnergyTrading: Invalid listing ID");
        require(listings[listingId].isActive, "EnergyTrading: Listing not active");
        _;
    }
    
    modifier validAmount(uint256 amount) {
        require(amount > 0, "EnergyTrading: Amount must be greater than zero");
        _;
    }
    
    modifier validPrice(uint256 price) {
        require(price > 0, "EnergyTrading: Price must be greater than zero");
        _;
    }
    
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
        // Support ETH by default (address(0))
        supportedTokens[address(0)] = true;
    }
    
    /**
     * @dev Create a new energy listing
     * @param nodeAddress Address of the energy node
     * @param energyAmount Amount of energy in kWh (scaled by 1e18)
     * @param pricePerKWh Price per kWh in wei
     * @param paymentToken Payment token address (address(0) for ETH)
     * @param expiresIn Duration in seconds until listing expires
     */
    function createListing(
        address nodeAddress,
        uint256 energyAmount,
        uint256 pricePerKWh,
        address paymentToken,
        uint256 expiresIn
    ) external validAmount(energyAmount) validPrice(pricePerKWh) whenNotPaused {
        require(supportedTokens[paymentToken], "EnergyTrading: Unsupported payment token");
        require(expiresIn > 0, "EnergyTrading: Expiration must be greater than zero");
        
        EnergyListing memory newListing = EnergyListing({
            seller: msg.sender,
            nodeAddress: nodeAddress,
            energyAmount: energyAmount,
            pricePerKWh: pricePerKWh,
            paymentToken: paymentToken,
            isActive: true,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + expiresIn
        });
        
        uint256 listingId = nextListingId++;
        listings[listingId] = newListing;
        userListings[msg.sender].push(listingId);
        
        emit EnergyListed(
            listingId,
            msg.sender,
            nodeAddress,
            energyAmount,
            pricePerKWh,
            paymentToken
        );
    }
    
    /**
     * @dev Purchase energy from a listing
     * @param listingId ID of the listing to purchase from
     */
    function purchaseEnergy(uint256 listingId) 
        external 
        payable 
        validListing(listingId) 
        nonReentrant 
        whenNotPaused 
    {
        EnergyListing storage listing = listings[listingId];
        require(listing.expiresAt > block.timestamp, "EnergyTrading: Listing expired");
        require(msg.sender != listing.seller, "EnergyTrading: Cannot buy from own listing");
        
        uint256 totalPrice = (listing.energyAmount * listing.pricePerKWh) / 1e18;
        uint256 platformFee = (totalPrice * platformFeeBps) / 10000;
        uint256 sellerAmount = totalPrice - platformFee;
        
        // Handle payment
        if (listing.paymentToken == address(0)) {
            // ETH payment
            require(msg.value >= totalPrice, "EnergyTrading: Insufficient ETH payment");
            
            // Refund excess ETH
            if (msg.value > totalPrice) {
                payable(msg.sender).transfer(msg.value - totalPrice);
            }
            
            // Transfer to seller and platform
            payable(listing.seller).transfer(sellerAmount);
            payable(feeRecipient).transfer(platformFee);
        } else {
            // ERC-20 payment
            require(msg.value == 0, "EnergyTrading: ETH not accepted for this listing");
            
            IERC20 token = IERC20(listing.paymentToken);
            require(
                token.transferFrom(msg.sender, listing.seller, sellerAmount),
                "EnergyTrading: Token transfer failed"
            );
            require(
                token.transferFrom(msg.sender, feeRecipient, platformFee),
                "EnergyTrading: Fee transfer failed"
            );
        }
        
        // Create transaction record
        EnergyTransaction memory transaction = EnergyTransaction({
            buyer: msg.sender,
            seller: listing.seller,
            nodeAddress: listing.nodeAddress,
            energyAmount: listing.energyAmount,
            totalPrice: totalPrice,
            paymentToken: listing.paymentToken,
            transactionId: nextTransactionId,
            isCompleted: true,
            createdAt: block.timestamp,
            completedAt: block.timestamp
        });
        
        uint256 transactionId = nextTransactionId++;
        transactions[transactionId] = transaction;
        userTransactions[msg.sender].push(transactionId);
        userTransactions[listing.seller].push(transactionId);
        
        // Update listing
        listing.isActive = false;
        
        // Update statistics
        totalEnergyTraded += listing.energyAmount;
        totalVolume += totalPrice;
        
        emit EnergyPurchased(
            transactionId,
            listingId,
            msg.sender,
            listing.seller,
            listing.energyAmount,
            totalPrice,
            listing.paymentToken
        );
    }
    
    /**
     * @dev Cancel a listing
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external validListing(listingId) {
        EnergyListing storage listing = listings[listingId];
        require(msg.sender == listing.seller, "EnergyTrading: Not the seller");
        
        listing.isActive = false;
        
        emit ListingCancelled(listingId, msg.sender);
    }
    
    /**
     * @dev Get user's listings
     * @param user Address of the user
     * @return Array of listing IDs
     */
    function getUserListings(address user) external view returns (uint256[] memory) {
        return userListings[user];
    }
    
    /**
     * @dev Get user's transactions
     * @param user Address of the user
     * @return Array of transaction IDs
     */
    function getUserTransactions(address user) external view returns (uint256[] memory) {
        return userTransactions[user];
    }
    
    /**
     * @dev Get active listings
     * @return Array of active listing IDs
     */
    function getActiveListings() external view returns (uint256[] memory) {
        uint256[] memory activeListings = new uint256[](nextListingId);
        uint256 count = 0;
        
        for (uint256 i = 0; i < nextListingId; i++) {
            if (listings[i].isActive && listings[i].expiresAt > block.timestamp) {
                activeListings[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeListings[i];
        }
        
        return result;
    }
    
    /**
     * @dev Update platform fee (only owner)
     * @param newFeeBps New fee in basis points
     */
    function updatePlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "EnergyTrading: Fee cannot exceed 10%");
        platformFeeBps = newFeeBps;
        
        emit PlatformFeeUpdated(newFeeBps);
    }
    
    /**
     * @dev Update supported token (only owner)
     * @param token Token address
     * @param supported Whether token is supported
     */
    function updateTokenSupport(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        
        emit TokenSupportUpdated(token, supported);
    }
    
    /**
     * @dev Pause the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get contract statistics
     * @return totalListings Total number of listings created
     * @return totalTransactions Total number of transactions completed
     * @return totalEnergyTraded Total energy traded in kWh
     * @return totalVolume Total volume in wei
     */
    function getStats() external view returns (
        uint256,
        uint256,
        uint256,
        uint256
    ) {
        return (nextListingId, nextTransactionId, totalEnergyTraded, totalVolume);
    }
}
