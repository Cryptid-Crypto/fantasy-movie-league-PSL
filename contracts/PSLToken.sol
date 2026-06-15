// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PSLToken
 * @dev ERC-20 token for Fantasy Movie League (Porn Star League) platform
 * Used for tournament entry fees, rewards, and platform transactions
 * Mintable by owner for rewards distribution, burnable by holders
 */
contract PSLToken is ERC20, ERC20Burnable, Ownable {
    /// @dev Maximum total supply cap (1 billion PSL tokens)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    
    /// @dev Minted event for tracking new token creation
    event TokensMinted(address indexed to, uint256 amount);
    
    constructor(address initialOwner) ERC20("PSL Token", "PSL") Ownable(initialOwner) {
        // Initial mint to owner (can be adjusted as needed)
        _mint(initialOwner, 100_000_000 * 10**18); // 100M PSL initial supply
    }
    
    /**
     * @dev Mint new tokens (only owner)
     * Used for platform rewards, tournament prizes, etc.
     * @param to Address to receive minted tokens
     * @param amount Amount to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Batch mint tokens to multiple addresses (only owner)
     * @param recipients Array of addresses to receive tokens
     * @param amounts Array of amounts to mint (must match recipients length)
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Array length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            totalAmount += amounts[i];
        }
        require(totalSupply() + totalAmount <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
            emit TokensMinted(recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev Get remaining mintable supply
     */
    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}