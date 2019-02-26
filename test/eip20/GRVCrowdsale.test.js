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

  function ether(n) {
    return new web3.BigNumber(web3.toWei(n, "ether"));
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
      from: owner
    });
  });

  /**
   * Testing if all initial values are initialized as expected.
   */
  describe("Initial values", () => {
    /**
     * Verifying if the contract owner is really this account
     */
    it("Verifying contract owner", async () => {
      // Getting the contract owner registered
      let actualOwner = await grvcrowdsale.owner();
      // Asserting that account[0] == owner
      assert.strictEqual(actualOwner, owner, "Wrong initial owner");

      // Transfering ownership
      await grvcrowdsale.transferOwnership(accounts[1], {
        from: owner
      });

      actualOwner = await grvcrowdsale.owner();
      assert.strictEqual(actualOwner, accounts[1], "Wrong second owner");

      // Transfering ownership
      await grvcrowdsale.transferOwnership(accounts[2], {
        from: accounts[1]
      });
      actualOwner = await grvcrowdsale.owner();
      assert.strictEqual(actualOwner, accounts[2], "Wrong third owner");

      // Transfering ownership
      await grvcrowdsale.renounceOwnership({ from: accounts[2] });
      actualOwner = await grvcrowdsale.owner();
      assert.strictEqual(
        actualOwner,
        "0x0000000000000000000000000000000000000000",
        "Wrong empty owner"
      );
    });

    /**
     * Verifying timeHoldTeam
     */
    it("Verifying timeHoldTeam", async () => {
      let timeHoldTeam = oneDay * 2 + openingTime;
      let value = await grvcrowdsale.timeHoldTeam();
      assert.strictEqual(value.toNumber(), timeHoldTeam);
    });

    /**
     * Verifying timeHoldAdvisor
     */
    it("Verifying timeHoldAdvisor", async () => {
      let timeHoldAdvisor = oneDay + openingTime;
      let value = await grvcrowdsale.timeHoldAdvisor();
      assert.strictEqual(value.toNumber(), timeHoldAdvisor);
    });

    /**
     * Verifying if the owner wallet is really this account
     */
    it("Verifying owner wallet", async () => {
      let wallet = await grvcrowdsale.wallet.call();
      assert.strictEqual(accounts[0], wallet);

      // Transfering ownership
      await grvcrowdsale.transferOwnership(accounts[1], {
        from: owner
      });

      wallet = await grvcrowdsale.wallet.call();
      assert.strictEqual(accounts[0], wallet);
    });

    /**
     * Verifying if the team wallet is really this account
     */
    it("Verifying team wallet", async () => {
      let wallet = await grvcrowdsale.walletTeam.call();
      assert.strictEqual(accounts[1], wallet);
    });

    /**
     * Verifying if the advisor wallet is really this account
     */
    it("Verifying advisor wallet", async () => {
      let wallet = await grvcrowdsale.walletAdvisor.call();
      assert.strictEqual(accounts[2], wallet);
    });

    /**
     * Verifying if the airdrop wallet is really this account
     */
    it("Verifying airdrop wallet", async () => {
      let wallet = await grvcrowdsale.walletAirdrop.call();
      assert.strictEqual(accounts[3], wallet);
    });

    /**
     * Verifying the initial value of Total Initial Supply variable
     */
    it("Verifying Total Initial Supply", async () => {
      let initialSupply = await grvcrowdsale.totalInitialSupply.call();
      let expected = INITIAL_SUPPLY + TOKEN_OF_THE_SALE;
      assert.strictEqual(expected, initialSupply.toNumber());
    });

    /**
     * Verifying the initial value of Initial Supply variable
     */
    it("Verifying Initial Supply", async () => {
      let value = await grvcrowdsale.INITIAL_SUPPLY.call();
      assert.strictEqual(INITIAL_SUPPLY, value.toNumber());
    });

    /**
     * Verifying the initial value of tokens sold
     */
    it("Verifying Tokens sold", async () => {
      let value = await grvcrowdsale.tokensSold.call();
      assert.strictEqual(0, value.toNumber());
    });

    /**
     * Verifying the initial tokens of owner wallet
     */
    it("Verifying initial Tokens of the owner", async () => {
      //Initializing contract
      let isInitialized = await grvcrowdsale.preAllocate.call({
        from: accounts[0]
      });
      assert.strictEqual(isInitialized, true);

      let value = await grvtoken.balanceOf(accounts[0]);
      assert.strictEqual(value.toNumber(), INITIAL_SUPPLY);
    });

    /**
     * Verifying the predefined initial tokens of team wallet
     */
    it("Verifying predefined Token of the team", async () => {
      let value = await grvcrowdsale.TOKEN_OF_THE_TEAM.call();
      assert.strictEqual(TOKEN_OF_THE_TEAM, value.toNumber());
    });

    /**
     * Verifying the predefined initial tokens of sale
     */
    it("Verifying predefined Token of the sale", async () => {
      let value = await grvcrowdsale.TOKEN_OF_THE_SALE.call();
      assert.strictEqual(TOKEN_OF_THE_SALE, value.toNumber());
    });

    /**
     * Verifying the predefined initial tokens of airdrop wallet
     */
    it("Verifying predefined Token of the airdrop", async () => {
      let value = await grvcrowdsale.TOKEN_OF_THE_AIRDROP.call();
      assert.strictEqual(TOKEN_OF_THE_AIRDROP, value.toNumber());
    });

    /**
     * Verifying the predefined initial tokens of advisor wallet
     */
    it("Verifying predefined Token of the advisor", async () => {
      let value = await grvcrowdsale.TOKEN_OF_THE_ADVISOR.call();
      assert.strictEqual(TOKEN_OF_THE_ADVISOR, value.toNumber());
    });

    /**
     * Verifying address of GRVCToken contract
     */
    it("Verifying Token address", async () => {
      let value = await grvcrowdsale.token.call();
      assert.strictEqual(grvtoken.address, value);
    });

    /**
     * Verifying the initial state value (Unknown)
     */
    it("Verifying State", async () => {
      let value = await grvcrowdsale.state.call();
      assert.strictEqual(0, value.toNumber());
    });

    /**
     * Verifying the initial rate value
     */
    it("Verifying Rate", async () => {
      let value = await grvcrowdsale.rate.call();
      assert.strictEqual(rate.toNumber(), value.toNumber());
    });

    /**
     * Verifying if the contract it's not paused
     */
    it("Verifying Paused", async () => {
      let value = await grvcrowdsale.paused.call();
      assert.strictEqual(false, value);
    });

    /**
     * Verifying the initial openingTime value
     */
    it("Verifying Opening Time", async () => {
      let value = await grvcrowdsale.openingTime.call();
      assert.strictEqual(openingTime, value.toNumber());
    });

    /**
     * Verifying the initial oneTokenInWei value
     */
    it("Verifying One Token In Wei", async () => {
      let value = await grvcrowdsale.oneTokenInWei.call();
      assert.strictEqual(oneTokenInWei.toNumber(), value.toNumber());
    });

    /**
     * Verifying the initial max blocks value
     */
    it("Verifying Max Blocks Crowdsale", async () => {
      let value = await grvcrowdsale.MAX_BLOCKS_CROWDSALE.call();
      assert.strictEqual(3, value.toNumber());
    });

    /**
     * Verifying the investor count rate value
     */
    it("Verifying Investor Count", async () => {
      let value = await grvcrowdsale.investorCount.call();
      assert.strictEqual(0, value.toNumber());

      await grvcrowdsale.buyTokens(accounts[5], {
        from: accounts[5],
        value: web3.toWei(0.0005, "ether")
      });

      await grvcrowdsale.buyTokens(accounts[4], {
        from: accounts[5],
        value: web3.toWei(0.0005, "ether")
      });

      await grvcrowdsale.buyTokens(accounts[7], {
        from: accounts[5],
        value: web3.toWei(0.0005, "ether")
      });

      await grvcrowdsale.buyTokens(accounts[6], {
        from: accounts[5],
        value: web3.toWei(0.0005, "ether")
      });

      value = await grvcrowdsale.investorCount.call();
      assert.strictEqual(4, value.toNumber());
    });

    /**
     * Verifying the initial token left value from the first block
     */
    it("Verifying getTokenLeft", async () => {
      let value = await grvcrowdsale.getTokenLeft.call();
      assert.strictEqual(blocks[0], value.toNumber());
    });

    /**
     * Verifying if the current (initial) block is the 0
     */
    it("Verifying currentBlock", async () => {
      let value = await grvcrowdsale.currentBlock.call();
      assert.strictEqual(0, value.toNumber());
    });

    /**
     * Verifying State after preAllocate
     */
    it("Verifying state", async () => {
        // inicializa o contrato alocando os valores para o team, advisor, airdrop ...
        let isInitialize = await grvcrowdsale.preAllocate.call({ from: owner });
        assert.strictEqual(isInitialize, true, "Error, preAllocate not executed.");

        // Getting state value, shoud be 2 {Active}
        let state = await grvcrowdsale.state();
        assert.strictEqual(state.toNumber(), 2, "Wrong state value after preAllocate.");
    });
  });

  /**
   * Testing the tokenAmountOf function
   */
  describe("Function tokenAmountOf", () => {
    /**
     * Verifying the token amount of account 5.
     */
    it("Verifying account 5 wallet", async () => {
      let value = await grvcrowdsale.tokenAmountOf(accounts[5]);
      assert.strictEqual(value.toNumber(), 0, "Wrong initial token amount");

      // Buying tokens
      await grvcrowdsale.buyTokens(accounts[5], {
        from: accounts[5],
        value: web3.toWei(0.0005, "ether")
      });

      // Asserting token amount
      value = await grvcrowdsale.tokenAmountOf(accounts[5]);
      assert.strictEqual(value.toNumber(), 2, "Wrong second token amount");

      // Buying tokens
      await grvcrowdsale.buyTokens(accounts[5], {
        from: accounts[5],
        value: web3.toWei(0.0005, "ether")
      });

      // Asserting token amount
      value = await grvcrowdsale.tokenAmountOf(accounts[5]);
      assert.strictEqual(value.toNumber(), 4, "Wrong third token amount");

      await grvtoken.transfer(accounts[6], 1, { from: accounts[5] });

      // Asserting account balance
      value = await grvtoken.balanceOf(accounts[5]);
      assert.strictEqual(value.toNumber(), 3, "Wrong account balance");

      // Asserting token amount
      value = await grvcrowdsale.tokenAmountOf(accounts[5]);
      assert.strictEqual(value.toNumber(), 4, "Wrong last token amount");
    });

    /**
     * Testing the function with the function with an invalid account.
     */
    it("Testing with an invalid account (shouldn't work)", async () => {
      assertRevert(grvcrowdsale.tokenAmountOf("fasdasd13f2d2dasfasd"));
    });
  });

  /**
   * Testing the weiRaised function
   */
  describe("Function weiRaised", () => {
    /**
     * Verifying weiRaised from 3 accounts
     */
    it("Verifying weiRaised from 3 accounts", async () => {
      let weiRaised = 0;
      // Verifying initial weiRaised
      let value = await grvcrowdsale.tokenAmountOf(accounts[5]);
      assert.strictEqual(
        value.toNumber(),
        weiRaised,
        "Wrong initial weiRaised"
      );

      // Buying tokens
      let invested = web3.toWei(0.001, "ether");
      weiRaised += parseInt(invested);
      await grvcrowdsale.buyTokens(accounts[5], {
        from: accounts[5],
        value: invested
      });

      // Asserting wei raised
      value = await grvcrowdsale.weiRaised();
      assert.strictEqual(value.toNumber(), weiRaised, "Wrong second weiRaised");

      // Buying tokens
      invested = web3.toWei(0.0005, "ether");
      weiRaised += parseInt(invested);
      await grvcrowdsale.buyTokens(accounts[6], {
        from: accounts[6],
        value: invested
      });

      // Asserting wei raised
      value = await grvcrowdsale.weiRaised();
      assert.strictEqual(value.toNumber(), weiRaised, "Wrong third weiRaised");

      // Buying tokens
      invested = web3.toWei(0.00025, "ether");
      weiRaised += parseInt(invested);
      await grvcrowdsale.buyTokens(accounts[7], {
        from: accounts[7],
        value: invested
      });

      // Asserting wei raised
      value = await grvcrowdsale.weiRaised();
      assert.strictEqual(value.toNumber(), weiRaised, "Wrong last weiRaised");
    });
  });

  /**
   * Testing investedAmountOf function
   */
  describe("Function investedAmountOf", () => {
    /**
     * Verifying the invested amount of owner account.
     * Should be zero initially
     */
    it("Verifying owner account", async () => {
      let value = await grvcrowdsale.investedAmountOf(owner);
      assert.strictEqual(
        0,
        value.toNumber(),
        "Wrong initial invested amount owner"
      );

      let invested = web3.toWei(0.005, "ether");
      await grvcrowdsale.buyTokens(owner, {
        from: owner,
        value: invested
      });
      value = await grvcrowdsale.investedAmountOf(owner);
      assert.strictEqual(
        value.toNumber(),
        parseInt(invested),
        "Wrong invested amount owner"
      );
    });

    /**
     * Verifying the invested amount of team account.
     */
    it("Verifying team account", async () => {
      let value = await grvcrowdsale.investedAmountOf(accounts[1]);
      assert.strictEqual(
        0,
        value.toNumber(),
        "Wrong initial invested amount 1"
      );

      let invested = web3.toWei(0.0005, "ether");
      await grvcrowdsale.buyTokens(accounts[1], {
        from: accounts[1],
        value: invested
      });
      value = await grvcrowdsale.investedAmountOf(accounts[1]);
      assert.strictEqual(
        value.toNumber(),
        parseInt(invested),
        "Wrong invested amount 1"
      );
    });

    /**
     * Verifying the invested amount of advisor account.
     */
    it("Verifying advisor account", async () => {
      let value = await grvcrowdsale.investedAmountOf(accounts[2]);
      assert.strictEqual(
        0,
        value.toNumber(),
        "Wrong initial invested amount 2"
      );

      let invested = web3.toWei(0.00025, "ether");
      await grvcrowdsale.buyTokens(accounts[2], {
        from: accounts[2],
        value: invested
      });
      value = await grvcrowdsale.investedAmountOf(accounts[2]);
      assert.strictEqual(
        value.toNumber(),
        parseInt(invested),
        "Wrong invested amount 2"
      );
    });

    /**
     * Verifying the invested amount of airdrop account.
     */
    it("Verifying airdrop account", async () => {
      let value = await grvcrowdsale.investedAmountOf(accounts[3]);
      assert.strictEqual(
        0,
        value.toNumber(),
        "Wrong initial invested amount 3"
      );

      let invested = web3.toWei(0.0025, "ether");
      await grvcrowdsale.buyTokens(accounts[3], {
        from: accounts[3],
        value: invested
      });
      value = await grvcrowdsale.investedAmountOf(accounts[3]);
      assert.strictEqual(
        value.toNumber(),
        parseInt(invested),
        "Wrong invested amount 3"
      );
    });

    /**
     * Testing the function with an invalid account
     */
    it("Testing with an invalid account (shouldn't work)", async () => {
      assertRevert(grvcrowdsale.investedAmountOf(notAccount));
    });
  });

  /**
   * Testing the blocksPrice function
   */
  describe("Function blocksPrice", () => {
    /**
     * Verifying the predefined initial value of block 0
     */
    it("Block 0", async () => {
      let value = await grvcrowdsale.blocksPrice.call(0);
      assert.strictEqual(blocksPrice[0], value.toNumber());
    });

    /**
     * Verifying the predefined initial value of block 1
     */
    it("Block 1", async () => {
      let value = await grvcrowdsale.blocksPrice.call(1);
      assert.strictEqual(blocksPrice[1], value.toNumber());
    });

    /**
     * Verifying the predefined initial value of block 2
     */
    it("Block 2", async () => {
      let value = await grvcrowdsale.blocksPrice.call(2);
      assert.strictEqual(blocksPrice[2], value.toNumber());
    });

    /**
     * Verifying invalid block number
     */
    it("Block -1 (invalid opcode)", async () => {
      try {
        await grvcrowdsale.blocksPrice.call(-1);
        console.error("Error, block -1 don't exists");
      } catch (e) {}
    });

    /**
     * Verifying invalid block number
     */
    it("Block bigNumber (invalid opcode)", async () => {
      try {
        await grvcrowdsale.blocksPrice.call(bigNumber);
        console.error("Error, this block don't exists");
      } catch (e) {}
    });

    /**
     * Verifying invalid block number
     */
    it("Block 3 (invalid opcode)", async () => {
      try {
        await grvcrowdsale.blocksPrice.call(3);
        console.error("Error, block 3 don't exists");
      } catch (e) {}
    });
  });

  /**
   * Testing blocks function
   */
  describe("Function blocks", () => {
    /**
     * Verifying the predefined initial tokens of block 0
     */
    it("Block 0", async () => {
      let value = await grvcrowdsale.blocks.call(0);
      assert.strictEqual(blocks[0], value.toNumber());
    });

    /**
     * Verifying the predefined initial tokens of block 1
     */
    it("Block 1", async () => {
      let value = await grvcrowdsale.blocks.call(1);
      assert.strictEqual(blocks[1], value.toNumber());
    });

    /**
     * Verifying the predefined initial tokens of block 2
     */
    it("Block 2", async () => {
      let value = await grvcrowdsale.blocks.call(2);
      assert.strictEqual(blocks[2], value.toNumber());
    });

    it("Continuous sale", async () => {
      const purchaser = accounts[5];
      let amountTokenSale = 0;
      // verifica o owner
      let newOwner = await grvtoken.owner.call();
      assert.strictEqual(
        grvcrowdsale.address,
        newOwner,
        "TransferOwnership of the GRVToken fail"
      );
      // inicializa o contrato alocando os valores para o team, advisor, airdrop ...
      let isInitialize = await grvcrowdsale.preAllocate.call({ from: owner });
      assert.strictEqual(isInitialize, true);
      // verifica o block corrente = 0
      let currentBlock = await grvcrowdsale.currentBlock.call();
      assert.strictEqual(
        currentBlock.toNumber(),
        0,
        "Expected current block fail 0"
      );

      // identifica todos os tokens restantes do primeiro bloco
      let tokenLeft = await grvcrowdsale.getTokenLeft.call();
      let expectedTokenLeft = blocks[currentBlock.toNumber()] - INITIAL_SUPPLY;
      assert.strictEqual(
        tokenLeft.toNumber(),
        expectedTokenLeft,
        "Expected token left fail 0"
      );

      // verifica o preco corrente
      let currentRate = await grvcrowdsale.getCurrentRate.call();
      let expectedCurrentRate =
        (blocksPrice[currentBlock.toNumber()] * oneTokenInWei) / 100;
      assert.strictEqual(
        currentRate.toNumber(),
        expectedCurrentRate,
        "Expected current rate fail"
      );

      // verifica se a quantidade de token corresponde ao valor enviado .
      let beforeSaleBalance = await grvtoken.balanceOf.call(purchaser);
      const emptyValue = 0;
      assert.strictEqual(
        beforeSaleBalance.toNumber(),
        emptyValue,
        "Before Sale Balance fail"
      );
      // investidor compra todos os GRVCs do bloco
      await grvcrowdsale.sendTransaction({
        value: expectedTokenLeft * expectedCurrentRate,
        from: purchaser
      });
      amountTokenSale += expectedTokenLeft;
      // verifica se a quantidade de token corresponde ao valor enviado .
      let afterSaleBalance = await grvtoken.balanceOf.call(purchaser);
      assert.strictEqual(
        afterSaleBalance.toNumber(),
        amountTokenSale,
        "After Sale Balance fail"
      );

      // verifica se bloco corrente agora = 1
      currentBlock = await grvcrowdsale.currentBlock.call();
      assert.strictEqual(
        currentBlock.toNumber(),
        1,
        "Expected current block fail"
      );

      // identifica todos os tokens restantes do segundo bloco
      tokenLeft = await grvcrowdsale.getTokenLeft.call();
      expectedTokenLeft =
        blocks[currentBlock.toNumber()] - blocks[currentBlock.toNumber() - 1];
      assert.strictEqual(
        tokenLeft.toNumber(),
        expectedTokenLeft,
        "Expected token left fail 1"
      );

      // verifica o preco corrente
      currentRate = await grvcrowdsale.getCurrentRate.call();
      expectedCurrentRate =
        (blocksPrice[currentBlock.toNumber()] * oneTokenInWei) / 100;
      assert.strictEqual(
        currentRate.toNumber(),
        expectedCurrentRate,
        "Expected current rate fail"
      );

      // investidor compra todos os GRVCs do segundo bloco
      await grvcrowdsale.sendTransaction({
        value: expectedTokenLeft * expectedCurrentRate,
        from: purchaser
      });
      amountTokenSale += expectedTokenLeft;

      // verifica se a quantidade de token corresponde ao valor enviado .
      afterSaleBalance = await grvtoken.balanceOf.call(purchaser);
      assert.strictEqual(
        afterSaleBalance.toNumber(),
        amountTokenSale,
        "After Sale Balance fail"
      );

      // verifica se bloco corrente agora = 2
      currentBlock = await grvcrowdsale.currentBlock.call();
      assert.strictEqual(
        currentBlock.toNumber(),
        2,
        "Expected current block fail"
      );

      // identifica todos os tokens restantes do primeiro bloco
      tokenLeft = await grvcrowdsale.getTokenLeft.call();
      expectedTokenLeft = blocks[currentBlock.toNumber()] - INITIAL_SUPPLY;
      assert.strictEqual(
        tokenLeft.toNumber(),
        expectedTokenLeft,
        "Expected token left fail 2"
      );

      // verifica o preco corrente
      currentRate = await grvcrowdsale.getCurrentRate.call();
      expectedCurrentRate =
        (blocksPrice[currentBlock.toNumber()] * oneTokenInWei) / 100;
      assert.strictEqual(
        currentRate.toNumber(),
        expectedCurrentRate,
        "Expected current rate fail"
      );

      // investidor compra todos os GRVCs do bloco
      await grvcrowdsale.sendTransaction({
        value: expectedTokenLeft * expectedCurrentRate,
        from: purchaser
      });
      amountTokenSale += expectedTokenLeft;
      // verifica se a quantidade de token corresponde ao valor enviado .
      afterSaleBalance = await grvtoken.balanceOf.call(purchaser);
      assert.strictEqual(
        afterSaleBalance.toNumber(),
        amountTokenSale,
        "After Sale Balance fail"
      );

      // verifica se o bloco corrente agora = 3
      currentBlock = await grvcrowdsale.currentBlock.call();
      assert.strictEqual(
        currentBlock.toNumber(),
        3,
        "Expected current block fail"
      );

      // verifica o preco corrente. Deve ser preço cheio pois não existem mais blocos (currentBlock == MAX_BLOCKS_CROWDSALE)
      currentRate = await grvcrowdsale.getCurrentRate.call();
      expectedCurrentRate = oneTokenInWei;
      assert.strictEqual(
        currentRate.toNumber(),
        expectedCurrentRate,
        "Expected current rate fail"
      );

      // investidor compra 1 eth em GRVC. O valor de cado GRVC deve ser cheio, sem deconto.
      let valueFullPrice = 10;
      let fullPrice = 0.0005;
      await grvcrowdsale.sendTransaction({
        value: web3.toWei(valueFullPrice, "ether"),
        from: purchaser
      });
      amountTokenSale += valueFullPrice / fullPrice; //2000;
      // verifica se a quantidade de token corresponde ao valor enviado .
      afterSaleBalance = await grvtoken.balanceOf.call(purchaser);
      assert.strictEqual(
        afterSaleBalance.toNumber(),
        amountTokenSale,
        "After Sale Balance fail"
      );
    });
  });

  /**
   * Testing withdraws
   */

  describe("Function withdraw", () => {
    it("Function withdrawTeam only after 2 predetermined period", async () => {
      //Initializing contract
      let isInitialized = await grvcrowdsale.preAllocate.call({ from: owner });
      assert.strictEqual(isInitialized, true);

      // Getting the team wallet balance
      let teamWallet = await grvtoken.balanceOf(walletTeam);
      assert.strictEqual(
        teamWallet.toNumber(),
        0,
        "Wrong initial team balance."
      );

      // Trying to withdraw team
      assertRevert(grvcrowdsale.withdrawTeam({ from: owner }));
    });

    it("Function withdrawAdvisor only after predetermined period", async () => {
      //Initializing contract
      let isInitialized = await grvcrowdsale.preAllocate.call({ from: owner });
      assert.strictEqual(isInitialized, true);

      // Getting the team wallet balance
      let advisorWallet = await grvtoken.balanceOf(walletAdvisor);
      assert.strictEqual(
        advisorWallet.toNumber(),
        0,
        "Wrong initial advisor balance."
      );

      // Trying to withdraw advisor
      assertRevert(grvcrowdsale.withdrawAdvisor({ from: owner }));
    });
  });

  /**
   * Testing buyToken
   */
  describe("Function buyTokens", () => {
    // The real value of the token based on zero block discount
    let fullPrice = (0.0005 * blocksPrice[0]) / 100;

    it("Buy 2 tokens", async () => {
      //Initializing contract
      let isInitialized = await grvcrowdsale.preAllocate.call({ from: owner });
      assert.strictEqual(isInitialized, true);

      // The value in ether to send to contract
      let valueFullPrice = 0.0005;
      // Sending the value to contract
      await grvcrowdsale.buyTokens(accounts[5], {
        value: web3.toWei(valueFullPrice, "ether"),
        from: accounts[5]
      });
      // Calculating the expected token amount returned
      let amountTokenSale = valueFullPrice / fullPrice;

      // Verify if the token amount received is right
      afterSaleBalance = await grvtoken.balanceOf.call(accounts[5]);
      assert.strictEqual(
        afterSaleBalance.toNumber(),
        amountTokenSale,
        "After Sale Balance fail"
      );
    });

    it("Forcing underflow", async () => {
      //Initializing contract
      let isInitialized = await grvcrowdsale.preAllocate.call({ from: owner });
      assert.strictEqual(isInitialized, true);

      // The value in ether to send to contract
      let valueFullPrice = 0.0000000000000000000000000001;
      // Sending the value to contract
      assertRevert(
        grvcrowdsale.buyTokens(accounts[5], {
          value: web3.toWei(valueFullPrice, "ether"),
          from: accounts[5]
        })
      );
    });

    it("Buy 0 tokens (revert)", async () => {
      //Initializing contract
      let isInitialized = await grvcrowdsale.preAllocate.call({ from: owner });
      assert.strictEqual(isInitialized, true);

      // The value in ether to send to contract
      let valueFullPrice = 0;
      // Sending the value to contract
      assertRevert(
        grvcrowdsale.buyTokens(accounts[5], {
          value: web3.toWei(valueFullPrice, "ether"),
          from: accounts[5]
        })
      );
    });

    it("Buy tokens without having the ether amount given", async () => {
      //Initializing contract
      let isInitialized = await grvcrowdsale.preAllocate.call({ from: owner });
      assert.strictEqual(isInitialized, true);

      // The value in ether to send to contract
      let valueFullPrice = 200;
      // Sending the value to contract
      try {
        await grvcrowdsale.buyTokens(accounts[5], {
          value: web3.toWei(valueFullPrice, "ether"),
          from: accounts[5]
        });
        // Calculating the expected token amount returned
        let amountTokenSale = valueFullPrice / fullPrice;

        // Verify if the token amount received is right
        afterSaleBalance = await grvtoken.balanceOf.call(accounts[5]);
        assert.strictEqual(
          afterSaleBalance.toNumber(),
          amountTokenSale,
          "After Sale Balance fail"
        );
      } catch (error) {
        assert(
          error.message.startsWith(
            "sender doesn't have enough funds to send tx."
          ),
          "Sender doesn't have enough funds to send tx."
        );
      }
    });
  });

  /**
   * Testing pause function
   */
  describe("Function pause", () => {
    it("Trying to pause with normal account", async () => {
      //Initializing contract
      let isInitialized = await grvcrowdsale.preAllocate.call({
        from: accounts[0]
      });
      assert.strictEqual(isInitialized, true);

      // Trying to pause contract
      assertRevert(grvcrowdsale.pause({ from: accounts[6] }));
    });

    it("Pausing with owner and unpausing with not owner", async () => {
      //Initializing contract
      let isInitialized = await grvcrowdsale.preAllocate.call({
        from: accounts[0]
      });
      assert.strictEqual(isInitialized, true);

      // Pausing contract
      await grvcrowdsale.pause({ from: owner });
      // Trying to unpause contract
      assertRevert(grvcrowdsale.unpause({ from: accounts[1] }));
    });

    it("Pausing and unpausing with owner and verifying the paused functions", async () => {
      //Initializing contract
      let isInitialized = await grvcrowdsale.preAllocate.call({
        from: accounts[0]
      });
      assert.strictEqual(isInitialized, true);

      // Buying 2 tokens
      let valueInvested = web3.toWei(0.0005, "ether");
      await grvcrowdsale.buyTokens(accounts[5], {
        value: valueInvested,
        from: accounts[5]
      });

      // Verifying the token amount
      let tokenAmount = await grvtoken.balanceOf(accounts[5]);
      assert.strictEqual(
        tokenAmount.toNumber(),
        2,
        "Wrong token amount of account 5"
      );

      // Pausing
      await grvcrowdsale.pause({ from: accounts[0] });

      //Verifying if the contract is paused
      let paused = await grvcrowdsale.paused();
      assert.strictEqual(paused, true, "Error, contract should be paused");

      // Trying to buy 2 tokens
      assertRevert(
        grvcrowdsale.buyTokens(accounts[6], {
          value: valueInvested,
          from: accounts[6]
        })
      );

      // Trying to withdraw team
      assertRevert(grvcrowdsale.withdrawTeam({ from: accounts[0] }));

      // Trying to withdraw advisor
      assertRevert(grvcrowdsale.withdrawAdvisor({ from: accounts[0] }));

      // Trying to mint token
      assertRevert(grvcrowdsale.mintToken(10, { from: accounts[0] }));

      // Trying to Pause again
      assertRevert(grvcrowdsale.pause({ from: accounts[0] }));

      // Unpausing
      await grvcrowdsale.unpause({ from: accounts[0] });

      //Verifying if the contract is unpaused
      paused = await grvcrowdsale.paused();
      assert.strictEqual(paused, false, "Error, contract shouldn't be paused");

      // Buying 2 tokens
      await grvcrowdsale.buyTokens(accounts[6], {
        value: web3.toWei(0.0005, "ether"),
        from: accounts[6]
      });
      // Verifying the token amount
      tokenAmount = await grvcrowdsale.tokenAmountOf(accounts[6]);
      assert.strictEqual(
        tokenAmount.toNumber(),
        2,
        "Wrong token amount of account 6"
      );
    });
  });

  /**
   * Testing the function MintToken
   */
  describe("Function mintToken", () => {
    /**
     * Minting 1 token to the owner wallet
     */
    it("Mint 1 token to owner", async () => {
      //Contract in release block state
      assertRevert(grvcrowdsale.mintToken(0));
      let ownerBalance = await grvtoken.balanceOf.call(accounts[0]);
      assert.strictEqual(0, ownerBalance.toNumber());
    });

    /**
     *Minting zero tokens to owner wallet
     */
    it("Mint 0 token to owner", async () => {
      assertRevert(grvcrowdsale.mintToken(0));
      let ownerBalance = await grvtoken.balanceOf.call(accounts[0]);
      assert.strictEqual(0, ownerBalance.toNumber());
    });

    /**
     * Trying to pass a big number to mint function.
     * This shouldn't work, overflow
     */
    it("Mint bigNumber token to owner (error, big number)", async () => {
      assertRevert(grvcrowdsale.mintToken(bigNumber));
    });

    it("Mint negative number token to owner (error, negative)", async () => {
      assertRevert(grvcrowdsale.mintToken(-1));
    });
  });

  /**
   * Testing renounceOwnership function
   */
  describe("Function renounceOwnership", () => {
    /**
     * Trying to renounce with not owner account
     */
    it("Trying to renounce with not owner", async () => {
      assertRevert(grvcrowdsale.renounceOwnership({ from: accounts[5] }));
    });

    /**
     * Trying to renounce with invalid account
     */
    it("Trying to renounce with invalid account", async () => {
      assertRevert(grvcrowdsale.renounceOwnership({ from: notAccount }));
    });

    /**
     * Renounce with old owner account
     */
    it("Renouncing with old owner", async () => {
      await grvcrowdsale.renounceOwnership({ from: accounts[0] });
      // Trying to mint with old owner after renounce (should revert)
      assertRevert(grvtoken.mint(accounts[5], 1, { from: accounts[0] }));
    });

    /**
     * Renounce with owner account
     */
    it("Renouncing with owner", async () => {
      await grvcrowdsale.renounceOwnership({ from: accounts[0] });
      let actualOwner = await grvcrowdsale.owner();
      assert.strictEqual(
        actualOwner,
        "0x0000000000000000000000000000000000000000",
        "Wrong empty owner"
      );
    });
  });

  /**
   * Testing transferOwnership function
   */
  describe("Function transferOwnership", () => {
    /**
     * Trying to transfer with not owner account
     */
    it("Trying to transfer with not owner", async () => {
      assertRevert(
        grvcrowdsale.transferOwnership(accounts[5], { from: accounts[1] })
      );
    });

    /**
     * Trying to transfer with an invalid account
     */
    it("Trying to transfer with an invalid account", async () => {
      assertRevert(
        grvcrowdsale.transferOwnership(accounts[5], { from: notAccount })
      );
    });

    /**
     * Trying to transfer to an invalid account
     */
    it("Trying to transfer to an invalid account", async () => {
      assertRevert(
        grvcrowdsale.transferOwnership(notAccount, { from: accounts[0] })
      );
    });

    /**
     * Transfering ownership and asserting it
     */
    it("Transfering ownership and asserting it", async () => {
      await grvcrowdsale.transferOwnership(accounts[5], {
        from: accounts[0]
      });
      assertRevert(grvtoken.mint(accounts[5], 15, { from: accounts[0] }));
      await grvtoken.mint(accounts[0], 16, { from: accounts[5] });
      let value = await grvtoken.balanceOf(accounts[0]);
      assert.strictEqual(value.toNumber(), 16, "Wrong value minted.");
    });
  });

  describe("Function updateTokenPrice", () => {
    it("Trying to update to zero", async () => {
      assertRevert(grvcrowdsale.updateTokenPrice(0));
    });

    it("Trying to update to negative", async () => {
      assertRevert(
        grvcrowdsale.updateTokenPrice(
          0.000000000000000000000000000000000000000000000000000001
        )
      );
    });

    it("Updating to a valid value", async () => {
      let newValue = web3.toWei(0.0001, "ether");
      await grvcrowdsale.updateTokenPrice(newValue);
      let value = await grvcrowdsale.oneTokenInWei();
      assert.strictEqual(
        value.toNumber(),
        parseInt(newValue),
        "Wrong new value of token in wei"
      );

      let oneToken = newValue * 0.5;

      await grvcrowdsale.buyTokens(accounts[5], {
        from: accounts[5],
        value: oneToken
      });

      newValue = await grvtoken.balanceOf(accounts[5]);
      assert.strictEqual(newValue.toNumber(), 1, "Wrong token amount bought");
    });
  });

  /**
   * Scenario testing
   * Testing getTokenLeft, tokensSold, investorCount, tokenAmountOf and investedAmountOf
   */
  describe("Scenario Testing", () => {
    it("Buy 10 tokens and assert important values", async () => {
      //Initializing contract
      let isInitialized = await grvcrowdsale.preAllocate.call({ from: owner });
      assert.strictEqual(isInitialized, true);

      // Getting the token left amount
      let tokenLeft = await grvcrowdsale.getTokenLeft();
      assert.strictEqual(
        tokenLeft.toNumber(),
        blocks[0],
        "Wrong Tokens Left initial value"
      );

      // Getting the tokens sold amount
      let tokensSold = await grvcrowdsale.tokensSold();
      assert.strictEqual(
        tokensSold.toNumber(),
        0,
        "Wrong tokens sold initial amount"
      );

      // Getting investor count
      let investorCount = await grvcrowdsale.investorCount();
      assert.strictEqual(
        investorCount.toNumber(),
        0,
        "Wrong investorCount initial value"
      );

      // Getting token amount of
      let tokenAmount6 = await grvcrowdsale.tokenAmountOf(accounts[6]);
      assert.strictEqual(
        tokenAmount6.toNumber(),
        0,
        "Wrong token amount of initial value"
      );

      // Getting invested amount of
      let investedAmountOf6 = await grvcrowdsale.investedAmountOf(accounts[6]);
      assert.strictEqual(
        investedAmountOf6.toNumber(),
        0,
        "Wrong investedAmountOf value"
      );

      if (tokenLeft > 9) {
        // Buying 10 tokens
        let valueInvested = web3.toWei(0.0025, "ether");
        await grvcrowdsale.buyTokens(accounts[6], {
          value: valueInvested,
          from: accounts[6]
        });

        // Getting actual token left value
        let tokenLeftAfter = await grvcrowdsale.getTokenLeft();
        // Getting actual tokens sold value
        tokensSold = await grvcrowdsale.tokensSold();
        // Getting actual investor count
        investorCount = await grvcrowdsale.investorCount();
        // Getting actual tokenAmountOf
        tokenAmount6 = await grvcrowdsale.tokenAmountOf(accounts[6]);
        // Getting actual investedAmountOf
        investedAmountOf6 = await grvcrowdsale.investedAmountOf(accounts[6]);

        // Updating the previous tokensLeft value
        tokenLeft -= 10;

        // Asserting TokenLeft
        assert.strictEqual(
          tokenLeftAfter.toNumber(),
          tokenLeft,
          "Tokens Left amount error"
        );

        // Asserting TokensSold
        assert.strictEqual(
          tokensSold.toNumber(),
          10,
          "Wrong tokens sold value"
        );

        // Asserting InvestorCount
        assert.strictEqual(
          investorCount.toNumber(),
          1,
          "Wrong investor count value"
        );

        // Asserting TokenAmount 6
        assert.strictEqual(
          tokenAmount6.toNumber(),
          10,
          "Wrong tokenAmountOf account 6 value"
        );

        // Asserting InvestedAmountOf 6
        assert.strictEqual(
          investedAmountOf6.toNumber(),
          parseFloat(valueInvested, 10),
          "Wrong investedAmountOf account 6 value"
        );
      }
    });

    /**
     * Scenario testing
     * Testing weiRaised, tokenAmountOf, updateTokenPrice, buyTokens
     */
    it("Transactions, buying, tokenPrice", async () => {
      let wallet5 = 0;
      let wallet6 = 0;
      let wallet7 = 0;
      let tokenAmount5 = 0;
      let tokenAmount6 = 0;
      let tokenAmount7 = 0;
      let tokenLeft;

      //Initializing contract
      let isInitialized = await grvcrowdsale.preAllocate.call({ from: owner });
      assert.strictEqual(isInitialized, true);

      // Getting token left
      tokenLeft = await grvcrowdsale.getTokenLeft();
      assert.strictEqual(tokenLeft.toNumber(), blocks[0], "Wrong token left");

      // Verifying initial weiRaised value
      let weiRaised = await grvcrowdsale.weiRaised();
      assert.strictEqual(
        weiRaised.toNumber(),
        0,
        "Wrong initial weiRaised value."
      );
      weiRaised = 0;

      /* BUYING */

      // Buying 5 tokens from account 6 to 5
      let investedValue = web3.toWei(0.00125, "ether");
      await grvcrowdsale.buyTokens(accounts[5], {
        from: accounts[6],
        value: investedValue
      });
      wallet5 += 5;
      tokenLeft -= 5;
      tokenAmount5 += 5;
      weiRaised += parseInt(investedValue);
      let value = await grvtoken.balanceOf(accounts[5]);
      assert(
        value.toNumber(),
        wallet5,
        "Wrong value given from account 6 to account 5"
      );

      // Buying 2 tokens with account 7
      investedValue = web3.toWei(0.0005, "ether");
      await grvcrowdsale.buyTokens(accounts[7], {
        from: accounts[7],
        value: investedValue
      });
      wallet7 += 2;
      tokenLeft -= 2;
      tokenAmount7 += 2;
      weiRaised += parseInt(investedValue);
      value = await grvtoken.balanceOf(accounts[7]);
      assert(value.toNumber(), wallet7, "Wrong value brought from account 7");

      /* TRANSFERENCES */

      // Transfering token from account 5 to 6
      await grvtoken.transfer(accounts[6], 1, { from: accounts[5] });
      wallet6 += 1;
      wallet5 -= 1;

      // Asserting account 6 balance
      value = await grvtoken.balanceOf(accounts[6]);
      assert.strictEqual(
        value.toNumber(),
        wallet6,
        "Wrong account 6 balance, transferred from account 5"
      );

      // Transfering token from account 5 to 6
      await grvtoken.transfer(accounts[6], 1, { from: accounts[7] });
      wallet6 += 1;
      wallet7 -= 1;

      // Asserting account 6 balance
      value = await grvtoken.balanceOf(accounts[6]);
      assert.strictEqual(
        value.toNumber(),
        wallet6,
        "Wrong account 6 balance, transferred from account 7"
      );

      /* APPROVEMENTS */

      // Approving account 6 to spend 1 token from account 5
      await grvtoken.approve(accounts[6], 1, { from: accounts[5] });
      value = await grvtoken.allowance(accounts[5], accounts[6]);
      assert.strictEqual(
        value.toNumber(),
        1,
        "Wrong value approved from account 5 to 6"
      );

      // Increasing approvement to 3 tokens
      await grvtoken.increaseApproval(accounts[6], 2, { from: accounts[5] });
      value = await grvtoken.allowance(accounts[5], accounts[6]);
      assert.strictEqual(
        value.toNumber(),
        3,
        "Wrong value increased from account 5 to 6"
      );

      // Decreasing approvement to 2 tokens
      await grvtoken.decreaseApproval(accounts[6], 1, { from: accounts[5] });
      value = await grvtoken.allowance(accounts[5], accounts[6]);
      assert.strictEqual(
        value.toNumber(),
        2,
        "Wrong value decreased from account 5 to 6"
      );

      // Approving account 7 to spend 1 token from account 5
      await grvtoken.approve(accounts[7], 1, { from: accounts[5] });
      value = await grvtoken.allowance(accounts[5], accounts[7]);
      assert.strictEqual(
        value.toNumber(),
        1,
        "Wrong value approved from account 5 to 7"
      );

      /* TRANSFERING APPROVEMENTS */

      // Transfering 1 token from account 5 to 7 with account 7
      await grvtoken.transferFrom(accounts[5], accounts[7], 1, {
        from: accounts[7]
      });
      wallet7 += 1;
      value = await grvtoken.balanceOf(accounts[7]);
      assert.strictEqual(
        value.toNumber(),
        wallet7,
        "Wrong account 7 balance after transferring approvement"
      );

      // Transfering 1 token from account 5 to 6 with account 6
      await grvtoken.transferFrom(accounts[5], accounts[6], 2, {
        from: accounts[6]
      });
      wallet6 += 2;
      value = await grvtoken.balanceOf(accounts[6]);
      assert.strictEqual(
        value.toNumber(),
        wallet6,
        "Wrong account 6 balance after transferring approvement"
      );

      // Verifying token left
      value = await grvcrowdsale.getTokenLeft();
      assert.strictEqual(value.toNumber(), tokenLeft, "Wrong token left");

      // Changing token value
      let newValue = web3.toWei(0.0001, "ether");
      await grvcrowdsale.updateTokenPrice(newValue);
      value = await grvcrowdsale.oneTokenInWei();
      assert.strictEqual(
        value.toNumber(),
        parseInt(newValue),
        "Wrong new value of token in wei"
      );

      let oneToken = newValue * 0.5;

      // Buying all tokens with account 7
      investedValue = 13 * oneToken;
      await grvcrowdsale.buyTokens(accounts[7], {
        from: accounts[7],
        value: investedValue
      });
      wallet7 += 13;
      tokenLeft -= 13;
      tokenAmount7 += 13;
      weiRaised += parseInt(investedValue);
      value = await grvtoken.balanceOf(accounts[7]);
      assert(value.toNumber(), wallet7, "Wrong full buying from account 7");

      // Verifying weiRaised
      value = await grvcrowdsale.weiRaised();
      assert.strictEqual(value.toNumber(), weiRaised, "Wrong weiRaised value");

      // Asserting token amount of account 5
      value = await grvcrowdsale.tokenAmountOf(accounts[5]);
      assert.strictEqual(
        value.toNumber(),
        tokenAmount5,
        "Wrong tokenAmount value, account 5"
      );

      // Asserting token amount of account 6
      value = await grvcrowdsale.tokenAmountOf(accounts[6]);
      assert.strictEqual(
        value.toNumber(),
        tokenAmount6,
        "Wrong tokenAmount value, account 6"
      );

      // Asserting token amount of account 7
      value = await grvcrowdsale.tokenAmountOf(accounts[7]);
      assert.strictEqual(
        value.toNumber(),
        tokenAmount7,
        "Wrong tokenAmount value, account 7"
      );
    });

    it("Minting, ownership", async () => {
      //let wallet5 = 0;
      //let wallet = 0;

      //Initializing contract
      //let isInitialized = await grvcrowdsale.preAllocate.call({ from: owner });
      //assert.strictEqual(isInitialized, true);

      // Asserting totalSupply
      //let totalSupply = await grvtoken.totalSupply();
      //console.log(totalSupply.toNumber());

      // Minting 10 tokens to account 5
      await grvtoken.mint(accounts[0], 1, { from: accounts[0] });
      //wallet5 = 10;
      /*let value = await grvtoken.balanceOf(accounts[5]);
          assert.strictEqual(
            value.toNumber(),
            wallet5,
            "Wrong account 5 balance after minting"
          );*/
    });
  });
});
