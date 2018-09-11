pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
// Extension of Crowdsale contract whose tokens are minted in each purchase. Token ownership should be transferred to MintedCrowdsale for minting. 
import "../node_modules/zeppelin-solidity/contracts/crowdsale/emission/AllowanceCrowdsale.sol";
import "../node_modules/zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./IncreasingPriceCrowdsale.sol";
import "./GRVToken.sol";

/**
 * @title GRVCrowdsale
 * @dev Crowdsale contract of the GravelCoin
 */
contract GRVCrowdsale is IncreasingPriceCrowdsale, Pausable{
    using SafeMath for uint256;

    /** 
     * @dev States of the crowdsale
     * - Unknown: Initialize state of the crowdsale, this is a virtual state.
     * - Preparing: All contract initialization calls and variables have not been set yet     
     * - Active: Active crowdsale     
     * - Paused: Paused crowdsale functions
     * - ICO: 
     * - ContinueSale: 
     * - Refunding: Refunds are loaded on the contract for reclaim.
     * - SKAMB: 
     */
    enum State { Unknown, Preparing, Active, Paused, ICO, ContinueSale, Refunding }

    // FIXME: get value from the token.
    uint256 public constant multiplier = 10 ** 1;

    // wallets address 
    address public walletTeam;
    address public walletAdvisor;

    // Crowdsale opening time
    uint256 public openingTime;
    // FIXME: change times
    uint256 public constant timeHoldTeam = 183 days;
    uint256 public constant timeHoldAdvisor = 365 days;

    // FIXME: change values of the team and advisor.
    uint256 public constant TOKEN_OF_THE_TEAM = 12500000;
    uint256 public constant TOKEN_OF_THE_ADVISOR = 6666667;
    uint256 public constant TOKEN_OF_THE_AIRDROP = 1666667;
    uint256 public constant TOKEN_OF_THE_SALE = 62500000;
    // Initial token supply...
    uint256 public constant INITIAL_SUPPLY = TOKEN_OF_THE_TEAM + TOKEN_OF_THE_ADVISOR + TOKEN_OF_THE_AIRDROP;
    // initial totalSupply planned ...
    uint256 public totalInitialSupply = TOKEN_OF_THE_AIRDROP + TOKEN_OF_THE_TEAM + TOKEN_OF_THE_ADVISOR + TOKEN_OF_THE_AIRDROP + TOKEN_OF_THE_SALE;

    // How much ETH each address has invested to this crowdsale
    mapping (address => uint256) public investedAmountOf;
    // How much tokens this crowdsale has credited for each investor address */
    mapping (address => uint256) public tokenAmountOf;
    // How many distinct addresses have invested 
    uint256 public investorCount = 0;
    // state of crowdsale
    State state = State.Unknown;
    
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
                 uint256 _oneTokenInWei,
                 uint256 _openingTime)
      public  
      Crowdsale(_rate, _wallet, _token)              
      IncreasingPriceCrowdsale(_oneTokenInWei, multiplier) {
        walletTeam = _walletTeam;
        walletAdvisor = _walletAdvisor;        
        openingTime = _openingTime;        
    }

    //====================================================================================================//
    //                                               Events 
    //====================================================================================================//
       


    //====================================================================================================//
    //                                 Basic functions of the crowdsale  
    //====================================================================================================//

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
        IncreasingPriceCrowdsale._processPurchase(_beneficiary, _tokenAmount);
        
        if(investedAmountOf[_beneficiary] == 0) {
            // A new investor
            investorCount++;
        }

        // Update investor        
        tokenAmountOf[_beneficiary].add(_tokenAmount);            
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

   /**
     * @dev Overrides delivery by minting tokens upon purchase.
     * @param _beneficiary Token purchaser
     * @param _tokenAmount Number of tokens to be minted ou transfer to beneficiary.
     */
    function _deliverTokens(
        address _beneficiary,
        uint256 _tokenAmount
    )
        internal
    {        
        // if all tokens not minted yet, minted token
        if (token.totalSupply() < totalInitialSupply){
            require(GRVToken(token).mint(_beneficiary, _tokenAmount));
        } else {
            // if all tokens minted, transfer token minted and refound...
            super._deliverTokens(_beneficiary, _tokenAmount);
        }
    }

    //====================================================================================================//
    //                                   manegemant crowdsale Contract Functions
    //====================================================================================================//

    function preAllocate() public onlyOwner returns (bool){
        state = State.Preparing;
        // rules of hold team and advisor
        GRVToken coin = GRVToken(token);
        
        //coin.mint(owner, INITIAL_SUPPLY);

        // mint GRV of the team
        coin.mint(walletTeam, TOKEN_OF_THE_TEAM);
        // mint GRV of the advisor
        coin.mint(walletAdvisor, TOKEN_OF_THE_ADVISOR);

        // FIXME: Add aridrop wallet...
        // mint GRV of the AIRDROP
        //coin.mint(walletAirdrop, TOKEN_OF_THE_AIRDROP);

        // hold team
        uint256 closeTimeTeam = openingTime;
        closeTimeTeam = closeTimeTeam.add(timeHoldTeam);
        coin.addLimitedTransfer(walletTeam, closeTimeTeam);
        // hold advisor
        uint256 closeTimeAdvisor = openingTime;
        closeTimeAdvisor = closeTimeAdvisor.add(timeHoldAdvisor);
        coin.addLimitedTransfer(walletAdvisor, closeTimeAdvisor);
        state = State.Active;
        return true;
    }

    /// STATE MACHINE
    /**
     * Crowdfund state machine management.
     *
     * We make it a function and do not assign the result to a variable, so there is no chance of the variable being stale.
     */
     // FIXME: change implementation, it's wrong.
    function getState() public view returns (State) {
        //if (paused) return State.Paused;
        /*if (isMaximumGoalReached()) return State.Success;
        else if (address(finalizeAgent) == 0) return State.Preparing;
        else if (block.timestamp < startTimePreICO) return State.Preparing;
        else if (block.timestamp > startTimePreICO && block.timestamp <= closeTimePreICO) return State.PreFunding;
        else if (block.timestamp > startTimeICO && block.timestamp <= closeTimeICO && !isCrowdsaleFull()) return State.Funding;
        else if (isMinimumGoalReached()) return State.Success;
        else if (!isMinimumGoalReached() && weiRaised > 0 && loadedRefund >= weiRaised) return State.Refunding;
        else return State.Failure;*/
        //else return State.Unknown;
        return state;
    }
    
    /**
     * @dev Release new coin of the crowdsale.
     * @param _tokenAmount amount of the coin
     *
     */
    function mintToken(uint256 _tokenAmount) external onlyOwner {
        require(_tokenAmount > 0);
        GRVToken coin = GRVToken(token);
        coin.mint(owner, _tokenAmount);
    }

}