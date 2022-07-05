/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('dotenv').config({ path: __dirname + '/.env' });
require('@nomiclabs/hardhat-waffle');
const { API_URL, PRIVATE_KEY } = process.env;
module.exports = {
  solidity: '0.8.7',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      accounts: {
        accountsBalance: '1000000000000000000000000000000',
      },
    },
  },
  mocha: {
    timeout: 100000000,
  },
};
