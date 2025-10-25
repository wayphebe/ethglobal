// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title RWAEnergyNFT
 * @dev ERC-721 NFT representing Real World Energy Assets
 * @notice Each NFT represents a physical energy asset with metadata
 */
contract RWAEnergyNFT is ERC721, Ownable, Pausable {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    // Enums
    enum EnergyAssetType {
        SOLAR_PANEL,
        WIND_TURBINE,
        GEOTHERMAL,
        BATTERY_STORAGE,
        HYDROELECTRIC,
        HYBRID_SYSTEM
    }
    
    enum VerificationStatus {
        PENDING,
        VERIFIED,
        REJECTED,
        EXPIRED
    }
    
    // Structs
    struct EnergyAsset {
        string name;
        EnergyAssetType assetType;
        uint256 capacity; // in watts
        string location;
        uint256 installationDate;
        uint256 efficiency; // percentage (0-100)
        uint256 currentValue; // in wei
        VerificationStatus verificationStatus;
        uint256 verificationExpiry;
        address verifier;
        string metadataURI;
        uint256 createdAt;
    }
    
    // State variables
    Counters.Counter private _tokenIdCounter;
    mapping(uint256 => EnergyAsset) public energyAssets;
    mapping(address => uint256[]) public ownerAssets;
    mapping(address => bool) public authorizedVerifiers;
    
    string private _baseTokenURI;
    uint256 public totalAssets;
    uint256 public verifiedAssets;
    
    // Events
    event EnergyAssetMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string name,
        EnergyAssetType assetType,
        uint256 capacity
    );
    
    event AssetVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        VerificationStatus status
    );
    
    event AssetUpdated(
        uint256 indexed tokenId,
        string name,
        uint256 capacity,
        uint256 efficiency,
        uint256 currentValue
    );
    
    event VerifierAuthorized(address indexed verifier, bool authorized);
    
    // Modifiers
    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender], "RWAEnergyNFT: Not an authorized verifier");
        _;
    }
    
    modifier validTokenId(uint256 tokenId) {
        require(_exists(tokenId), "RWAEnergyNFT: Token does not exist");
        _;
    }
    
    modifier validEfficiency(uint256 efficiency) {
        require(efficiency <= 100, "RWAEnergyNFT: Efficiency cannot exceed 100%");
        _;
    }
    
    constructor(string memory baseURI) ERC721("GaiaGrid Energy Assets", "GGA") {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Mint a new energy asset NFT
     * @param to Address to mint the NFT to
     * @param name Asset name
     * @param assetType Type of energy asset
     * @param capacity Asset capacity in watts
     * @param location Asset location
     * @param installationDate Installation timestamp
     * @param efficiency Asset efficiency percentage
     * @param currentValue Current value in wei
     * @param metadataURI IPFS URI for metadata
     */
    function mintEnergyAsset(
        address to,
        string calldata name,
        EnergyAssetType assetType,
        uint256 capacity,
        string calldata location,
        uint256 installationDate,
        uint256 efficiency,
        uint256 currentValue,
        string calldata metadataURI
    ) external onlyOwner validEfficiency(efficiency) {
        require(to != address(0), "RWAEnergyNFT: Cannot mint to zero address");
        require(bytes(name).length > 0, "RWAEnergyNFT: Name cannot be empty");
        require(bytes(location).length > 0, "RWAEnergyNFT: Location cannot be empty");
        require(capacity > 0, "RWAEnergyNFT: Capacity must be greater than zero");
        require(currentValue > 0, "RWAEnergyNFT: Value must be greater than zero");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        EnergyAsset memory newAsset = EnergyAsset({
            name: name,
            assetType: assetType,
            capacity: capacity,
            location: location,
            installationDate: installationDate,
            efficiency: efficiency,
            currentValue: currentValue,
            verificationStatus: VerificationStatus.PENDING,
            verificationExpiry: 0,
            verifier: address(0),
            metadataURI: metadataURI,
            createdAt: block.timestamp
        });
        
        energyAssets[tokenId] = newAsset;
        ownerAssets[to].push(tokenId);
        totalAssets++;
        
        _mint(to, tokenId);
        
        emit EnergyAssetMinted(tokenId, to, name, assetType, capacity);
    }
    
    /**
     * @dev Verify an energy asset
     * @param tokenId Token ID to verify
     * @param status Verification status
     * @param expiryDays Days until verification expires (0 for permanent)
     */
    function verifyAsset(
        uint256 tokenId,
        VerificationStatus status,
        uint256 expiryDays
    ) external onlyVerifier validTokenId(tokenId) {
        EnergyAsset storage asset = energyAssets[tokenId];
        require(
            asset.verificationStatus == VerificationStatus.PENDING,
            "RWAEnergyNFT: Asset already verified"
        );
        
        asset.verificationStatus = status;
        asset.verifier = msg.sender;
        
        if (expiryDays > 0) {
            asset.verificationExpiry = block.timestamp + (expiryDays * 1 days);
        }
        
        if (status == VerificationStatus.VERIFIED) {
            verifiedAssets++;
        }
        
        emit AssetVerified(tokenId, msg.sender, status);
    }
    
    /**
     * @dev Update asset information
     * @param tokenId Token ID to update
     * @param name New asset name
     * @param capacity New capacity
     * @param efficiency New efficiency
     * @param currentValue New current value
     */
    function updateAsset(
        uint256 tokenId,
        string calldata name,
        uint256 capacity,
        uint256 efficiency,
        uint256 currentValue
    ) external validTokenId(tokenId) validEfficiency(efficiency) {
        require(
            ownerOf(tokenId) == msg.sender || msg.sender == owner(),
            "RWAEnergyNFT: Not authorized to update this asset"
        );
        require(bytes(name).length > 0, "RWAEnergyNFT: Name cannot be empty");
        require(capacity > 0, "RWAEnergyNFT: Capacity must be greater than zero");
        require(currentValue > 0, "RWAEnergyNFT: Value must be greater than zero");
        
        EnergyAsset storage asset = energyAssets[tokenId];
        asset.name = name;
        asset.capacity = capacity;
        asset.efficiency = efficiency;
        asset.currentValue = currentValue;
        
        emit AssetUpdated(tokenId, name, capacity, efficiency, currentValue);
    }
    
    /**
     * @dev Authorize or deauthorize a verifier
     * @param verifier Address of the verifier
     * @param authorized Whether to authorize or deauthorize
     */
    function setVerifier(address verifier, bool authorized) external onlyOwner {
        require(verifier != address(0), "RWAEnergyNFT: Invalid verifier address");
        authorizedVerifiers[verifier] = authorized;
        
        emit VerifierAuthorized(verifier, authorized);
    }
    
    /**
     * @dev Get asset information
     * @param tokenId Token ID
     * @return EnergyAsset struct
     */
    function getAsset(uint256 tokenId) external view validTokenId(tokenId) returns (EnergyAsset memory) {
        return energyAssets[tokenId];
    }
    
    /**
     * @dev Get assets owned by an address
     * @param owner Address of the owner
     * @return Array of token IDs
     */
    function getAssetsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerAssets[owner];
    }
    
    /**
     * @dev Get all verified assets
     * @return Array of verified token IDs
     */
    function getVerifiedAssets() external view returns (uint256[] memory) {
        uint256[] memory verified = new uint256[](verifiedAssets);
        uint256 count = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
            if (energyAssets[i].verificationStatus == VerificationStatus.VERIFIED) {
                verified[count] = i;
                count++;
            }
        }
        
        return verified;
    }
    
    /**
     * @dev Get assets by type
     * @param assetType Type of asset to filter by
     * @return Array of token IDs
     */
    function getAssetsByType(EnergyAssetType assetType) external view returns (uint256[] memory) {
        uint256[] memory assets = new uint256[](totalAssets);
        uint256 count = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
            if (energyAssets[i].assetType == assetType) {
                assets[count] = i;
                count++;
            }
        }
        
        return assets;
    }
    
    /**
     * @dev Override tokenURI to return metadata
     * @param tokenId Token ID
     * @return Token URI
     */
    function tokenURI(uint256 tokenId) public view override validTokenId(tokenId) returns (string memory) {
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, tokenId.toString()))
            : energyAssets[tokenId].metadataURI;
    }
    
    /**
     * @dev Set base token URI
     * @param baseURI New base URI
     */
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Get base URI
     * @return Base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Override _beforeTokenTransfer to check for pause
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        require(!paused(), "RWAEnergyNFT: Token transfers are paused");
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
     * @return totalAssets Total number of assets minted
     * @return verifiedAssets Number of verified assets
     * @return totalCapacity Total capacity of all assets
     * @return totalValue Total value of all assets
     */
    function getStats() external view returns (
        uint256,
        uint256,
        uint256,
        uint256
    ) {
        uint256 totalCapacity = 0;
        uint256 totalValue = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
            totalCapacity += energyAssets[i].capacity;
            totalValue += energyAssets[i].currentValue;
        }
        
        return (totalAssets, verifiedAssets, totalCapacity, totalValue);
    }
}
