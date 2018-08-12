const { assertRevert } = require('../helpers/assertRevert');
const EIP20Abstraction = artifacts.require('GRVToken');
const Crowdsale = artifacts.require('GRVCrowdsale');
const inital_value = 2500000;
let HST;

contract('GRVCrowdsale', (accounts) => {

  beforeEach(async () => {
    this.rate = 1;    
    this.owner = accounts[0];
    this.token = await EIP20Abstraction.new({ from: this.owner });
    this.walletTeam = accounts[1];
    this.walletAdvisor = accounts[2];
    this.openingTime = latestTime();

    this.crowdsale = await Crowdsale.new(
      this.rate,
      this.owner,
      this.walletTeam,
      this.walletAdvisor,
      this.openingTime,
      {
        from: this.owner
      }
    );

  });

 /* it('creation: should create an initial balance of 200000000 for the creator', async () => {
    const balance = await HST.balanceOf.call(accounts[0]);
    assert.strictEqual(balance.toNumber(), inital_value);
  });
  */
});