const GRVCrowdsale = artifacts.require('../GRVCrowdsale.sol');
const GRVToken = artifacts.require('./GRVToken.sol');
const BigNumber = web3.BigNumber;

module.exports = function(deployer, network, accounts) {
    const owner = accounts[0];
    const walletTeam = accounts[1];
    const walletAdvisor = accounts[2];
    const walletAirdrop = accounts[3];
    const openingTime = web3.eth.getBlock('latest').timestamp;
    //const rate = new BigNumber(1);    
    const rate = new web3.BigNumber(web3.toWei(0.0005, 'ether'));
    // FIXME: update currente value
    const oneTokenInWei = new web3.BigNumber(web3.toWei(0.0005, 'ether'));

    console.log("owner.address " + owner);
    console.log("walletTeam.address " + walletTeam);
    console.log("walletAdvisor.address " + walletAdvisor);
    console.log("openingTime " + openingTime);
    console.log("rate " + rate);
    console.log("oneTokenInWei " + oneTokenInWei);
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
                walletAirdrop,
                oneTokenInWei,
                openingTime
            );
        }).then(() => {

            var token = GRVToken.at(GRVToken.address);

            token.transferOwnership(GRVCrowdsale.address);
        }).then(() =>{
            var crowdsale = GRVCrowdsale.at(GRVCrowdsale.address);
            crowdsale.preAllocate();

        })
        ;
};