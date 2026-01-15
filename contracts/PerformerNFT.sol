// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PerformerNFT
 * @dev ERC-721 NFT contract with ERC-2981 royalty support for Fantasy Movie League performers
 * 
 * This contract represents Performer NFTs that can be used to enter tournaments
 * on the Fantasy Movie League platform. Each NFT represents ownership rights
 * to compete with a specific performer in fantasy tournaments.
 */
contract PerformerNFT is ERC721, ERC721URIStorage, ERC721Royalty, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Performer metadata
    string public performerName;
    string public performerBio;
    
    // Minting configuration
    uint256 public maxSupply;
    uint256 public mintPrice;
    bool public mintingEnabled;
    
    // Events
    event PerformerNFTMinted(address indexed to, uint256 indexed tokenId);
    event MintingStatusChanged(bool enabled);
    event MintPriceUpdated(uint256 newPrice);
    
    /**
     * @dev Constructor to initialize the Performer NFT collection
     * @param _performerName Name of the performer this NFT represents
     * @param _performerBio Short biography of the performer
     * @param _maxSupply Maximum number of NFTs that can be minted
     * @param _mintPrice Price in wei to mint one NFT
     * @param _royaltyReceiver Address to receive royalty payments
     * @param _royaltyFeeNumerator Royalty fee in basis points (e.g., 250 = 2.5%)
     */
    constructor(
        string memory _performerName,
        string memory _performerBio,
        uint256 _maxSupply,
        uint256 _mintPrice,
        address _royaltyReceiver,
        uint96 _royaltyFeeNumerator
    ) ERC721(_performerName, "PERFORMER") Ownable(msg.sender) {
        performerName = _performerName;
        performerBio = _performerBio;
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
        mintingEnabled = true;
        
        // Set default royalty for all tokens
        _setDefaultRoyalty(_royaltyReceiver, _royaltyFeeNumerator);
    }
    
    /**
     * @dev Mint a new Performer NFT
     * @param to Address to receive the minted NFT
     * @param uri Metadata URI for the NFT
     */
    function mint(address to, string memory uri) public payable {
        require(mintingEnabled, "Minting is currently disabled");
        require(_tokenIdCounter.current() < maxSupply, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit PerformerNFTMinted(to, tokenId);
    }
    
    /**
     * @dev Batch mint multiple NFTs (owner only)
     * @param to Address to receive the minted NFTs
     * @param amount Number of NFTs to mint
     * @param baseUri Base URI for metadata (will append tokenId)
     */
    function batchMint(address to, uint256 amount, string memory baseUri) public onlyOwner {
        require(_tokenIdCounter.current() + amount <= maxSupply, "Exceeds max supply");
        
        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, string(abi.encodePacked(baseUri, Strings.toString(tokenId))));
            
            emit PerformerNFTMinted(to, tokenId);
        }
    }
    
    /**
     * @dev Toggle minting status
     */
    function setMintingEnabled(bool enabled) public onlyOwner {
        mintingEnabled = enabled;
        emit MintingStatusChanged(enabled);
    }
    
    /**
     * @dev Update mint price
     */
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }
    
    /**
     * @dev Update default royalty configuration
     */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }
    
    /**
     * @dev Set royalty for a specific token
     */
    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) public onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }
    
    /**
     * @dev Withdraw contract balance to owner
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Get total number of minted tokens
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Get all token IDs owned by an address
     */
    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
            if (_ownerOf(i) == owner) {
                tokenIds[index] = i;
                index++;
            }
        }
        
        return tokenIds;
    }
    
    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, ERC721Royalty) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage, ERC721Royalty) {
        super._burn(tokenId);
    }
}
