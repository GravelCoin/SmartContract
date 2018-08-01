const { assertRevert } = require('../helpers/assertRevert');
const EIP20Abstraction = artifacts.require('GRVCrowdsale');
const inital_value = 2500000;
let HST;

contract('GRVToken', (accounts) => {
  beforeEach(async () => {
    HST = await EIP20Abstraction.new({ from: accounts[0] });
  });

  it('creation: should create an initial balance of 200000000 for the creator', async () => {
    const balance = await HST.balanceOf.call(accounts[0]);
    assert.strictEqual(balance.toNumber(), inital_value);
  });

  it('creation: test correct setting of vanity information', async () => {
    const name = await HST.name.call();
    assert.strictEqual(name, 'Gravel Token');

    const decimals = await HST.decimals.call();
    assert.strictEqual(decimals.toNumber(), 1);

    const symbol = await HST.symbol.call();
    assert.strictEqual(symbol, 'GRV');
  });

  it('creation: should succeed in creating over 2^256 - 1 (max) tokens', async () => {
    // 2^256 - 1
    const HST2 = await EIP20Abstraction.new({ from: accounts[0] });
    const totalSupply = await HST2.totalSupply();
    const match = totalSupply.equals('1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77');
    assert.strictEqual(match, false, 'result is not correct');
  });

  // TRANSERS
  // normal transfers without approvals
  it('transfers: ether transfer should be reversed.', async () => {
    const balanceBefore = await HST.balanceOf.call(accounts[0]);
    assert.strictEqual(balanceBefore.toNumber(), inital_value);

    await assertRevert(new Promise((resolve, reject) => {
      web3.eth.sendTransaction({ from: accounts[0], to: HST.address, value: web3.toWei('10', 'Ether') }, (err, res) => {
        if (err) { reject(err); }
        resolve(res);
      });
    }));

    const balanceAfter = await HST.balanceOf.call(accounts[0]);
    assert.strictEqual(balanceAfter.toNumber(), inital_value);
  });

  it('transfers: should transfer 200000000 to accounts[1] with accounts[0] having inital_value (200000000)', async () => {
    await HST.transfer(accounts[1], inital_value, { from: accounts[0] });
    const balance = await HST.balanceOf.call(accounts[1]);
    assert.strictEqual(balance.toNumber(), inital_value);
  });
  
  

  it('transfers: should fail when trying to transfer inital_value + 1 to accounts[1] with accounts[0] having 200000000', async () => {
    await assertRevert(HST.transfer.call(accounts[1], (inital_value + 1), { from: accounts[0] }));
  });

  it('transfers: should handle zero-transfers normally', async () => {
    assert(await HST.transfer.call(accounts[1], 0, { from: accounts[0] }), 'zero-transfer has failed');
  });

  // NOTE: testing uint256 wrapping is impossible since you can't supply > 2^256 -1
  // todo: transfer max amounts

  // APPROVALS
  it('approvals: msg.sender should approve 100 to accounts[1]', async () => {
    await HST.approve(accounts[1], 100, { from: accounts[0] });
    const allowance = await HST.allowance.call(accounts[0], accounts[1]);
    assert.strictEqual(allowance.toNumber(), 100);
  });

  // bit overkill. But is for testing a bug
  it('approvals: msg.sender approves accounts[1] of 100 & withdraws 20 once.', async () => {
    const balance0 = await HST.balanceOf.call(accounts[0]);
    assert.strictEqual(balance0.toNumber(), inital_value);

    await HST.approve(accounts[1], 100, { from: accounts[0] }); // 100
    const balance2 = await HST.balanceOf.call(accounts[2]);
    assert.strictEqual(balance2.toNumber(), 0, 'balance2 not correct');

    await HST.transferFrom.call(accounts[0], accounts[2], 20, { from: accounts[1] });
    await HST.allowance.call(accounts[0], accounts[1]);
    await HST.transferFrom(accounts[0], accounts[2], 20, { from: accounts[1] }); // -20
    const allowance01 = await HST.allowance.call(accounts[0], accounts[1]);
    assert.strictEqual(allowance01.toNumber(), 80); // =80

    const balance22 = await HST.balanceOf.call(accounts[2]);
    assert.strictEqual(balance22.toNumber(), 20);

    const balance02 = await HST.balanceOf.call(accounts[0]);
    assert.strictEqual(balance02.toNumber(), 2499980);
  });

  // should approve 100 of msg.sender & withdraw 50, twice. (should succeed)
  it('approvals: msg.sender approves accounts[1] of 100 & withdraws 20 twice.', async () => {
    await HST.approve(accounts[1], 100, { from: accounts[0] });
    const allowance01 = await HST.allowance.call(accounts[0], accounts[1]);
    assert.strictEqual(allowance01.toNumber(), 100);

    await HST.transferFrom(accounts[0], accounts[2], 20, { from: accounts[1] });
    const allowance012 = await HST.allowance.call(accounts[0], accounts[1]);
    assert.strictEqual(allowance012.toNumber(), 80);

    const balance2 = await HST.balanceOf.call(accounts[2]);
    assert.strictEqual(balance2.toNumber(), 20);

    const balance0 = await HST.balanceOf.call(accounts[0]);
    assert.strictEqual(balance0.toNumber(), 2499980);

    // FIRST tx done.
    // onto next.
    await HST.transferFrom(accounts[0], accounts[2], 20, { from: accounts[1] });
    const allowance013 = await HST.allowance.call(accounts[0], accounts[1]);
    assert.strictEqual(allowance013.toNumber(), 60);

    const balance22 = await HST.balanceOf.call(accounts[2]);
    assert.strictEqual(balance22.toNumber(), 40);

    const balance02 = await HST.balanceOf.call(accounts[0]);
    assert.strictEqual(balance02.toNumber(), 2499960);
  });

  // should approve 100 of msg.sender & withdraw 50 & 60 (should fail).
  it('approvals: msg.sender approves accounts[1] of 100 & withdraws 50 & 60 (2nd tx should fail)', async () => {
    await HST.approve(accounts[1], 100, { from: accounts[0] });
    const allowance01 = await HST.allowance.call(accounts[0], accounts[1]);
    assert.strictEqual(allowance01.toNumber(), 100);

    await HST.transferFrom(accounts[0], accounts[2], 50, { from: accounts[1] });
    const allowance012 = await HST.allowance.call(accounts[0], accounts[1]);
    assert.strictEqual(allowance012.toNumber(), 50);

    const balance2 = await HST.balanceOf.call(accounts[2]);
    assert.strictEqual(balance2.toNumber(), 50);

    const balance0 = await HST.balanceOf.call(accounts[0]);
    assert.strictEqual(balance0.toNumber(), 2499950);

    // FIRST tx done.
    // onto next.
    await assertRevert(HST.transferFrom.call(accounts[0], accounts[2], 60, { from: accounts[1] }));
  });

  it('approvals: attempt withdrawal from account with no allowance (should fail)', async () => {
    await assertRevert(HST.transferFrom.call(accounts[0], accounts[2], 60, { from: accounts[1] }));
  });

  it('approvals: allow accounts[1] 100 to withdraw from accounts[0]. Withdraw 60 and then approve 0 & attempt transfer.', async () => {
    await HST.approve(accounts[1], 100, { from: accounts[0] });
    await HST.transferFrom(accounts[0], accounts[2], 60, { from: accounts[1] });
    await HST.approve(accounts[1], 0, { from: accounts[0] });
    await assertRevert(HST.transferFrom.call(accounts[0], accounts[2], 10, { from: accounts[1] }));
  });

  it('approvals: approve max (2^256 - 1)', async () => {
    await HST.approve(accounts[1], '115792089237316195423570985008687907853269984665640564039457584007913129639935', { from: accounts[0] });
    const allowance = await HST.allowance(accounts[0], accounts[1]);
    assert(allowance.equals('1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77'));
  });

  // should approve max of msg.sender & withdraw 20 without changing allowance (should succeed).
  it('approvals: msg.sender approves accounts[1] of max (2^256 - 1) & withdraws 20', async () => {
    const balance0 = await HST.balanceOf.call(accounts[0]);
    assert.strictEqual(balance0.toNumber(), inital_value);

    const max = '1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77';
    await HST.approve(accounts[1], max, { from: accounts[0] });
    const balance2 = await HST.balanceOf.call(accounts[2]);
    assert.strictEqual(balance2.toNumber(), 0, 'balance2 not correct');

    await HST.transferFrom(accounts[0], accounts[2], 20, { from: accounts[1] });
    const allowance01 = await HST.allowance.call(accounts[0], accounts[1]);
    assert(allowance01.equals(max),'twrr');

    const balance22 = await HST.balanceOf.call(accounts[2]);
    assert.strictEqual(balance22.toNumber(), 20);

    const balance02 = await HST.balanceOf.call(accounts[0]);
    console.log("balance02.toNumber() = " + balance02.toNumber());
    assert.strictEqual(balance02.toNumber(), 2499980);
  });

});