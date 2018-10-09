const { assertRevert } = require('../helpers/assertRevert');
const EIP20Abstraction = artifacts.require('GRVToken');
const inital_value = 2500000;

const decimalsExpected = 0;
let HST;

contract('GRVToken', (accounts) => {
  beforeEach(async () => {
    HST = await EIP20Abstraction.new({ from: accounts[0] });
  });

  it('creation: test correct setting of vanity information', async () => {
    const name = await HST.name.call();
    assert.strictEqual(name, 'Gravel Token');

    const decimals = await HST.decimals.call();
    assert.strictEqual(decimals.toNumber(), decimalsExpected);

    const symbol = await HST.symbol.call();
    assert.strictEqual(symbol, 'GRVC');
  });

  it('creation: should create an initial balance of 0 for the creator', async () => {
    const balance = await HST.balanceOf.call(accounts[0]);
    assert.strictEqual(balance.toNumber(), 0);
  });

  it ('Disable limitedTransfer of the GRVToken', async() =>{
    var executed = await HST.updateLimited.call(false);    
    assert.strictEqual(true, executed);
    var isLimited = await HST.isLimitedTransfer();
    assert.strictEqual(true, isLimited);
  });

  it('creation: should create an initial balance of 200000000 for the creator', async () => {
    const minted = await HST.mint(accounts[0], inital_value);    
    const balance = await HST.balanceOf.call(accounts[0]);
    assert.strictEqual(balance.toNumber(), inital_value);
  });

  it ('transfer: ', async () =>{
    var executed = await HST.updateLimited.call(false);    
    const minted = await HST.mint(accounts[1], inital_value);        
    const balanceAccount1 = await HST.balanceOf.call(accounts[0]);
    const balanceAccount2 = await HST.balanceOf.call(accounts[1]);
    var now = web3.eth.getBlock('latest').timestamp;
    var lockData = await HST.addLimitedTransfer.call(accounts[1], 10000, now + 10000); 
    //console.log("Account 01 " + balanceAccount1.toNumber() + " Account 02 " + balanceAccount2.toNumber() );
    console.log(accounts[1] + " => lockData " +  lockData);
    var response = await HST.canTransfer.call(accounts[1], 10000);
    console.log(accounts[1] + " => canTransfer " + response);
    executed = await HST.updateLimited.call(true);  
    var response = await HST.canTransfer.call(accounts[1], 10000);
    console.log(accounts[1]  + " => canTransfer " + response);
  });
  
});
