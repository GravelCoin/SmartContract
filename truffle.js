var HDWalletProvider = require("truffle-hdwallet-provider");
require("dotenv").config();
var INFURA_API_KEY = process.env["INFURA_API_KEY"];
var MNEMONIC = process.env["MNENOMIC"];

module.exports = {
  networks: {
    development:{
      host: "localhost",
      //port: 7545,
      port: 8545,
      network_id: "5777",
      gas: 5000000,
      gasPrice: 10000000000
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, "https://ropsten.infura.io/" + INFURA_API_KEY);
      },
      network_id: '3',
      gas: 5000000,
      gasPrice: 10000000000
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, "https://rinkeby.infura.io/" + INFURA_API_KEY)
      },
      network_id: '4',
      gas: 5000000,      //make sure this gas allocation isn't over 4M, which is the max      
      gasPrice: 10000000000
    },
    kovan: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, "https://kovan.infura.io/" + INFURA_API_KEY)
      },
      network_id: '5',
      gas: 5000000,      //make sure this gas allocation isn't over 4M, which is the max      
      gasPrice: 10000000000
    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, "https://mainnet.infura.io/" + INFURA_API_KEY)
      },
      network_id: '1',
      gas: 5000000,      //make sure this gas allocation isn't over 4M, which is the max      
      gasPrice: 10000000000
    }
  }
};