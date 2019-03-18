/**
 * WARNING! TO RUN THIS TEST YOU NEED TO CHANGE THE VARIABLES timeHoldTeam AND timeHoldAdvisor
 * TO 2 SECONDS.
 */

const { assertRevert } = require("../helpers/assertRevert");
//const { assertRevert } = require("../../node_modules/zeppelin-solidity/test/helpers/assertRevert");
const GRVToken = artifacts.require("./GRVToken.sol");
const GRVCrowdsale = artifacts.require("GRVCrowdsale");
let grvcrowdsale;
let bigNumber = 1.157920892373161954235709850086879078532691231984665640564039457584007913129639935e77;
let notAccount = "0xas4TE55b5e8cD1200C55c22d5A8C455837053bDX";
let oneDay = 86400;

/* Constants used by the tests */
const TOKEN_OF_THE_TEAM = 12500000;
const TOKEN_OF_THE_ADVISOR = 6666667;
const TOKEN_OF_THE_AIRDROP = 1666667;
const TOKEN_OF_THE_SALE = 20833386;
const INITIAL_SUPPLY =
  TOKEN_OF_THE_TEAM + TOKEN_OF_THE_ADVISOR + TOKEN_OF_THE_AIRDROP;

contract("GRVCrowdsale", accounts => {
  const owner = accounts[0];
  const walletTeam = accounts[1];
  const walletAdvisor = accounts[2];
  const walletAirdrop = accounts[3];

  const openingTime = web3.eth.getBlock("latest").timestamp;
  //const rate = new BigNumber(1);
  const rate = new web3.BigNumber(web3.toWei(0.0005, "ether"));
  // FIXME: update currente value
  const oneTokenInWei = new web3.BigNumber(web3.toWei(0.0005, "ether"));
  //[20836667,20843333,20846666]
  // FIXME: update values block
  //const blocks = [20833354, 20833365, 20833386];
  const blocks = [20833354, 20833365, 20833386];
  // FIXME: add new array to price of the blockIndex
  const blocksPrice = [50, 60, 70];

  function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if (new Date().getTime() - start > milliseconds) {
        break;
      }
    }
  }

  /**
   * Deploying the contract
   */
  beforeEach(async () => {
    grvtoken = await GRVToken.new({ from: accounts[0] });
    grvcrowdsale = await GRVCrowdsale.new(
      rate,
      owner,
      grvtoken.address,
      walletTeam,
      walletAdvisor,
      walletAirdrop,
      oneTokenInWei,
      openingTime,
      blocks,
      blocksPrice,
      {
        from: accounts[0]
      }
    );
    // transfer ownership of the grvtoken

    // Alterei de await grvtoken.transferOwnership.call() -> o call estava dando erro
    await grvtoken.transferOwnership(grvcrowdsale.address, {
      from: accounts[0]
    });
  });

  describe("Withdraw", () => {
    it("Team", async () => {
      await grvcrowdsale.preAllocate();
      sleep(2000);
      await grvcrowdsale.withdrawTeam({ from: accounts[0] });
      let value = await grvtoken.balanceOf(accounts[1]);
      assert.strictEqual(
        value.toNumber(),
        TOKEN_OF_THE_TEAM,
        "Wrong withdraw."
      );
    });

    it("Advisor", async () => {
      await grvcrowdsale.preAllocate();
      sleep(2000);
      await grvcrowdsale.withdrawAdvisor({ from: accounts[0] });
      let value = await grvtoken.balanceOf(accounts[2]);
      assert.strictEqual(
        value.toNumber(),
        TOKEN_OF_THE_ADVISOR,
        "Wrong withdraw."
      );
    });
  });
});
