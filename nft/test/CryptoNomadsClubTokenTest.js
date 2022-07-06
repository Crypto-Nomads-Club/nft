const { expect, assert } = require('chai');
const { ethers, waffle } = require('hardhat');
const { constants } = require('@openzeppelin/test-helpers');

const IERC721 = require('../artifacts/@openzeppelin/contracts/token/ERC721/IERC721.sol/IERC721.json');

// Note: Running all the tests currently takes 10+ minutes due to the minting loops involved
// To speed up testing, we should change the minting loop implementation to waffle mocks

describe('Crypto Nomads Club Token Tests', async function () {
  beforeEach(async function () {
    const CNC = await ethers.getContractFactory('CryptoNomadsClub');
    cncInstance = await CNC.deploy();
  });

  describe('setSaleBatch', function () {
    it('sets public variables when called', async function () {
      const [owner] = await ethers.getSigners();
      const tx = await cncInstance
        .connect(owner)
        .setSaleBatch(1, 2, constants.ZERO_ADDRESS);
      await tx.wait();
      expect(await cncInstance.availableToMint()).to.equal(1);
      expect(await cncInstance.price()).to.equal(2);
      expect(await cncInstance.allowList()).to.equal(constants.ZERO_ADDRESS);
    });
    it('cannot be called as a non-owner', async function () {
      const [owner, address1] = await ethers.getSigners();
      let e = undefined;
      try {
        await cncInstance
          .connect(address1)
          .setSaleBatch(1, 2, constants.ZERO_ADDRESS);
      } catch (error) {
        e = error;
      }
      expect(e.reason).to.equal(
        "Error: VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
      );
    });
  });

  describe('mint', function () {
    it('mints a token', async function () {
      const [owner, minter] = await ethers.getSigners();

      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        3,
        ethers.utils.parseEther('1'),
        constants.ZERO_ADDRESS
      );
      await setSaleBatchTx.wait();

      const originalAvailableToMint = await cncInstance.availableToMint();

      const mintTx = await minterConnection.mint(['AUSTIN'], {
        value: ethers.utils.parseEther('1'),
      });
      await mintTx.wait();

      const newAvailableToMint = await cncInstance.availableToMint();

      expect(await cncInstance.balanceOf(minter.address)).to.equal(1);
      expect(originalAvailableToMint).to.equal(newAvailableToMint.add(1));
    });

    it('can mint if allowList address is set and sender has a balance', async function () {
      const [owner, minter] = await ethers.getSigners();

      const mockERC721 = await waffle.deployMockContract(minter, IERC721.abi);
      await mockERC721.mock.balanceOf.returns(1);

      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        3,
        ethers.utils.parseEther('1'),
        mockERC721.address
      );
      await setSaleBatchTx.wait();

      const originalAvailableToMint = await cncInstance.availableToMint();

      const mintTx = await minterConnection.mint(['AUSTIN'], {
        value: ethers.utils.parseEther('1'),
      });
      await mintTx.wait();

      const newAvailableToMint = await cncInstance.availableToMint();

      expect(await cncInstance.balanceOf(minter.address)).to.equal(1);
      expect(originalAvailableToMint).to.equal(newAvailableToMint.add(1));
    });

    it('can mint multiple cities', async function () {
      const [owner, minter] = await ethers.getSigners();

      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        3,
        ethers.utils.parseEther('1'),
        constants.ZERO_ADDRESS
      );
      await setSaleBatchTx.wait();

      const mintTx1 = await minterConnection.mint(
        ['AUSTIN', 'BALI', 'BARCELONA'],
        {
          value: ethers.utils.parseEther('3'),
        }
      );
      await mintTx1.wait();

      expect(await cncInstance.balanceOf(minter.address)).to.equal(3);
    });
    it('allows multiple addresses to mint', async function () {
      const [owner, address1, address2, address3] = await ethers.getSigners();

      const ownerConnection = await cncInstance.connect(owner);
      const address1Connection = await cncInstance.connect(address1);
      const address2Connection = await cncInstance.connect(address2);
      const address3Connection = await cncInstance.connect(address3);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        3,
        ethers.utils.parseEther('1'),
        constants.ZERO_ADDRESS
      );
      await setSaleBatchTx.wait();

      const mintTx1 = await address1Connection.mint(['AUSTIN'], {
        value: ethers.utils.parseEther('1'),
      });
      await mintTx1.wait();
      const mintTx2 = await address2Connection.mint(['BALI'], {
        value: ethers.utils.parseEther('1'),
      });
      await mintTx2.wait();
      const mintTx3 = await address3Connection.mint(['BARCELONA'], {
        value: ethers.utils.parseEther('1'),
      });
      await mintTx3.wait();

      expect(await cncInstance.balanceOf(address1.address)).to.equal(1);
      expect(await cncInstance.balanceOf(address2.address)).to.equal(1);
      expect(await cncInstance.balanceOf(address3.address)).to.equal(1);
    });

    it('cannot mint an invalid city', async function () {
      const [owner, minter] = await ethers.getSigners();
      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        3,
        ethers.utils.parseEther('1'),
        constants.ZERO_ADDRESS
      );
      await setSaleBatchTx.wait();

      try {
        await minterConnection.mint(['WASHINGTON'], {
          value: ethers.utils.parseEther('1'),
        });
      } catch (error) {
        e = error;
      }
      expect(e.reason).to.equal(
        "Error: VM Exception while processing transaction: reverted with reason string 'Invalid city'"
      );
    });

    it('cannot mint when no cities specified', async function () {
      const [owner, minter] = await ethers.getSigners();
      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        3,
        ethers.utils.parseEther('1'),
        constants.ZERO_ADDRESS
      );
      await setSaleBatchTx.wait();

      try {
        await minterConnection.mint([], {
          value: ethers.utils.parseEther('1'),
        });
      } catch (error) {
        e = error;
      }
      expect(e.reason).to.equal(
        "Error: VM Exception while processing transaction: reverted with reason string 'Invalid amount of cities selected'"
      );
    });

    it('cannot mint when too many cities specified', async function () {
      const [owner, minter] = await ethers.getSigners();
      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        10,
        ethers.utils.parseEther('1'),
        constants.ZERO_ADDRESS
      );
      await setSaleBatchTx.wait();

      try {
        await minterConnection.mint(
          ['AUSTIN', 'BALI', 'BARCELONA', 'LONDON', 'MIAMI', 'PARIS'],
          {
            value: ethers.utils.parseEther('6'),
          }
        );
      } catch (error) {
        e = error;
      }
      expect(e.reason).to.equal(
        "Error: VM Exception while processing transaction: reverted with reason string 'Invalid amount of cities selected'"
      );
    });

    it('cannot mint when sales batch is too small', async function () {
      const [owner, minter] = await ethers.getSigners();
      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        3,
        ethers.utils.parseEther('1'),
        constants.ZERO_ADDRESS
      );
      await setSaleBatchTx.wait();

      try {
        await minterConnection.mint(['AUSTIN', 'BALI', 'BARCELONA', 'LONDON'], {
          value: ethers.utils.parseEther('4'),
        });
      } catch (error) {
        e = error;
      }
      expect(e.reason).to.equal(
        "Error: VM Exception while processing transaction: reverted with reason string 'Not enough available to mint'"
      );
    });

    it('cannot mint more than the public supply of tokens', async function () {
      const [owner, minter] = await ethers.getSigners();
      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        3001,
        ethers.utils.parseEther('1'),
        constants.ZERO_ADDRESS
      );
      await setSaleBatchTx.wait();

      // mint all mintable tokens
      for (let i = 0; i < 2900; i++) {
        const mintTx = await minterConnection.mint(['AMSTERDAM'], {
          value: ethers.utils.parseEther('1'),
        });
        await mintTx.wait();
      }

      try {
        await minterConnection.mint(['SINGAPORE'], {
          value: ethers.utils.parseEther('1'),
        });
      } catch (error) {
        e = error;
      }

      expect(await cncInstance.balanceOf(minter.address)).to.equal(2900);
      expect(e.reason).to.equal(
        "Error: VM Exception while processing transaction: reverted with reason string 'All public tokens sold out'"
      );
    });

    it('cannot mint more than the public supply of tokens added with cities selected', async function () {
      const [owner, minter] = await ethers.getSigners();
      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        3001,
        ethers.utils.parseEther('1'),
        constants.ZERO_ADDRESS
      );
      await setSaleBatchTx.wait();

      for (let i = 0; i < 2896; i++) {
        const mintTx = await minterConnection.mint(['AMSTERDAM'], {
          value: ethers.utils.parseEther('1'),
        });
        await mintTx.wait();
      }

      try {
        await minterConnection.mint(
          ['SINGAPORE', 'BALI', 'AUSTIN', 'DENVER', 'LONDON'],
          {
            value: ethers.utils.parseEther('5'),
          }
        );
      } catch (error) {
        e = error;
      }

      expect(e.reason).to.equal(
        "Error: VM Exception while processing transaction: reverted with reason string 'Not enough public tokens available'"
      );
    });

    it('cannot mint more than the total supply of tokens', async function () {
      const [owner, minter] = await ethers.getSigners();
      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        3001,
        ethers.utils.parseEther('1'),
        constants.ZERO_ADDRESS
      );
      await setSaleBatchTx.wait();

      // mint all mintable tokens
      for (let i = 0; i < 2900; i++) {
        const mintTx = await minterConnection.mint(['AMSTERDAM'], {
          value: ethers.utils.parseEther('1'),
        });
        await mintTx.wait();
      }

      // gift all giftable tokens
      for (let j = 0; j < 100; j++) {
        const giftTx = await ownerConnection.gift(minter.address, 'SINGAPORE');
        await giftTx.wait();
      }

      try {
        await minterConnection.mint(['SINGAPORE'], {
          value: ethers.utils.parseEther('1'),
        });
      } catch (error) {
        e = error;
      }

      expect(await cncInstance.balanceOf(minter.address)).to.equal(3000);
      expect(e.reason).to.equal(
        "Error: VM Exception while processing transaction: reverted with reason string 'Sold out'"
      );
    });

    it('cannot mint if ETH insufficient', async function () {
      const [owner, minter] = await ethers.getSigners();

      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        3,
        ethers.utils.parseEther('1'),
        constants.ZERO_ADDRESS
      );
      await setSaleBatchTx.wait();

      try {
        await minterConnection.mint(['AUSTIN', 'LISBON'], {
          value: ethers.utils.parseEther('1'),
        });
      } catch (error) {
        e = error;
      }

      expect(e.reason).to.equal(
        "Error: VM Exception while processing transaction: reverted with reason string 'Insufficient ETH'"
      );
    });

    it('cannot mint if allow list is non-contract address', async function () {
      const [owner, minter, address2] = await ethers.getSigners();

      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        3,
        ethers.utils.parseEther('1'),
        address2.address
      );
      await setSaleBatchTx.wait();

      try {
        await minterConnection.mint(['AUSTIN'], {
          value: ethers.utils.parseEther('1'),
        });
      } catch (error) {
        e = error;
      }

      expect(e.reason).to.equal(
        'Error: Transaction reverted: function call to a non-contract account'
      );
    });

    it('cannot mint if allow list is set and sender has no balance', async function () {
      const [owner, minter] = await ethers.getSigners();

      const mockERC721 = await waffle.deployMockContract(minter, IERC721.abi);
      await mockERC721.mock.balanceOf.returns(0);

      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        3,
        ethers.utils.parseEther('1'),
        mockERC721.address
      );
      await setSaleBatchTx.wait();

      try {
        await minterConnection.mint(['AUSTIN'], {
          value: ethers.utils.parseEther('1'),
        });
      } catch (error) {
        e = error;
      }

      expect(e.reason).to.equal(
        "Error: VM Exception while processing transaction: reverted with reason string 'Requires allow list NFT'"
      );
    });
  });

  describe('gift', function () {
    it('gifts a token', async function () {
      const [owner, address1] = await ethers.getSigners();
      const connection = await cncInstance.connect(owner);
      const giftTx = await connection.gift(address1.address, 'SINGAPORE');
      await giftTx.wait();

      expect(await cncInstance.balanceOf(address1.address)).to.equal(1);
    });
    it('cannot gift more than the total supply of tokens', async function () {
      const [owner, minter] = await ethers.getSigners();
      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        2900,
        ethers.utils.parseEther('1'),
        constants.ZERO_ADDRESS
      );
      await setSaleBatchTx.wait();

      // mint all mintable tokens
      for (let i = 0; i < 2900; i++) {
        const mintTx = await minterConnection.mint(['AMSTERDAM'], {
          value: ethers.utils.parseEther('1'),
        });
        await mintTx.wait();
      }

      // gift all giftable tokens
      for (let j = 0; j < 100; j++) {
        const giftTx = await ownerConnection.gift(minter.address, 'SINGAPORE');
        await giftTx.wait();
      }

      try {
        await ownerConnection.gift(minter.address, 'SINGAPORE');
      } catch (error) {
        e = error;
      }

      expect(await cncInstance.balanceOf(minter.address)).to.equal(3000);
      expect(e.reason).to.equal(
        "Error: VM Exception while processing transaction: reverted with reason string 'Sold out'"
      );
    });

    it('cannot gift more than 100 tokens', async function () {
      const [owner] = await ethers.getSigners();
      const connection = await cncInstance.connect(owner);
      for (let i = 0; i < 100; i++) {
        const giftTx = await connection.gift(owner.address, 'SINGAPORE');
        await giftTx.wait();
      }

      try {
        await connection.gift(owner.address, 'SINGAPORE');
      } catch (error) {
        e = error;
      }

      expect(e.reason).to.equal(
        "Error: VM Exception while processing transaction: reverted with reason string 'Run out of soul bound tokens'"
      );
    });
    it('cannot gift to an invalid address', async function () {
      const [owner, address1] = await ethers.getSigners();
      const connection = await cncInstance.connect(owner);
      try {
        await connection.gift(address1, 'SINGAPORE');
      } catch (error) {
        e = error;
      }
      expect(e.reason).to.equal('invalid address or ENS name');
    });
    it('cannot gift an invalid city', async function () {
      const [owner, address1] = await ethers.getSigners();
      const connection = await cncInstance.connect(owner);
      try {
        await connection.gift(address1.address, 'WASHINGTON');
      } catch (error) {
        e = error;
      }
      expect(e.reason).to.equal(
        "Error: VM Exception while processing transaction: reverted with reason string 'Invalid city'"
      );
    });
    it('cannot gift as a non-owner', async function () {
      const [owner, address1] = await ethers.getSigners();
      let e = undefined;
      try {
        await cncInstance.connect(address1).gift(owner.address, 'AMSTERDAM');
      } catch (error) {
        e = error;
      }
      expect(e.reason).to.equal(
        "Error: VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
      );
    });
  });

  describe('withdrawAll', function () {
    it('withdraws total balance from contract', async function () {
      const [owner, minter] = await ethers.getSigners();
      const originalBalance = await cncInstance.provider.getBalance(
        owner.address
      );

      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        2899,
        ethers.utils.parseEther('1'),
        constants.ZERO_ADDRESS
      );
      await setSaleBatchTx.wait();

      const mintTx = await minterConnection.mint(['AMSTERDAM'], {
        value: ethers.utils.parseEther('1'),
      });
      await mintTx.wait();
      const withdrawTx = await ownerConnection.withdrawAll();
      await withdrawTx.wait();

      const newBalance = await cncInstance.provider.getBalance(owner.address);

      expect(newBalance.div(ethers.utils.parseEther('1'))).to.equal(
        originalBalance
          .add(ethers.utils.parseEther('1'))
          .div(ethers.utils.parseEther('1'))
      );
    });
    it('cannot be called as a non-owner', async function () {
      const [owner, minter] = await ethers.getSigners();

      const ownerConnection = await cncInstance.connect(owner);
      const minterConnection = await cncInstance.connect(minter);

      const originalBalance = await cncInstance.provider.getBalance(
        owner.address
      );

      const setSaleBatchTx = await ownerConnection.setSaleBatch(
        2899,
        ethers.utils.parseEther('1'),
        constants.ZERO_ADDRESS
      );
      await setSaleBatchTx.wait();

      const mintTx = await minterConnection.mint(['AMSTERDAM'], {
        value: ethers.utils.parseEther('1'),
      });
      await mintTx.wait();

      const withdrawTx = await minterConnection.withdrawAll();
      await withdrawTx.wait();

      const newBalance = await cncInstance.provider.getBalance(owner.address);

      expect(newBalance.div(ethers.utils.parseEther('1'))).to.equal(
        originalBalance
          .add(ethers.utils.parseEther('1'))
          .div(ethers.utils.parseEther('1'))
      );
    });
  });
});
