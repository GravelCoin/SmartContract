pragma solidity ^0.4.18;

/**
 * @title Ownable
 * The Ownable contract has an owner address, and provides basic authorization control 
 * functions, this simplifies the implementation of "user permissions".
 *
 */
contract Ownable {
  /* Current Owner */
  address public owner;

  /* New owner which can be set in future */
  address public newOwner;

  /* event to indicate finally ownership has been succesfully transferred and accepted */
  event OwnershipTransferred(address indexed _from, address indexed _to);
  
  /** 
   * The Ownable constructor sets the original `owner` of the contract to the sender account.
   */
  function Ownable() {
    owner = msg.sender;
  }

  /**
   * Throws if called by any account other than the owner. 
   */
  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  /**
   * Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to. 
   */
  function transferOwnership(address _newOwner) onlyOwner {
    require(_newOwner != address(0));
    newOwner = _newOwner;
  }

  /**
   * Allows the new owner toaccept ownership
   */
  function acceptOwnership() {
    require(msg.sender == newOwner);
    OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}

/**
 * @title Destructible
 * @dev Base contract that can be destroyed by owner. All funds in contract will be sent to the owner.
 * inspired from openzeppelin : https://github.com/OpenZeppelin/zeppelin-solidity/tree/master/contracts
 */
contract Destructible is Ownable {

  function Destructible() payable { } 

  /**
   * @dev Transfers the current balance to the owner and terminates the contract. 
   */
  function destroy() onlyOwner {
    selfdestruct(owner);
  }

  function destroyAndSend(address _recipient) onlyOwner {
    selfdestruct(_recipient);
  }
}

/**
 * @title ERC20 interface
 * see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 {

  uint public totalSupply;
  uint public decimals;
  
  function balanceOf(address who) constant returns (uint);
  function allowance(address owner, address spender) constant returns (uint);

  function transfer(address to, uint value) returns (bool ok);
  function transferFrom(address from, address to, uint value) returns (bool ok);
  function approve(address spender, uint value) returns (bool ok);
  
  event Transfer(address indexed from, address indexed to, uint value);
  event Approval(address indexed owner, address indexed spender, uint value);

  function releaseTokenTransfer();

}



/* 
*This library is used to do mathematics safely 
*/
contract SafeMathLib {
  function safeMul(uint a, uint b) returns (uint) {
    uint c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function safeSub(uint a, uint b) returns (uint) {
    assert(b <= a);
    return a - b;
  }

  function safeAdd(uint a, uint b) returns (uint) {
    uint c = a + b;
    assert(c>=a);
    return c;
  }
}

/*
 * Haltable
 * Abstract contract that implement an
 * emergency stop mechanism. Differs from Pausable by causing a throw when in halt mode.
 * Originally envisioned in FirstBlood ICO contract.
 * Taken and inspired from https://tokenmarket.net contract
 */
contract Haltable is Ownable {
  
  bool public halted;

  modifier stopInEmergency {
    require(!halted);
    _;
  }

  modifier onlyInEmergency {
    require(halted);
    _;
  }

  // called by the owner on emergency, triggers stopped state
  function halt() external onlyOwner {
    halted = true;
  }

  // called by the owner on end of emergency, returns to normal state
  function unhalt() external onlyOwner onlyInEmergency {
    halted = false;
  }

}

 /* Features and mechanism are inspired from https://tokenmarket.net crowdsale contract and updated for simple usage*/
contract Crowdsale is Haltable, Destructible, SafeMathLib {

  /* Max investment count when we are still allowed to change the multisig address */
  uint public MAX_INVESTMENTS_BEFORE_MULTISIG_CHANGE = 5;

  /* start time for the ICO */
  uint public startTimeICO;

  /* end time for the ICO */
  uint public closeTimeICO;

   /* start time for the Pre-ICO */
  uint public startTimePreICO;

  /* end time for the Pre-ICO */
  uint public closeTimePreICO;
  
  /* the address of the token */
  ERC20 public token;

  /* The party who holds the full token pool and has approve()'ed tokens for this crowdsale */
  address public beneficiary;

  /* tokens will be transfered from this address */
  address public multisigWallet;

  /* tokens avaialble for the Pre-ICO */
  uint public availableTokensPreICO = 400000000 *  (10**18); //40 million tokens

  /* tokens avaialble for the ICO */
  uint public availableTokensICO = 400000000 *  (10**18); //40 million tokens

  /* if the funding goal is not reached, investors may withdraw their funds */
  uint public minimumFundingGoal = 10000 * (10**18);  //10000 eth

  /* Maximum funding goal which is the hard cap */
  uint public maximumFundingGoal = 80000 * (10**18);   //80000 eth

  /* the number of tokens already sold through this contract*/
  uint public tokensSold = 0;

  /* How many wei of funding we have raised */
  uint public weiRaised = 0;

  /* How many distinct addresses have invested */
  uint public investorCount = 0;

  /* How much wei we have returned back to the contract after a failed crowdfund. */
  uint public loadedRefund = 0;

  /* How much wei we have given back to investors.*/
  uint public weiRefunded = 0;

  /* Has this crowdsale been finalized */
  bool public finalized;

  /* Post-success callback */
  address public finalizeAgent;

  /* How many weis one token costs */
  uint public oneTokenInWei;

  /* Price after discount */
  uint public currentPrice;

   /* How much ETH each address has invested to this crowdsale */
  mapping (address => uint256) public investedAmountOf;

  /* How much tokens this crowdsale has credited for each investor address */
  mapping (address => uint256) public tokenAmountOf;

  /** State machine
   *
   * - Preparing: All contract initialization calls and variables have not been set yet
   * - Prefunding: We have not passed start time yet
   * - Funding: Active crowdsale
   * - Success: Minimum funding goal reached
   * - Failure: Minimum funding goal not reached before ending time
   * - Finalized: The finalized has been called and succesfully executed
   * - Refunding: Refunds are loaded on the contract for reclaim.
   */
  enum State{Unknown, Preparing, PreFunding, Funding, Success, Failure, Finalized, Refunding}

  // A new investment was made
  event Invested(address investor, uint weiAmount, uint tokenAmount);

  // Refund was processed for a contributor
  event Refund(address investor, uint weiAmount);

  // Crowdsale end time has been changed
  event EndsAtChanged(uint newEndsAt);


  /// Modifiers

  /** Modified allowing execution only if the crowdsale is currently running.  */
  modifier inState(State state) {
    require(getState() == state);
    _;
  }


  /* Check for sane ether to token price */
  modifier isTokenPriceSane(uint _value) {
    require(_value > 0);
    _;
  }

  /** Interface marker. */
  function isCrowdsale() public constant returns (bool) {
    return true;
  }


  /** Constructor to initialize all variables, including Crowdsale variables
    * @param _token : Address of the deployed DayToken contract
    * @param _startPreIco : unix timestamp for start of pre ICO
    * @param _startIco : unix timestamp for start of ICO
    * @param _beneficiary : benficiary to be added
    * @param _multisigWallet : multisig wallet address
    */
    function Crowdsale(address _token, uint _startPreIco, uint _startIco, address _beneficiary, address _multisigWallet) {

      owner = msg.sender;

      startTimePreICO = _startPreIco;
      closeTimePreICO = startTimePreICO + 15 days;

      startTimeICO = _startIco; 
      closeTimeICO = startTimeICO + 31 days;

      // check token address
      require(_token != address(0));
      token = ERC20(_token);

      //check beneficiary address
      require(_beneficiary != address(0));
      beneficiary = _beneficiary;

      // check multisig address
      require(multisigWallet != 0);
      multisigWallet = _multisigWallet;

      oneTokenInWei = (10000 * (10**token.decimals())); // hardcoded 1 token = 0.0001 ethers
    } 

    /**
     * Make an investment.
     *
     * Crowdsale must be running for one to invest.
     * We must have not pressed the emergency brake.
     *
     * @param receiver The Ethereum address who receives the tokens
     *
     */
    function investInternal(address receiver) stopInEmergency private {

      
      require((getState() == State.PreFunding) ||  (getState() == State.Funding));
      
      uint weiAmount = msg.value;
      
      uint tokenAmount = calculateTokens(weiAmount, token.decimals());
	  require(tokenAmount != 0);

	  if(getState() == State.PreFunding) {
        // pre-ico is done here to check if cap is broken for pre ico
         availableTokensPreICO = safeSub(availableTokensPreICO, tokenAmount);
      }
  
      if(investedAmountOf[receiver] == 0) {
         // A new investor
         investorCount++;
      }

      // Update investor
      investedAmountOf[receiver] = safeAdd(investedAmountOf[receiver], weiAmount);
      tokenAmountOf[receiver] = safeAdd(tokenAmountOf[receiver], tokenAmount);

      // Update totals
      weiRaised = safeAdd(weiRaised, weiAmount);
      tokensSold = safeAdd(tokensSold, tokenAmount);

      // Check that we did not bust the cap
      require(!isBreakingCap(tokenAmount));

      assignTokens(receiver, tokenAmount);

      // Pocket the money
      require(multisigWallet.send(weiAmount));

      // Tell us invest was success
      Invested(receiver, weiAmount, tokenAmount);
    }

    /**
      * Transfer tokens from approve() pool to the buyer.
      * Use approve() given to this crowdsale to distribute the tokens.
      */
    function assignTokens(address receiver, uint tokenAmount) private {
      require(token.transferFrom(beneficiary, receiver, tokenAmount));
    }



  /**
   * Preallocate tokens for the early investors.
   *
   * Preallocated tokens have been sold before the actual crowdsale opens.
   * This function mints the tokens and moves the crowdsale needle.
   *
   * Investor count is not handled; it is assumed this goes for multiple investors
   * and the token distribution happens outside the smart contract flow.
   *
   * No money is exchanged, as the crowdsale team already have received the payment.
   *
   * @param fullTokens tokens as full tokens - decimal places added internally
   * @param weiPrice Price of a single full token in wei
   *
   */
  function preallocate(address receiver, uint fullTokens, uint weiPrice) public onlyOwner {

    uint tokenAmount = fullTokens * 10**token.decimals();
    uint weiAmount = weiPrice * fullTokens; // This can be also 0, we give out tokens for free

    weiRaised = safeAdd(weiRaised, weiAmount);
    tokensSold = safeAdd(tokensSold, tokenAmount);

    investedAmountOf[receiver] = safeAdd(investedAmountOf[receiver], weiAmount);
    tokenAmountOf[receiver] = safeAdd(tokenAmountOf[receiver], tokenAmount);

    assignTokens(receiver, tokenAmount);
    // Tell us invest was success
    Invested(receiver, weiAmount, tokenAmount);
  }

  /**
   * When somebody tries to buy tokens for X eth, calculate how many tokens they get.
   *
   * @param value - What is the value of the transaction send in as wei
   * @param decimals - how many decimal units the token has
   * @return Amount of tokens the investor receives
   */
  function calculateTokens(uint value, uint decimals) public constant returns (uint tokenAmount){
    
    uint multiplier = 10 ** decimals;

    
    if(block.timestamp < (startTimePreICO + 1 days)){
      // 25% discount
    	currentPrice = safeMul(oneTokenInWei, 75) / 100; 
    }else if(block.timestamp < closeTimePreICO){
    	// 24% - reduction in price each day
    	currentPrice = safeSub(oneTokenInWei,(10 +  (closeTimePreICO - block.timestamp) * oneTokenInWei / 100 days));
    }else if(block.timestamp < startTimeICO + 10 days){
      // 1% reduction in price each day
      currentPrice = safeSub(oneTokenInWei,((startTimeICO + 10 days - block.timestamp) * oneTokenInWei / 100 days));
    }
    else{
      currentPrice = oneTokenInWei;
    }

    return safeMul(value, multiplier) / currentPrice;
  }


  /**
    * The basic entry point to participate the crowdsale process.
    *
    * Pay for funding, get invested tokens back in the sender address.
    */
  function buy() public payable {
    investInternal(msg.sender);
  }

  /* just send in money and get tokens. */
  function() payable {
    investInternal(msg.sender);
  }



  /// Update Functions


  /* only to be called by owner, updates the token price*/
  function updateTokenPrice(uint _oneTokenInWei) isTokenPriceSane(_oneTokenInWei) onlyOwner {
    oneTokenInWei = _oneTokenInWei;
  }

    /**
     * Allow to change the team multisig address in the case of emergency.
     *
     * This allows to save a deployed crowdsale wallet in the case the crowdsale has not yet begun
     * (we have done only few test transactions). After the crowdsale is going
     * then multisig address stays locked for the safety reasons.
     */
    function setMultisig(address addr) public onlyOwner {

      // Change
      if(investorCount > MAX_INVESTMENTS_BEFORE_MULTISIG_CHANGE) {
        revert();
      }

      multisigWallet = addr;
    }

    /**
     * Allow crowdsale owner to close early or extend the crowdsale.
     */
    function setEndsAt(uint _time) onlyOwner {
      require(!(block.timestamp > _time)); // Don't change past
      closeTimeICO = _time;
      EndsAtChanged(closeTimeICO);
    }

    /**
     * Allow to (re)set finalize agent.
     */
    function setFinalizeAgent(address addr) onlyOwner {
      finalizeAgent = addr;
    }

    
/// Constant Informatory Functions

    /**
     * To confirm if the current investment does not break our cap rule.
     */
    function isBreakingCap(uint _tokenAmount) constant returns (bool limitBroken) {
      
      if(_tokenAmount > getTokensLeft()) {
        return true;
      } else {
        return false;
      }
    }

    /**
     * We are sold out when our approve pool becomes empty.
     */
    function isCrowdsaleFull() public constant returns (bool) {
      return getTokensLeft() == 0;
    }

    /**
     * Get the amount of unsold tokens allocated to this contract;
     */
    function getTokensLeft() public constant returns (uint) {
       return token.allowance(beneficiary, this);
    }

    /**
      * @return true if the crowdsale has raised enough money to be a successful.
      */
    function isMinimumGoalReached() public constant returns (bool reached) {
      return weiRaised >= minimumFundingGoal;
    }

    /**
      * @return true if the crowdsale has raised  money for the hard cap.
      */
    function isMaximumGoalReached() public constant returns (bool reached) {
      return weiRaised >= maximumFundingGoal;
    }

    


/// STATE MACHINE
    /**
     * Crowdfund state machine management.
     *
     * We make it a function and do not assign the result to a variable, so there is no chance of the variable being stale.
     */
    function getState() public constant returns (State) {
      if(finalized) return State.Finalized;
      else if (isMaximumGoalReached()) return State.Success;
      else if (address(finalizeAgent) == 0) return State.Preparing;
      else if (block.timestamp < startTimePreICO) return State.Preparing;
      else if (block.timestamp > startTimePreICO && block.timestamp <= closeTimePreICO) return State.PreFunding;
      else if (block.timestamp > startTimeICO && block.timestamp <= closeTimeICO && !isCrowdsaleFull()) return State.Funding;
      else if (isMinimumGoalReached()) return State.Success;
      else if (!isMinimumGoalReached() && weiRaised > 0 && loadedRefund >= weiRaised) return State.Refunding;
      else return State.Failure;
    }


    
    /// REFUND MODULE

    /**
     * Allow load refunds back on the contract for the refunding.
     *
     * The team can transfer the funds back on the smart contract in the case the minimum goal was not reached..
     */
    function loadRefund() public payable inState(State.Failure) {
      require(msg.value != 0);
      loadedRefund = safeAdd(loadedRefund, msg.value);
    }

    /**
     * Investors can claim refund.
     *
     * Note that any refunds from proxy buyers should be handled separately,
     * and not through this contract.
     */
    function refund() public inState(State.Refunding) {
      uint256 weiValue = investedAmountOf[msg.sender];
      require(weiValue != 0);
      investedAmountOf[msg.sender] = 0;
      weiRefunded = safeAdd(weiRefunded, weiValue);
      Refund(msg.sender, weiValue);
      require(msg.sender.send(weiValue));
    }

    

    /// FINALIZE AND RELEASE

    /**
     * Finalize a succcesful crowdsale.
     *
     * The owner can triggre a call the contract that provides post-crowdsale actions, like releasing the tokens.
     */
    function finalize() public inState(State.Success) stopInEmergency {

      // Already not finalized
      require(!finalized);

      require(finalizeAgent == msg.sender);
      token.releaseTokenTransfer();
      finalized = true;

    }
   
}