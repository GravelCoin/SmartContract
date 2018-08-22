/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  // networks: {
  //   development:{
  //     host: "localhost",
  //     port: 7545,
  //     network_id: "5777",
  //     gas: 4500000,
  //     gasPrice: 1000000
  //   }
  // }
};

/*
var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "opinion destroy betray ...";


module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    live: {
      network_id: 1 // Ethereum public network
      // optional config values
      // host - defaults to "localhost"
      // port - defaults to 8545
      // gas
      // gasPrice
      // from - default address to use for any transaction Truffle makes during migrations
    },
    ropsten: {
      provider: new HDWalletProvider(mnemonic, 'https://ropsten.infura.io'),
      network_id: '3'
    },
    testrpc: {
      network_id: 'default',
      gas: 1000000,
      gasPrice: 10000000000
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,        
      gas: 0xfffffffffff,
      gasPrice: 0x01     
    },
  }
};
*/