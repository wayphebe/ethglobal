// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title GAIAToken
 * @dev ERC-20 token for GaiaGrid ecosystem
 * @notice This token is used for governance, energy trading, and ecosystem rewards
 */
contract GAIAToken is ERC20, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million tokens
    
    // Mapping to track minted tokens per address (for governance)
    mapping(address => uint256) public mintedTokens;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    
    constructor() ERC20("GaiaGrid Token", "GAIA") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     * @param reason Reason for minting (for tracking)
     */
    function mint(address to, uint256 amount, string calldata reason) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "GAIAToken: Max supply exceeded");
        require(to != address(0), "GAIAToken: Cannot mint to zero address");
        require(amount > 0, "GAIAToken: Amount must be greater than zero");
        
        _mint(to, amount);
        mintedTokens[to] += amount;
        
        emit TokensMinted(to, amount, reason);
    }
    
    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     * @param reason Reason for burning (for tracking)
     */
    function burn(uint256 amount, string calldata reason) external {
        require(balanceOf(msg.sender) >= amount, "GAIAToken: Insufficient balance");
        require(amount > 0, "GAIAToken: Amount must be greater than zero");
        
        _burn(msg.sender, amount);
        
        emit TokensBurned(msg.sender, amount, reason);
    }
    
    /**
     * @dev Burn tokens from specified address (only owner)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     * @param reason Reason for burning (for tracking)
     */
    function burnFrom(address from, uint256 amount, string calldata reason) external onlyOwner {
        require(balanceOf(from) >= amount, "GAIAToken: Insufficient balance");
        require(amount > 0, "GAIAToken: Amount must be greater than zero");
        
        _burn(from, amount);
        
        emit TokensBurned(from, amount, reason);
    }
    
    /**
     * @dev Pause token transfers (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer to check for pause
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "GAIAToken: Token transfers are paused");
    }
    
    /**
     * @dev Get total minted tokens for an address
     * @param account Address to check
     * @return Total minted tokens
     */
    function getMintedTokens(address account) external view returns (uint256) {
        return mintedTokens[account];
    }
    
    /**
     * @dev Get remaining mintable tokens
     * @return Remaining tokens that can be minted
     */
    function getRemainingMintable() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}
