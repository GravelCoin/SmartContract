const GRVCrowdsale = artifacts.require('../GRVCrowdsale.sol');
const GRVToken = artifacts.require('./GRVToken.sol');
const BigNumber = web3.BigNumber;

module.exports = function(deployer, network, accounts) {
    const owner = accounts[0];
    const walletTeam = accounts[1];
    const walletAdvisor = accounts[2];
    const openingTime = web3.eth.getBlock('latest').timestamp;
    const rate = new BigNumber(1);    

    console.log("owner.address " + owner);
    console.log("walletTeam.address " + walletTeam);
    console.log("walletAdvisor.address " + walletAdvisor);
    console.log("openingTime " + openingTime);
    console.log("rate " + rate);
    //console.log("owner.address " + this.owner);

    return deployer
        .then(() => {
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
                openingTime
            );
        })
        ;
};