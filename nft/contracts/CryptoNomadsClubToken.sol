// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CryptoNomadsClub is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Ownable
{
    uint256 private constant MAX_TOKENS = 3000;

    // PUBLIC TOKENS AMOUNT = 2900;
    // SOUL BOUND TOKENS AMOUNT = 100;
    // MAX TOKENS THAT CAN BE MINTED BY AN ADDRESS = 5;

    uint256 private publicAmount;
    uint256 private soulBoundCounter;

    mapping(string => bool) public CITIES;

    constructor() ERC721("Crypto Nomads Club", "CNC") {
        publicAmount = 0;
        soulBoundCounter = 2900;

        // create a map of city names so we know which names can be minted
        CITIES["AMSTERDAM"] = true;
        CITIES["AUSTIN"] = true;
        CITIES["BALI"] = true;
        CITIES["BARCELONA"] = true;
        CITIES["BUENOS_AIRES"] = true;
        CITIES["DENVER"] = true;
        CITIES["DUBAI"] = true;
        CITIES["LISBON"] = true;
        CITIES["LONDON"] = true;
        CITIES["LOS_ANGELES"] = true;
        CITIES["MIAMI"] = true;
        CITIES["NEW_YORK"] = true;
        CITIES["PARIS"] = true;
        CITIES["RIO_DE_JANEIRO"] = true;
        CITIES["SINGAPORE"] = true;
    }

    // function setBaseURI(string memory baseURI) external onlyOwner {
    //     _setBaseURI(baseURI);
    // }

    function mintCNC(string[] memory cities) external payable {
        require(totalSupply() < MAX_TOKENS, "Sold out");
        require(publicAmount < 2900, "All public tokens sold out");
        require(
            cities.length > 0 && cities.length <= 5,
            "Invalid amount of cities"
        );
        require(
            publicAmount + cities.length <= 2900,
            "Not enough public tokens available"
        );
        require(0.3 ether * cities.length <= msg.value, "Insufficient ETH");

        for (uint256 i = 0; i < cities.length; i++) {
            require(CITIES[cities[i]], "Invalid city");
            publicAmount++;
            _safeMint(msg.sender, publicAmount);
            string memory finalTokenURI = string(
                abi.encodePacked(_baseURI(), cities[i], ".json")
            );
            _setTokenURI(publicAmount, finalTokenURI);
        }
    }

    function gift(address receiver, string memory city) external onlyOwner {
        require(totalSupply() < MAX_TOKENS, "Sold out");
        require(soulBoundCounter <= 100, "Run out of soul bound tokens");
        require(CITIES[city], "Invalid city");

        _mint(receiver, soulBoundCounter);
        string memory finalTokenURI = string(
            abi.encodePacked(_baseURI(), city, ".json")
        );
        _setTokenURI(soulBoundCounter, finalTokenURI);
        soulBoundCounter++;
    }

    // Overriding _baseURI

    function _baseURI()
        internal
        view
        virtual
        override(ERC721)
        returns (string memory)
    {
        return "ipfs://<folder-hash-code";
    }

    // Overriding transfer hook to check for soulbound

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        // if sender is a 0 address, this is a mint transaction, not a transfer
        require(
            tokenId < 2900 && from == address(0),
            "ERROR: TOKEN IS SOUL BOUND"
        );
        require(
            balanceOf(to) < 5,
            "Maximum amount of NFTs minted for this wallet"
        );

        super._beforeTokenTransfer(from, to, tokenId);
    }

    // Necessary overrides for interface extensions

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }
}
