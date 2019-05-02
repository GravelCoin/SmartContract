require("dotenv").config();

const GRVCrowdsale = artifacts.require("../GRVCrowdsale.sol");
const GRVToken = artifacts.require("./GRVToken.sol");
//const GRVPayment = artifacts.require('./GRVPayment.sol');
const BigNumber = web3.BigNumber;

module.exports = function(deployer, network, accounts) {
  const owner = accounts[0];
  /*
  const walletTeam = '0xe169B67CC506152bdb6e2dF4598644816376608e';//accounts[1];
  const walletAdvisor = '0xC7BBF5545b0272e353998C64882833160a13f607';//accounts[2];
  const walletAirdrop = '0xd414064cA37b675ed7E7Ef9Da291969CA1391e48';//accounts[3];
  */
 
  const walletTeam    = accounts[1];
  const walletAdvisor = accounts[2];
  const walletAirdrop = accounts[3];

  const getLatestBlockTimestamp = () =>
    new Promise((resolve, reject) => {
      web3.eth.getBlock("latest", (err, block) => {
        if (err) {
          console.log("ERR " + err);
          return reject(err);
        }
        console.log("block.timestamp " + block.timestamp);
        resolve(block.timestamp);
      });
    });

  let openingTime;
  getLatestBlockTimestamp().then(timestamp => {
    console.log("inner timestamp " + timestamp);
   // openingTime = timestamp;
  });

  openingTime = 1555959643;

  while(openingTime == undefined){
    console.log("wait for timestamp");
  }
  
  console.log("after getLastetBlockTimestamp " + openingTime);
  //const rate = new BigNumber(1);
  const rate = new web3.BigNumber(web3.toWei(0.001164219649440530, "ether"));
  // current value of token.
  const oneTokenInWei = new web3.BigNumber(
    web3.toWei(0.001164219649440530, "ether")
  );
  // blocks of the totalSupply token
  const blocks = [
    19887500, 20887500, 21887500, 22887500, 23887500, 24887500, 25887500, 26887500, 27887500, 29037500, 30337500, 31837500, 33837500, 35837500, 37837500, 39837500, 41937500, 44187500, 46437500, 49437500, 52437500, 55437500, 58437500, 61437500, 65437500, 69437500, 74437500, 79437500, 84437500, 89437500, 94437500
    ];
  // blocks price, part of oneTokenInWei
  const blocksPrice = [
    44,44,44,44,44,44,44,44,44,44,44,44,50,50,50,50,50,50,50,50,50,50,50,50,56,56,56,56,56,56,56
  ];

  console.log("owner.address " + owner);
  console.log("walletTeam.address " + walletTeam);
  console.log("walletAdvisor.address " + walletAdvisor);
  console.log("walletAirdrop.address " + walletAirdrop);
  
  console.log("openingTime " + openingTime);
  console.log("rate " + rate);
  console.log("oneTokenInWei " + oneTokenInWei);
  //console.log("owner.address " + this.owner);

  return deployer
    .then(async () => {
      return deployer.deploy(GRVToken);
    })
    .then(() => {
      return deployer.deploy(
        GRVCrowdsale,
        rate,
        owner,
        GRVToken.address,
        walletTeam,
        walletAdvisor,
        walletAirdrop,
        oneTokenInWei,
        openingTime,
        blocks,
        blocksPrice
      );
    })
    .then(async () => {
      var token = GRVToken.at(GRVToken.address);

      await token.transferOwnership(GRVCrowdsale.address);
    })
    .then(async () => {
      var crowdsale = GRVCrowdsale.at(GRVCrowdsale.address);
      await crowdsale.preAllocate();
    });
  /*.then(()=>{
            return deployer.deploy(GRVPayment);
        })
        .then(()=>{
            var token = GRVToken.at(GRVToken.address);
            var payment = GRVPayment.at(GRVPayment.address);
            payment._setInterfaceContractAddress(token.address);
        })*/
};