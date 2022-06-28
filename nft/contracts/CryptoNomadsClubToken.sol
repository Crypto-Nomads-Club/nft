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

    constructor() ERC721("Crypto Nomads Club", "CNC") {}

    function toggleSaleStatus() external onlyOwner {
        saleLive = !saleLive;
    }

    // function mintNFT(address recipient, string memory tokenURI)
    //     public
    //     onlyOwner
    //     returns (uint256)
    // {
    //     _tokenIds.increment();

    //     uint256 newItemId = _tokenIds.current();
    //     _mint(recipient, newItemId);
    //     _setTokenURI(newItemId, tokenURI);

    //     return newItemId;
    // }

    function mintCNC(uint256 amount) external payable {
        require(saleLive, "Sale is not active");
        require(totalSupply() < MAX_TOKENS, "Sold out");
        require(
            publicAmount + amount <= PUBLIC_TOKENS,
            "All public tokens sold out"
        );
        require(amount > 0 && amount <= MAX_PER_MINT, "Invalid amount");
        require(PRICE * amount <= msg.value, "Insufficient ETH");
    }

    function gift(address[] calldata receivers) external onlyOwner {
        require(totalSupply() < MAX_TOKENS, "Sold out");
        require(
            giftedAmount + receivers.length <= GIFT_TOKENS,
            "Run out of gift tokens"
        );

        for (uint256 i = 0; i < receivers.length; i++) {
            giftedAmount++;
            _safeMint(receivers[i], totalSupply() + 1);
        }
    }
}
