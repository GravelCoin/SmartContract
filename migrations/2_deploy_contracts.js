const GRVCrowdsale = artifacts.require("../GRVCrowdsale.sol");
const GRVToken = artifacts.require("./GRVToken.sol");
//const GRVPayment = artifacts.require('./GRVPayment.sol');
const BigNumber = web3.BigNumber;

module.exports = function(deployer, network, accounts) {
  const owner = accounts[0];
  const walletTeam = accounts[1];
  const walletAdvisor = accounts[2];
  const walletAirdrop = accounts[3];

  const getLatestBlockTimestamp = () =>
    new Promise((resolve, reject) => {
      web3.eth.getBlock("latest", (err, block) => {
        if (err) {
          return reject(err);
        }

        resolve(block.timestamp);
      });
    });

  let openingTime;
  getLatestBlockTimestamp().then(timestamp => {
    openingTime = timestamp;
  });

  //const rate = new BigNumber(1);
  const rate = new web3.BigNumber(web3.toWei(0.0004519774011, "ether"));
  // FIXME: update currente value
  const oneTokenInWei = new web3.BigNumber(
    web3.toWei(0.0004519774011, "ether")
  );
  //[20836667,20843333,20846666]
  // FIXME: update values block
  ///const blocks = [20833354, 20833365, 20833386];
  const blocks = [
    1000000,
    1000000,
    1000000,
    1000000,
    1000000,
    1000000,
    1000000,
    1000000,
    1000000,
    1150000,
    1300000,
    1500000,
    2000000,
    2000000,
    2000000,
    2000000,
    2100000,
    2250000,
    2250000,
    3000000,
    3000000,
    3000000,
    3000000,
    3000000,
    4000000,
    4000000,
    5000000,
    5000000,
    5000000,
    5000000,
    5000000
  ];
  // FIXME: add new array to price of the blockIndex
  const blocksPrice = [
    56,
    56,
    56,
    56,
    56,
    56,
    56,
    56,
    56,
    56,
    56,
    56,
    50,
    50,
    50,
    50,
    50,
    50,
    50,
    50,
    50,
    50,
    50,
    50,
    44,
    44,
    44,
    44,
    44,
    44,
    44
  ];

  console.log("owner.address " + owner);
  console.log("walletTeam.address " + walletTeam);
  console.log("walletAdvisor.address " + walletAdvisor);
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
