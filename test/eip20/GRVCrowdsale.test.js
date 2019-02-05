const { assertRevert } = require("../../helpers/assertRevert");
//const { assertRevert } = require("../../node_modules/zeppelin-solidity/test/helpers/assertRevert");
const GRVToken = artifacts.require("./GRVToken.sol");
const GRVCrowdsale = artifacts.require("GRVCrowdsale");
let grvcrowdsale;

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
    await grvtoken.transferOwnership.call(grvcrowdsale.address, {from: owner});
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
      let owner = await grvcrowdsale.owner.call();
      // Asserting that account[0] == owner
      assert.strictEqual(accounts[0], owner);
    });

    /**
     * Verifying if the owner wallet is really this account
     */
    it("Verifying owner wallet", async () => {
      let wallet = await grvcrowdsale.wallet.call();
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
     * Verifying the predefined initial tokens of team wallet
     */
    it("Verifying Token of the team", async () => {
      let value = await grvcrowdsale.TOKEN_OF_THE_TEAM.call();
      assert.strictEqual(TOKEN_OF_THE_TEAM, value.toNumber());
    });

    /**
     * Verifying the predefined initial tokens of sale
     */
    it("Verifying Token of the sale", async () => {
      let value = await grvcrowdsale.TOKEN_OF_THE_SALE.call();
      assert.strictEqual(TOKEN_OF_THE_SALE, value.toNumber());
    });

    /**
     * Verifying the predefined initial tokens of airdrop wallet
     */
    it("Verifying Token of the airdrop", async () => {
      let value = await grvcrowdsale.TOKEN_OF_THE_AIRDROP.call();
      assert.strictEqual(TOKEN_OF_THE_AIRDROP, value.toNumber());
    });

    /**
     * Verifying the predefined initial tokens of advisor wallet
     */
    it("Verifying Token of the advisor", async () => {
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
  });

  /**
   * Testing the tokenAmountOf function
   */
  describe("Function tokenAmountOf", () => {
    /**
     * Verifying the token amount of owner account.
     * Should be zero initially
     */
    it("Verifying owner wallet", async () => {
      let value = await grvcrowdsale.tokenAmountOf(accounts[0], {
        from: accounts[0]
      });
      assert.strictEqual(0, value.toNumber());
    });

    /**
     * Verifying the token amount of team account.
     * Should be zero initially
     */
    it("Verifying team wallet", async () => {
      let value = await grvcrowdsale.tokenAmountOf(accounts[1], {
        from: accounts[1]
      });
      assert.strictEqual(0, value.toNumber());
    });

    /**
     * Verifying the token amount of advisor account.
     * Should be zero initially
     */
    it("Verifying advisor wallet", async () => {
      let value = await grvcrowdsale.tokenAmountOf(accounts[2], {
        from: accounts[2]
      });
      assert.strictEqual(0, value.toNumber());
    });

    /**
     * Verifying the token amount of airdrop account.
     * Should be zero initially
     */
    it("Verifying airdrop wallet", async () => {
      let value = await grvcrowdsale.tokenAmountOf(accounts[3], {
        from: accounts[3]
      });
      assert.strictEqual(0, value.toNumber());
    });

    /**
     * Testing the function with the function with an invalid account.
     */
    it("Testing with an invalid account (shouldn't work)", async () => {
      assertRevert(grvcrowdsale.tokenAmountOf("fasdasd13f2d2dasfasd"));
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
      let value = await grvcrowdsale.investedAmountOf(accounts[0]);
      assert.strictEqual(0, value.toNumber());
    });

    /**
     * Verifying the invested amount of team account.
     * Should be zero initially
     */
    it("Verifying team account", async () => {
      let value = await grvcrowdsale.investedAmountOf(accounts[1]);
      assert.strictEqual(0, value.toNumber());
    });

    /**
     * Verifying the invested amount of advisor account.
     * Should be zero initially
     */
    it("Verifying advisor account", async () => {
      let value = await grvcrowdsale.investedAmountOf(accounts[2]);
      assert.strictEqual(0, value.toNumber());
    });

    /**
     * Verifying the invested amount of airdrop account.
     * Should be zero initially
     */
    it("Verifying airdrop account", async () => {
      let value = await grvcrowdsale.investedAmountOf(accounts[3]);
      assert.strictEqual(0, value.toNumber());
    });

    /**
     * Testing the function with an invalid account
     */
    it("Testing with an invalid account (shouldn't work)", async () => {
      assertRevert(grvcrowdsale.tokenAmountOf("asf9as87d9as8fas9"));
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
      assert.strictEqual(grvcrowdsale.address, newOwner, "TransferOwnership of the GRVToken fail");
      // inicializa o contrato alocando os valores para o team, advisor, airdrop ...
      let isInitialize = await grvcrowdsale.preAllocate.call( { from: owner });
      assert.strictEqual(isInitialize, true);
      // verifica o block corrente = 0
      let currentBlock = await grvcrowdsale.currentBlock.call();
      assert.strictEqual(currentBlock.toNumber(), 0, "Expected current block fail");

      // identifica todos os tokens restantes do primeiro bloco
      let tokenLeft = await grvcrowdsale.getTokenLeft.call();
      let expectedTokenLeft = blocks[currentBlock.toNumber()] - INITIAL_SUPPLY;
      assert.strictEqual(tokenLeft.toNumber(), expectedTokenLeft, "Expected token left fail");

      // verifica o preco corrente
      let currentRate = await grvcrowdsale.getCurrentRate.call();
      let expectedCurrentRate = blocksPrice[currentBlock.toNumber()] * oneTokenInWei / 100;
      assert.strictEqual(currentRate.toNumber(), expectedCurrentRate, "Expected current rate fail");

      // verifica se a quantidade de token corresponde ao valor enviado .
      let beforeSaleBalance = await grvtoken.balanceOf.call(purchaser);
      const emptyValue = 0;
      assert.strictEqual(beforeSaleBalance.toNumber(), emptyValue, "Before Sale Balance fail");
      // investidor compra todos os GRVCs do bloco
      await grvcrowdsale.sendTransaction({ value: expectedTokenLeft * expectedCurrentRate, from: purchaser });
      amountTokenSale += expectedTokenLeft;
      // verifica se a quantidade de token corresponde ao valor enviado .
      let afterSaleBalance = await grvtoken.balanceOf.call(purchaser);      
      assert.strictEqual(afterSaleBalance.toNumber(), amountTokenSale, "After Sale Balance fail");

      // verifica se bloco corrente agora = 1
      currentBlock = await grvcrowdsale.currentBlock.call();
      assert.strictEqual(currentBlock.toNumber(), 1, "Expected current block fail");

      // identifica todos os tokens restantes do segundo bloco
      tokenLeft = await grvcrowdsale.getTokenLeft.call();
      expectedTokenLeft = blocks[currentBlock.toNumber()] - blocks[currentBlock.toNumber() -1];
      assert.strictEqual(tokenLeft.toNumber(), expectedTokenLeft, "Expected token left fail");

      // verifica o preco corrente
      currentRate = await grvcrowdsale.getCurrentRate.call();
      expectedCurrentRate = blocksPrice[currentBlock.toNumber()] * oneTokenInWei / 100;
      assert.strictEqual(currentRate.toNumber(), expectedCurrentRate, "Expected current rate fail");

      // investidor compra todos os GRVCs do segundo bloco
      await grvcrowdsale.sendTransaction({ value: expectedTokenLeft * expectedCurrentRate, from: purchaser });
      amountTokenSale += expectedTokenLeft;

      // verifica se a quantidade de token corresponde ao valor enviado .
      afterSaleBalance = await grvtoken.balanceOf.call(purchaser);      
      assert.strictEqual(afterSaleBalance.toNumber(), amountTokenSale, "After Sale Balance fail");


      // verifica se bloco corrente agora = 2
      currentBlock = await grvcrowdsale.currentBlock.call();
      assert.strictEqual(currentBlock.toNumber(), 2, "Expected current block fail");

      // identifica todos os tokens restantes do primeiro bloco
      tokenLeft = await grvcrowdsale.getTokenLeft.call();
      expectedTokenLeft = blocks[currentBlock.toNumber()] - INITIAL_SUPPLY;
      assert.strictEqual(tokenLeft.toNumber(), expectedTokenLeft, "Expected token left fail");

      // verifica o preco corrente
      currentRate = await grvcrowdsale.getCurrentRate.call();
      expectedCurrentRate = blocksPrice[currentBlock.toNumber()] * oneTokenInWei / 100;
      assert.strictEqual(currentRate.toNumber(), expectedCurrentRate, "Expected current rate fail");

      // investidor compra todos os GRVCs do bloco
      await grvcrowdsale.sendTransaction({ value: expectedTokenLeft * expectedCurrentRate, from: purchaser });
      amountTokenSale += expectedTokenLeft;
      // verifica se a quantidade de token corresponde ao valor enviado .
      afterSaleBalance = await grvtoken.balanceOf.call(purchaser);      
      assert.strictEqual(afterSaleBalance.toNumber(), amountTokenSale, "After Sale Balance fail");
   

      // verifica se o bloco corrente agora = 3
      currentBlock = await grvcrowdsale.currentBlock.call();
      assert.strictEqual(currentBlock.toNumber(), 3, "Expected current block fail");

      // verifica o preco corrente. Deve ser preço cheio pois não existem mais blocos (currentBlock == MAX_BLOCKS_CROWDSALE)
      currentRate = await grvcrowdsale.getCurrentRate.call();
      expectedCurrentRate = oneTokenInWei;
      assert.strictEqual(currentRate.toNumber(), expectedCurrentRate, "Expected current rate fail");      

      // investidor compra 1 eth em GRVC. O valor de cado GRVC deve ser cheio, sem deconto.
      let valueFullPrice = 10;
      let fullPrice = 0.0005;
      await grvcrowdsale.sendTransaction({ value: web3.toWei(valueFullPrice, "ether"), from: purchaser });
      amountTokenSale += (valueFullPrice / fullPrice ) /*2000*/;
      // verifica se a quantidade de token corresponde ao valor enviado .
      afterSaleBalance = await grvtoken.balanceOf.call(purchaser);      
      assert.strictEqual(afterSaleBalance.toNumber(), amountTokenSale, "After Sale Balance fail");
   
    });
  });
});
