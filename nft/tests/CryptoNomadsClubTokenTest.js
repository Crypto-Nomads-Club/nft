const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Crypto Nomads Club Token Tests', function () {
  this.beforeEach(async function () {
    const CNC = await ethers.getContractFactory('CryptoNomadsClub');
    artwork = await Artwork.deploy('Crypto Nomads Club', 'CNC');
  });

  it('NFT is gifted successfully', async function () {
    // [account1] = await ethers.getSigners();
    // expect(await artwork.balanceOf(account1.address)).to.equal(0);
    // const tokenURI = "https://opensea-creatures-api.herokuapp.com/api/creature/1"
    // const tx = await artwork.connect(account1).gift(tokenURI);
    // expect(await artwork.balanceOf(account1.address)).to.equal(1);
  });

  it('NFT is minted successfully', async function () {
    // [account1] = await ethers.getSigners();
    // expect(await artwork.balanceOf(account1.address)).to.equal(0);
    // const tokenURI =
    //   'https://opensea-creatures-api.herokuapp.com/api/creature/1';
    // const tx = await artwork.connect(account1).mint(tokenURI);
    // expect(await artwork.balanceOf(account1.address)).to.equal(1);
  });
});
