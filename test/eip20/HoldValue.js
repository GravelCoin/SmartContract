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
    assert.strictEqual(symbol, 'GRV');
  });

  it('creation: should create an initial balance of 0 for the creator', async () => {
    const balance = await HST.balanceOf.call(accounts[0]);
    assert.strictEqual(balance.toNumber(), 0);
  });

  it ('Disable limitedTransfer of the GRVToken', async() =>{
    var disabled = await HST.updateLimited(false);
    console.log(disabled.valueOf());
    //assert.strictEqual(false, disabled.;
  });

  it('creation: should create an initial balance of 200000000 for the creator', async () => {
    const minted = await HST.mint(accounts[0], inital_value);    
    const balance = await HST.balanceOf.call(accounts[0]);
    assert.strictEqual(balance.toNumber(), inital_value);
  });
});
