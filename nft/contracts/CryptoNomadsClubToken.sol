// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract CryptoNomadsClub is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public constant PUBLIC_TOKENS = 2700;
    uint256 public constant SOUL_BOUND_TOKENS = 200;
    uint256 public constant TREASURY_TOKENS = 300;
    uint256 public constant MAX_TOKENS = 3000;
    uint256 public constant PRICE = 0.3 ether;
    uint256 public constant MAX_PER_MINT = 5;

    bool public saleLive;

    uint256 public giftedAmount;
    uint256 public publicAmount;

    constructor() ERC721("Crypto Nomads Club", "CNC") {}

    function toggleSaleStatus() external onlyOwner {
        saleLive = !saleLive;
    }

    function allPublicMinted() public view returns (bool) {
        return publicAmount == PUBLIC_TOKENS;
    }

// needs a list of cities we are giving the receiver
    function mintCNC(address calldata receiver, <type>[] cities) external payable {
        require(saleLive, "Sale is not active");
        require(totalSupply() < MAX_TOKENS, "Sold out");
        require(
            publicAmount + amount <= PUBLIC_TOKENS,
            "All public tokens sold out"
        );
        require(amount > 0 && amount <= MAX_PER_MINT, "Invalid amount");
        require(PRICE * amount <= msg.value, "Insufficient ETH");

        for (uint256 i = 0; i < cities.length; i++) {
            publicAmount++;
            _safeMint(receiver, cities[i]);
            // msg.sender?
        }
    }

// needs a receiver 
// needs a list of cities we are giving the receiver
// should we store a list of gifted addresses such that we know who is soulbound or not OR should there be a unique token ID?
    function gift(address calldata receiver, <type>[] cities) external onlyOwner {
        require(totalSupply() < MAX_TOKENS, "Sold out");
        require(
            giftedAmount + cities.length <= GIFT_TOKENS,
            "Run out of gift tokens"
        );

        for (uint256 i = 0; i < cities.length; i++) {
            giftedAmount++;
            _mint(receiver, cities[i]);
        }
    }

    // Overriding transfer hook to check for soulbound
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721) {
        // TODO: should this be based on a unique tokenID?
        // if sender is a 0 address, this is a mint transaction, not a transfer
        require(from == address(0), "ERROR: TOKEN IS SOUL BOUND");
        super._beforeTokenTransfer(from, to, tokenId);
    }
}
