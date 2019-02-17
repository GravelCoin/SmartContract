const { assertRevert } = require("../helpers/assertRevert");
const GRVToken = artifacts.require("GRVToken");
let grvtoken;
let bigNumber = 1.157920892373161954235709850086879078532691231984665640564039457584007913129639935e77;
let notAccount = "0xas4TE55b5e8cD1200C55c22d5A8C455837053bDX";

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
     * Verifying if the total supply
     */
    it("Verifying contract owner", async () => {
      let supply = await grvtoken.totalSupply.call();
      assert.strictEqual(supply.toNumber(), 0);
    });

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
   * Function balanceOf
   */
  describe("Function balanceOf", () => {
    it("Trying to get balance from invalid account", async () => {
      assertRevert(grvtoken.balanceOf(notAccount));
    });

    it("Trying to get balance from owner from invalid account", async () => {
      assertRevert(grvtoken.balanceOf(accounts[0], { from: notAccount }));
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
      assertRevert(grvtoken.mint(accounts[0], 0));
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
      let beforeMintBalance = await grvtoken.balanceOf.call(accounts[0]);
      assert.strictEqual(0, beforeMintBalance.toNumber());
      assertRevert(grvtoken.mint(accounts[0], -1, { from: accounts[0] }));
      let afterMintBalance = await grvtoken.balanceOf.call(accounts[0]);
      assert.strictEqual(0, afterMintBalance.toNumber());
    });
  });

  /**
   * Testing finishMinting and mintingFinished function
   */
  describe("Function finishMinting", () => {
    /**
     * Trying to finishMinting with not owner account
     */
    it("Trying to finishMinting with not owner", async () => {
      assertRevert(grvtoken.finishMinting({ from: accounts[4] }));
    });

    /**
     * FinishMinting with owner account. Need to work
     */
    it("FinishMinting with owner", async () => {
      let mintingFinished = await grvtoken.mintingFinished.call({
        from: accounts[5]
      });
      assert.strictEqual(mintingFinished, false);
      await grvtoken.finishMinting({ from: accounts[0] });
      mintingFinished = await grvtoken.mintingFinished.call();
      assert.strictEqual(mintingFinished, true);
    });

    /**
     * Trying to finishMinting with invalid account
     */
    it("FinishMinting with invalid account", async () => {
      assertRevert(grvtoken.finishMinting({ from: notAccount }));
    });

    /**
     * Trying to mintFinished with invalid account
     */
    it("FinishMinting with invalid account", async () => {
      assertRevert(grvtoken.mintingFinished({ from: notAccount }));
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
    it("Approving to use owner token with team", async () => {
      await grvtoken.approve(accounts[0], 1, { from: accounts[1] });
      let allowed = await grvtoken.allowance(accounts[1], accounts[0]);
      assert.strictEqual(1, allowed.toNumber());
    });

    it("Approving owner to use team token and sending this token to owner", async () => {
      await grvtoken.mint(accounts[1], 1);
      await grvtoken.approve(accounts[0], 1, { from: accounts[1] });
      let allowed = await grvtoken.allowance(accounts[1], accounts[0]);
      assert.strictEqual(1, allowed.toNumber(), "Wrong allowance");
      
      await grvtoken.transferFrom(accounts[1], accounts[1], 1, {from: accounts[0]});
      let value = await grvtoken.balanceOf(accounts[1]);
      assert.strictEqual(value.toNumber(), 1, "Wrong final balance");
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
    it("Approving to use team token with owner", async () => {
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
      assertRevert(grvtoken.approve(accounts[0], -1, { from: accounts[0] }));
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

    /**
     * Transfering 10 tokens from owner to team by another account
     */
    it("Transfer 10 tokens from owner to team by another account", async () => {
      // Mint 10 tokens to owner
      await grvtoken.mint(accounts[0], 20, { from: accounts[0] });

      // Asserting the owner wallet
      let wallet = await grvtoken.balanceOf(accounts[0]);
      assert.strictEqual(wallet.toNumber(), 20, "Wrong tokens minted");

      // Allowing account 5 to use 10 tokens from owner
      await grvtoken.approve(accounts[5], 10, { from: accounts[0] });
      let allowance = await grvtoken.allowance(accounts[0], accounts[5]);
      assert.strictEqual(allowance.toNumber(), 10, "Wrong value allowed");

      // Transfering 5 tokens from owner to team by account 5
      await grvtoken.transferFrom(accounts[0], accounts[1], 5, {
        from: accounts[5]
      });
      let teamWallet = await grvtoken.balanceOf(accounts[1]);
      assert.strictEqual(
        teamWallet.toNumber(),
        5,
        "Wrong value transferred to team"
      );

      // Transfering 5 tokens from owner to account 5 by account 5
      await grvtoken.transferFrom(accounts[0], accounts[5], 5, {
        from: accounts[5]
      });
      wallet = await grvtoken.balanceOf(accounts[5]);
      assert.strictEqual(
        wallet.toNumber(),
        5,
        "Wrong value transferred to account 5"
      );
    });

    /**
     * Trying to transfer -1 token from owner to team
     * Cannot work
     */
    it("Transfer -1 token from owner to team", async () => {
      // Mint 10 tokens to owner
      await grvtoken.mint(accounts[0], 10, { from: accounts[0] });

      // Asserting the owner wallet
      let wallet = await grvtoken.balanceOf(accounts[0]);
      assert.strictEqual(wallet.toNumber(), 10, "Wrong tokens minted");

      // Transfer -1 token from owner to team
      assertRevert(
        grvtoken.transferFrom(accounts[0], accounts[1], -1, {
          from: accounts[0]
        })
      );
    });

    /**
     * Trying to transfer more tokens than it has
     * Cannot work
     */
    it("Transfer more token than it has", async () => {
      // Mint 10 tokens to owner
      await grvtoken.mint(accounts[0], 10, { from: accounts[0] });

      // Asserting the owner wallet
      let wallet = await grvtoken.balanceOf(accounts[0]);
      assert.strictEqual(wallet.toNumber(), 10, "Wrong tokens minted");

      // Transfer -1 token from owner to team
      assertRevert(
        grvtoken.transferFrom(accounts[0], accounts[1], 100, {
          from: accounts[0]
        })
      );
    });

    /**
     * Trying to transfer tokens to an invalid account
     * Cannot work
     */
    it("Trying to transfer tokens to an invalid account", async () => {
      // Mint 10 tokens to owner
      await grvtoken.mint(accounts[0], 10, { from: accounts[0] });

      // Asserting the owner wallet
      let wallet = await grvtoken.balanceOf(accounts[0]);
      assert.strictEqual(wallet.toNumber(), 10, "Wrong tokens minted");

      // Transfer -1 token from owner to team
      assertRevert(
        grvtoken.transferFrom(accounts[0], notAccount, 2, { from: accounts[0] })
      );
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

    /**
     * Trying to transfer -1 token from owner to team
     * Cannot work
     */
    it("Transfer -1 token from owner to team", async () => {
      // Mint 10 tokens to owner
      await grvtoken.mint(accounts[0], 10, { from: accounts[0] });

      // Asserting the owner wallet
      let wallet = await grvtoken.balanceOf(accounts[0]);
      assert.strictEqual(wallet.toNumber(), 10, "Wrong tokens minted");

      // Transfer -1 token from owner to team
      assertRevert(grvtoken.transfer(accounts[1], -1, { from: accounts[0] }));
    });

    /**
     * Trying to transfer more tokens than it has
     * Cannot work
     */
    it("Transfer more token than it has", async () => {
      // Mint 10 tokens to owner
      await grvtoken.mint(accounts[0], 10, { from: accounts[0] });

      // Asserting the owner wallet
      let wallet = await grvtoken.balanceOf(accounts[0]);
      assert.strictEqual(wallet.toNumber(), 10, "Wrong tokens minted");

      // Transfer -1 token from owner to team
      assertRevert(grvtoken.transfer(accounts[1], 100, { from: accounts[0] }));
    });

    /**
     * Trying to transfer tokens to an invalid account
     * Cannot work
     */
    it("Trying to transfer tokens to an invalid account", async () => {
      // Mint 10 tokens to owner
      await grvtoken.mint(accounts[0], 10, { from: accounts[0] });

      // Asserting the owner wallet
      let wallet = await grvtoken.balanceOf(accounts[0]);
      assert.strictEqual(wallet.toNumber(), 10, "Wrong tokens minted");

      // Transfer -1 token from owner to team
      assertRevert(grvtoken.transfer(notAccount, 2, { from: accounts[0] }));
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
      assert.strictEqual(allowance.toNumber(), 0);
    });

    /**
     * Approving 50 token to owner with team account, and testing
     * allowance equal to 50.
     */
    it("Approving 1 token to account 0 with account 1 and testing allowance account 1 and 0", async () => {
      await grvtoken.approve(accounts[0], 50, { from: accounts[1] });
      let allowance = await grvtoken.allowance.call(accounts[1], accounts[0]);
      assert.strictEqual(allowance.toNumber(), 50);
    });

    /**
     * Calling allowance with invalid accounts params
     */
    it("Allowance account 0 and invalid accounts", async () => {
      let allowance = await grvtoken.allowance.call(
        "0xD4e0023A3Fc5A0313c141964206Ec95C5Dfa60d0",
        "0xD3e0023A3Fc5A0313c141964206Ec95C5Dfa60d0"
      );
      assert.strictEqual(allowance.toNumber(), 0);
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
      assert.strictEqual(allowance.toNumber(), 8);
    });

    /**
     * Trying to decrease approval without approving before
     */
    it("Trying to decrease without approve", async () => {
      await grvtoken.decreaseApproval(accounts[0], 2, {
        from: accounts[1]
      });
      allowance = await grvtoken.allowance.call(accounts[1], accounts[0]);
      assert.strictEqual(allowance.toNumber(), 0);
    });

    /**
     * Trying to increase approval without approving before
     */
    it("Trying to increase without approve", async () => {
      await grvtoken.increaseApproval(accounts[0], 2, {
        from: accounts[1]
      });
      allowance = await grvtoken.allowance.call(accounts[1], accounts[0]);
      assert.strictEqual(allowance.toNumber(), 2);
    });

    /**
     * Trying to increase negative value
     */
    it("Trying to increase negative value", async () => {
      assertRevert(
        grvtoken.increaseApproval(accounts[0], -1, {
          from: accounts[1]
        })
      );
    });

    /**
     * Trying to decrease negative value
     */
    it("Trying to decrease negative value", async () => {
      assertRevert(
        grvtoken.decreaseApproval(accounts[0], -1, {
          from: accounts[1]
        })
      );
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

  /**
   * Testing renounceOwnership function
   */
  describe("Function renounceOwnership", () => {
    /**
     * Trying to renounce with not owner account
     */
    it("Trying to renounce with not owner", async () => {
      assertRevert(grvtoken.renounceOwnership({ from: accounts[5] }));
    });

    /**
     * Trying to renounce with invalid account
     */
    it("Trying to renounce with invalid account", async () => {
      assertRevert(grvtoken.renounceOwnership({ from: notAccount }));
    });

    /**
     * Renounce with owner account
     */
    it("Renouncing with owner", async () => {
      await grvtoken.renounceOwnership({ from: accounts[0] });
      // Trying to mint with old owner after renounce (should revert)
      assertRevert(grvtoken.mint(accounts[5], 1, { from: accounts[0] }));
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
        grvtoken.transferOwnership(accounts[5], { from: accounts[1] })
      );
    });

    /**
     * Trying to transfer with an invalid account
     */
    it("Trying to transfer with an invalid account", async () => {
      assertRevert(
        grvtoken.transferOwnership(accounts[5], { from: notAccount })
      );
    });

    /**
     * Trying to transfer to an invalid account
     */
    it("Trying to transfer to an invalid account", async () => {
      assertRevert(
        grvtoken.transferOwnership(notAccount, { from: accounts[0] })
      );
    });

    /**
     * Transfering ownership and asserting it
     */
    it("Transfering ownership and asserting it", async () => {
      await grvtoken.transferOwnership(accounts[5], { from: accounts[0] });
      assertRevert(grvtoken.mint(accounts[5], 15, { from: accounts[0] }));
      await grvtoken.mint(accounts[0], 16, { from: accounts[5] });
      let value = await grvtoken.balanceOf(accounts[0]);
      assert.strictEqual(value.toNumber(), 16, "Wrong value minted.");
    });

    /**
     * Transfering ownership many times
     */
    it("Transfering ownership many times", async () => {
      await grvtoken.transferOwnership(accounts[5], { from: accounts[0] });
      await grvtoken.transferOwnership(accounts[1], { from: accounts[5] });
      await grvtoken.transferOwnership(accounts[4], { from: accounts[1] });
      await grvtoken.transferOwnership(accounts[7], { from: accounts[4] });
      await grvtoken.transferOwnership(accounts[4], { from: accounts[7] });
      await grvtoken.transferOwnership(accounts[5], { from: accounts[4] });

      assertRevert(grvtoken.mint(accounts[5], 15, { from: accounts[0] }));
      await grvtoken.mint(accounts[0], 16, { from: accounts[5] });
      let value = await grvtoken.balanceOf(accounts[0]);
      assert.strictEqual(value.toNumber(), 16, "Wrong value minted.");
    });
  });
});
