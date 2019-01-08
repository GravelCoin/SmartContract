const { assertRevert } = require("../../helpers/assertRevert");
const GRVToken = artifacts.require("GRVToken");
let grvtoken;
let bigNumber = 1.157920892373161954235709850086879078532691231984665640564039457584007913129639935e77;

contract("GRVToken", accounts => {
  /**
   * Deploying the contract
   */
  beforeEach(async () => {
    grvtoken = await GRVToken.new({ from: accounts[0] });
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
      let owner = await grvtoken.owner.call();
      // Asserting that account[0] == owner
      assert.strictEqual(accounts[0], owner);
    });

    /**
     * Verifying if the coin name registered is "Gravel Coin"
     */
    it("Verifying coin name", async () => {
      // Getting the name registered
      let name = await grvtoken.name.call();
      // Asserting what is expected
      assert.strictEqual("Gravel Coin", name);
    });

    /**
     * Verifying if the coin symbol registered is "GRVC"
     */
    it("Verifying coin symbol", async () => {
      // Getting the registered symbol
      let symbol = await grvtoken.symbol.call();
      // Asserting what is expected
      assert.strictEqual("GRVC", symbol);
    });

    /**
     * Verifying if the decimals registered is 0
     */
    it("Verifying decimals", async () => {
      // Getting the registered decimals
      let decimals = await grvtoken.decimals.call();
      // Asserting what is expected
      assert.strictEqual(0, decimals.toNumber());
    });

    /**
     * Verifying if the minting value is false
     */
    it("Verifying if minting is finished", async () => {
      // Getting the minting value
      let minting = await grvtoken.mintingFinished.call();
      // Asserting what is expected
      assert.strictEqual(false, minting);
    });
  });

  /**
   * Verifying all initial balances is 0 (zero)
   */
  describe("Initial Balances", () => {
    /**
     * Verifying the owner balance
     */
    it("Verifying the owner balance", async () => {
      let ownerBalance = await grvtoken.balanceOf.call(accounts[0]);
      assert.strictEqual(0, ownerBalance.toNumber());
    });

    /**
     * Verifying the team balance
     */
    it("Verifying Wallet Team balance", async () => {
      let teamBalance = await grvtoken.balanceOf.call(accounts[1]);
      assert.strictEqual(0, teamBalance.toNumber());
    });

    /**
     * Verifying the advisor balance
     */
    it("Verifying Wallet Advisor balance", async () => {
      let advisorBalance = await grvtoken.balanceOf.call(accounts[2]);
      assert.strictEqual(0, advisorBalance.toNumber());
    });
  });

  /**
   * Verifying the mint function
   */
  describe("Mint", () => {
    /**
     * Minting 1 token to the owner wallet
     */
    it("Mint 1 token to owner", async () => {
      await grvtoken.mint(accounts[0], 1);
      let ownerBalance = await grvtoken.balanceOf.call(accounts[0]);
      assert.strictEqual(1, ownerBalance.toNumber());
    });

    /**
     *Minting zero tokens to owner wallet
     */
    it("Mint 0 token to owner", async () => {
      await grvtoken.mint(accounts[0], 0);
      let ownerBalance = await grvtoken.balanceOf.call(accounts[0]);
      assert.strictEqual(0, ownerBalance.toNumber());
    });

    /**
     * Minting 1 token to team wallet with team account.
     * This shouldn't work, once that only the owner can mint.
     */
    it("Mint 1 token to team with team account (error, only owner)", async () => {
      assertRevert(grvtoken.mint(accounts[1], 1, { from: accounts[1] }));
    });

    /**
     * Minting 1 token to team wallet with owner account
     */
    it("Mint 1 token to team with owner", async () => {
      await grvtoken.mint(accounts[1], 1, { from: accounts[0] });
      let teamBalance = await grvtoken.balanceOf.call(accounts[1]);
      assert.strictEqual(1, teamBalance.toNumber());
    });

    /**
     * Trying to pass a big number to mint function.
     * This shouldn't work, overflow
     */
    it("Mint bigNumber token to owner (error, big number)", async () => {
      assertRevert(
        grvtoken.mint(accounts[0], bigNumber, { from: accounts[0] })
      );
    });

    /**
     * Trying to mint -1 token to owner wallet.
     * This shouldn't work, negative number.
     */
    it("Mint -1 token to owner (error, negative number)", async () => {
      await grvtoken.mint(accounts[0], -1, { from: accounts[0] });
      let ownerBalance = await grvtoken.balanceOf.call(accounts[0]);
      assert.strictEqual(0, ownerBalance.toNumber());
    });
  });

  /**
   * Testing the approve function
   */
  describe("Approvements", () => {
    /**
     * Approving the owner to use 1 team token, using the
     * team account.
     */
    it("Approving to use owner token with team (shouldn't work)", async () => {
      await grvtoken.approve(accounts[0], 1, { from: accounts[1] });
      let allowed = await grvtoken.allowance(accounts[1], accounts[0]);
      assert.strictEqual(1, allowed.toNumber());
    });

    /**
     * Approving the owner to use 1 owner token, using the
     * owner account.
     */
    it("Approving to use owner token with owner", async () => {
      await grvtoken.approve(accounts[0], 2, { from: accounts[0] });
      let allowed = await grvtoken.allowance(accounts[0], accounts[0]);
      assert.strictEqual(2, allowed.toNumber());
    });

    /**
     * Approving the team to use 1 owner token, using the
     * owner account.
     */
    it("Approving to use team token with owner (shouldn't work)", async () => {
      await grvtoken.approve(accounts[1], 1, { from: accounts[0] });
      let allowed = await grvtoken.allowance(accounts[0], accounts[1]);
      assert.strictEqual(1, allowed.toNumber());
    });

    /**
     * Approving the team to use 2 team tokens, using the
     * team account.
     */
    it("Approving to use team token with team", async () => {
      await grvtoken.approve(accounts[1], 2, { from: accounts[1] });
      let allowed = await grvtoken.allowance(accounts[1], accounts[1]);
      assert.strictEqual(2, allowed.toNumber());
    });

    /**
     * Trying to pass a value grater than max to approve funcion. This shouldn't work.
     */
    it("Approving to use bigger than max amount of owner token (shouldn't work)", async () => {
      assertRevert(
        grvtoken.approve(accounts[0], bigNumber, { from: accounts[0] })
      );
    });

    /**
     * Trying to pass a negative value to approve funcion. This shouldn't work.
     */
    it("Approving to use negative amount of owner token (shouldn't work)", async () => {
      await grvtoken.approve(accounts[0], -1, { from: accounts[0] });
      let allowed = await grvtoken.allowance(accounts[0], accounts[0]);
      assert.strictEqual(0, allowed.toNumber());
    });
  });

  /**
   * Testing the transferFrom function
   */
  describe("Transfering From", () => {
    /**
     * Minting 1 token to owner,
     * approving owner to use this token and
     * transfering 1 owner token to team.
     */
    describe("1 Owner token to Team", () => {
      it("Transfer 1 token from owner to team", async () => {
        //Minting 1 token to owner
        await grvtoken.mint(accounts[0], 1);
        let ownerBalance = await grvtoken.balanceOf.call(accounts[0]);
        assert.strictEqual(1, ownerBalance.toNumber());

        // Approving owner to use 1 token from wallet
        await grvtoken.approve(accounts[0], 1, { from: accounts[0] });
        // Transfering 1 token to team wallet
        await grvtoken.transferFrom(accounts[0], accounts[1], 1, {
          from: accounts[0]
        });
        // Verifying the team balance
        let teamBalance = await grvtoken.balanceOf.call(accounts[1]);
        assert.strictEqual(1, teamBalance.toNumber());
      });
    });

    /**
     *Trying to transfer 1 token from owner to team, but owner has 0 token.
     * Shouldn't work.
     */
    it("Transfer 1 token from owner to team (error, has 0 token)", async () => {
      assertRevert(grvtoken.transferFrom.call(accounts[0], accounts[1], 1));
    });
  });

  /**
   * Testing the transfer function
   */
  describe("Transfering", () => {
    /**
     * Minting 1 token to owner,
     * approving owner to use this token and
     * transfering 1 owner token to team.
     */
    describe("1 Owner token to Team", () => {
      it("Transfer 1 token from owner to team", async () => {
        //Minting 1 token to owner
        await grvtoken.mint(accounts[0], 1);
        let ownerBalance = await grvtoken.balanceOf.call(accounts[0]);
        assert.strictEqual(1, ownerBalance.toNumber());

        // Approving owner to use 1 token from wallet
        await grvtoken.approve(accounts[0], 1, { from: accounts[0] });
        // Transfering 1 token to team wallet
        await grvtoken.transfer(accounts[1], 1, {
          from: accounts[0]
        });
        // Verifying the team balance
        let teamBalance = await grvtoken.balanceOf.call(accounts[1]);
        assert.strictEqual(1, teamBalance.toNumber());
      });
    });

    /**
     *Trying to transfer 1 token from owner to team, but owner has 0 token.
     * Shouldn't work.
     */
    it("Transfer 1 token from owner to team (error, has 0 token)", async () => {
      assertRevert(grvtoken.transferFrom.call(accounts[0], accounts[1], 1));
    });
  });

  /**
   * Testing the allowance function
   * */
  describe("Function allowance", () => {
    /**
     * Testing the initial allowance between owner and team accounts
     */
    it("Initial allowance account 0 and 1", async () => {
      let allowance = await grvtoken.allowance.call(accounts[0], accounts[1]);
      assert.strictEqual(0, allowance.toNumber());
    });

    /**
     * Approving 50 token to owner with team account, and testing
     * allowance equal to 50.
     */
    it("Approving 1 token to account 0 with account 1 and testing allowance account 1 and 0", async () => {
      await grvtoken.approve(accounts[0], 50, { from: accounts[1] });
      let allowance = await grvtoken.allowance.call(accounts[1], accounts[0]);
      assert.strictEqual(50, allowance.toNumber());
    });

    /**
     * Calling allowance with invalid accounts params
     */
    it("Allowance account 0 and invalid accounts", async () => {
      let allowance = await grvtoken.allowance.call(
        "0xD4e0023A3Fc5A0313c141964206Ec95C5Dfa60d0",
        "0xD3e0023A3Fc5A0313c141964206Ec95C5Dfa60d0"
      );
      assert.strictEqual(0, allowance.toNumber());
    });
  });

  /**
   * Testing increaseApproval and decreaseApproval accounts
   */
  describe("Increasing and decreasing approvals", () => {
    /**
     * Approving 10 token from team to owner account and increasing 1 token.
     * The allowance should be 11
     */
    it("Approve 10 token team to owner and increaseApproval 1 token", async () => {
      await grvtoken.approve(accounts[0], 10, { from: accounts[1] });
      let allowance = await grvtoken.allowance.call(accounts[1], accounts[0]);
      assert.strictEqual(10, allowance.toNumber());

      await grvtoken.increaseApproval(accounts[0], 1, { from: accounts[1] });
      allowance = await grvtoken.allowance.call(accounts[1], accounts[0]);
      assert.strictEqual(11, allowance.toNumber());
    });

    /**
     * Approving 10 token from team to owner account and decreasing 2 token.
     * The allowance should be 8
     */
    it("Approve 10 token team to owner and decreaseApproval 2 token", async () => {
      await grvtoken.approve(accounts[0], 10, { from: accounts[1] });
      let allowance = await grvtoken.allowance.call(accounts[1], accounts[0]);
      assert.strictEqual(10, allowance.toNumber());

      await grvtoken.decreaseApproval(accounts[0], 2, { from: accounts[1] });
      allowance = await grvtoken.allowance.call(accounts[1], accounts[0]);
      assert.strictEqual(8, allowance.toNumber());
    });

    /**
     * Approving 10 token from team to owner account, increasing 10 token
     * and decreasing 5 tokens.
     * The allowance should be 15
     */
    it("Approve 10 token team to owner and increaseApproval 10 token decreaseApproval 5 token", async () => {
      await grvtoken.approve(accounts[0], 10, { from: accounts[1] });
      let allowance = await grvtoken.allowance.call(accounts[1], accounts[0]);
      assert.strictEqual(10, allowance.toNumber());

      await grvtoken.increaseApproval(accounts[0], 10, { from: accounts[1] });
      await grvtoken.decreaseApproval(accounts[0], 5, { from: accounts[1] });
      allowance = await grvtoken.allowance.call(accounts[1], accounts[0]);
      assert.strictEqual(15, allowance.toNumber());
    });
  });
});
