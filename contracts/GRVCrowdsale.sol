pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
// Extension of Crowdsale contract whose tokens are minted in each purchase. Token ownership should be transferred to MintedCrowdsale for minting. 
import "../node_modules/zeppelin-solidity/contracts/crowdsale/emission/AllowanceCrowdsale.sol";
import "../node_modules/zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./IncreasingPriceCrowdsale.sol";
import "./GRVToken.sol";

/**
 * Crowdsale contract of the GravelCoin
 */
contract GRVCrowdsale is AllowanceCrowdsale, IncreasingPriceCrowdsale, Pausable{
    using SafeMath for uint256;

    /** 
     * @dev States of the crowdsale
     * - Unknown: Initialize state of the crowdsale, this is a virtual state.
     * - Preparing: All contract initialization calls and variables have not been set yet     
     * - Active: Active crowdsale     
     * - Paused: Paused crowdsale functions
     * - Refunding: Refunds are loaded on the contract for reclaim.
     * - SKAMB: 
     */
    enum State { Unknown, Preparing, Active, Paused, Refunding }

    // FIXME: get value from the token.
    uint256 public constant multiplier = 10 ** 1;

    // FIXME: update value from the price table
    uint256 public constant oneTokenInWei = (10000 * multiplier); // hardcoded 1 token = 0.0001 ethers

    // wallets address 
    address public walletTeam;
    address public walletAdvisor;

    // Crowdsale opening time
    uint256 public openingTime;
    // FIXME: change times
    uint256 public constant timeHoldTeam = 1;
    uint256 public constant timeHoldAdvisor = 1;

    // How much ETH each address has invested to this crowdsale
    mapping (address => uint256) public investedAmountOf;
    // How much tokens this crowdsale has credited for each investor address */
    mapping (address => uint256) public tokenAmountOf;
    // How many distinct addresses have invested 
    uint256 public investorCount = 0;
    // How much token sold
    uint256 public tokensSold = 0;
    // state of crowdsale
    State state = State.Unknow;
    
    /**
     * Construct of GRVCrowdsale.
     * @param _rate Number of token units a buyer gets per wei
     * @param _wallet Address where collected funds will be forwarded to
     * @param _token Address of the token being sold
     * @param _walletTeam wallet of the team 
     * @param _walletAdvisor wallet of the advisor
     * @param _openingTime Crowdsale opening time
     */
    constructor (uint256 _rate, 
                 address _wallet, 
                 GRVToken _token,
                 address _walletTeam,
                 address _walletAdvisor,
                 uint256 _openingTime)
      public  
      Crowdsale(_rate, _wallet, _token)
      // TODO: implements rules of the release block and weidh value            
      IncreasingPriceCrowdsale(oneTokenInWei, multiplier) {
        walletTeam = _walletTeam;
        walletAdvisor = _walletAdvisor;        
        openingTime = _openingTime;
    }

    //////////////////////////////////////////////////////
    /////// Basic functions of the crowdsale  ///////////
    ////////////////////////////////////////////////////

    /**
     * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met. Use super to concatenate validations.
     * @param _beneficiary Address performing the token purchase
     * @param _weiAmount Value in wei involved in the purchase
     * 
     * //override Crowdsale._preValidatePurchase
     * //modify whenNotPaused
     */
    function _preValidatePurchase(
        address _beneficiary,
        uint256 _weiAmount
    )
    internal whenNotPaused
    {
        super._preValidatePurchase(_beneficiary, _weiAmount);
    }


    /**
     * @dev Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
     * @param _beneficiary Address receiving the tokens
     * @param _tokenAmount Number of tokens to be purchased
     * 
     * //override Crowdsale._processPurchase
     * //modify whenNotPaused
     */
    function _processPurchase(
        address _beneficiary,
        uint256 _tokenAmount
    )
      internal whenNotPaused
    {
        _deliverTokens(_beneficiary, _tokenAmount);        
        
        if(investedAmountOf[_beneficiary] == 0) {
            // A new investor
            investorCount++;
        }

        // Update investor        
        tokenAmountOf[_beneficiary].add(_tokenAmount);
        // update token sold
        tokensSold.add(_tokenAmount);        
    }   

    /**
     * @dev Override for extensions that require an internal state to check for validity (current user contributions, etc.)
     * @param _beneficiary Address receiving the tokens
     * @param _weiAmount Value in wei involved in the purchase
     *
     * //override Crowdsale._updatePurchasingState
     * //modify whenNotPaused
     */
    function _updatePurchasingState(
        address _beneficiary,
        uint256 _weiAmount
    )
      internal whenNotPaused
    {
        // Update investor
        investedAmountOf[_beneficiary].add(_weiAmount);
    } 

    //////////////////////////////////////////////////////
    //////////// manegemant crowdsale  //////////////////
    ////////////////////////////////////////////////////

    /// STATE MACHINE
    /**
     * Crowdfund state machine management.
     *
     * We make it a function and do not assign the result to a variable, so there is no chance of the variable being stale.
     */
     // FIXME: change implementation, it's wrong.
    function getState() public view returns (State) {
        if (paused) return State.Paused;
        /*if (isMaximumGoalReached()) return State.Success;
        else if (address(finalizeAgent) == 0) return State.Preparing;
        else if (block.timestamp < startTimePreICO) return State.Preparing;
        else if (block.timestamp > startTimePreICO && block.timestamp <= closeTimePreICO) return State.PreFunding;
        else if (block.timestamp > startTimeICO && block.timestamp <= closeTimeICO && !isCrowdsaleFull()) return State.Funding;
        else if (isMinimumGoalReached()) return State.Success;
        else if (!isMinimumGoalReached() && weiRaised > 0 && loadedRefund >= weiRaised) return State.Refunding;
        else return State.Failure;*/
        else return State.Unknow;
    }

}