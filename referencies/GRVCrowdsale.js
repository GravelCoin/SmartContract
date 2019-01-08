const { assertRevert } = require('../helpers/assertRevert');
const EIP20Abstraction = artifacts.require('GRVToken');
const GRVCrowdsale = artifacts.require('GRVCrowdsale');
const BigNumber = web3.BigNumber;
const inital_value = 2500000;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

function latestTime () {
  return web3.eth.getBlock('latest').timestamp;
}

function ether (n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'));
}

contract('GRVCrowdsale', (accounts) => {

  this.rate = new BigNumber(1);      

  const value = ether(1);
  const expectedTokenAmount = this.rate.mul(value);

  beforeEach(async () => {
    this.owner = accounts[0];
    this.token = await EIP20Abstraction.new({ from: this.owner });
    this.walletTeam = accounts[1];
    this.walletAdvisor = accounts[2];
    this.openingTime = latestTime();
    this.firstInvestidor = accounts[3];

    this.crowdsale = await GRVCrowdsale.new(
      this.rate,
      this.owner,
      this.token.address,
      this.walletTeam,
      this.walletAdvisor,
      this.openingTime,
      {
        from: this.owner
      }
    );
    await this.token.transfer(this.crowdsale.address, inital_value);
  });

  

  describe('accepting payments', () => {
    it('should create crowdsale with correct parameters', async () => {      
      this.crowdsale.should.exist;
      this.token.should.exist;
      
      const openingTime = await this.crowdsale.openingTime();      
      const rate = await this.crowdsale.rate();
      const walletAddress = await this.crowdsale.wallet();
      const walletTeam = await this.crowdsale.walletTeam();
      const walletAdvisor = await this.crowdsale.walletAdvisor();
      //const cap = await this.crowdsale.cap();
      //const goal = await this.crowdsale.goal();
  
      openingTime.should.be.bignumber.equal(this.openingTime);
      // closingTime.should.be.bignumber.equal(this.closingTime);
      rate.should.be.bignumber.equal(this.rate);
      walletAddress.should.be.equal(this.owner);
      walletTeam.should.be.equal(this.walletTeam);
      walletAdvisor.should.be.equal(this.walletAdvisor);
      // goal.should.be.bignumber.equal(GOAL);
      // cap.should.be.bignumber.equal(CAP);
    });

    it('creation: should create an initial balance of ' + 0 + ' for the creator', async () => {
      const balance = await this.token.balanceOf.call(accounts[0]);
      assert.strictEqual(balance.toNumber(), 0);
    });
  
    describe('accepting payments',  () => {
      it('should accept payments', async () => {
        await this.crowdsale.send(value).should.be.fulfilled;
        //await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled;
      });
    });

    it('should accept payments', async () => {
      const rate = new BigNumber(1);
      const value = ether(42);
      const tokenSupply = new BigNumber('1e22');
      const expectedTokenAmount = rate.mul(value);
  //    await this.crowdsale.send(value).should.be.fulfilled;
      //await this.crowdsale.buyTokens(this.firstInvestidor, { value: value, from: purchaser }).should.be.fulfilled;
      //const balance = await this.crowdsale.buyTokens(this.firstInvestidor);
      
    });
  });
/*
  it('First sale', async() => {
    const rate = new BigNumber(1);
    const value = ether(42);
    const tokenSupply = new BigNumber('1e22');
    const expectedTokenAmount = rate.mul(value);
    const balance = await this.crowdsale.buyTokens(this.firstInvestidor);
  });
 /* it('creation: should create an initial balance of 200000000 for the creator', async () => {
    const balance = await HST.balanceOf.call(accounts[0]);
    assert.strictEqual(balance.toNumber(), inital_value);
  });
  */


});