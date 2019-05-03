require("dotenv").config();

const GRVToken = artifacts.require("./GRVToken.sol");

module.exports = function(deployer, network, accounts) {
  const walletowner    = accounts[0];  
  const walletTeam     = process.env["WALLET_TEAM"];
  const walletAdvisor  = process.env["WALLET_ADVISOR"];
  const walletAirdrop  = process.env["WALLET_AIRDROP"];
  const walletExchange = process.env["WALLET_EXCHANGE"];

  const tokensAirDrop  = 3777500;
  const tokensExchange = 944375;
  
  console.log("walletowner.address " + walletowner);
  console.log("walletTeam.address " + walletTeam);
  console.log("walletAdvisor.address " + walletAdvisor);
  console.log("walletAirdrop.address " + walletAirdrop);
  
  return deployer
    .then(async () => {
      return deployer.deploy(GRVToken);
    })
    .then(async () => {
      var token = GRVToken.at(GRVToken.address);
      await token.mint(walletExchange, tokensExchange);
     }).then(async () => {
      var token = GRVToken.at(GRVToken.address);
      await token.mint(walletAirdrop,tokensAirDrop );
    });
};