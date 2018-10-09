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

    // wallets address 
    address public walletTeam;
    address public walletAdvisor;
    address public walletAirdrop;

    // Crowdsale opening time
    uint256 public openingTime;
    // FIXME: change times
    uint256 public constant timeHoldTeam    = 2 days;//183 days;
    uint256 public constant timeHoldAdvisor = 1 days;//365 days;

    // FIXME: change values of the team and advisor.
    uint256 public constant TOKEN_OF_THE_TEAM       = 12500000;
    uint256 public constant TOKEN_OF_THE_ADVISOR    = 6666667;
    uint256 public constant TOKEN_OF_THE_AIRDROP    = 1666667;
    uint256 public constant TOKEN_OF_THE_SALE       = 20833386;//62500000;
    // Initial token supply...
    uint256 public constant INITIAL_SUPPLY = TOKEN_OF_THE_TEAM + TOKEN_OF_THE_ADVISOR + TOKEN_OF_THE_AIRDROP;
    // initial totalSupply planned ...
    uint256 public totalInitialSupply = INITIAL_SUPPLY + TOKEN_OF_THE_SALE;

    // How much ETH each address has invested to this crowdsale
    mapping (address => uint256) public investedAmountOf;
    // How much tokens this crowdsale has credited for each investor address */
    mapping (address => uint256) public tokenAmountOf;
    // How many distinct addresses have invested 
    uint256 public investorCount = 0;
    // state of crowdsale
    State public state = State.Unknown;
    
    /**
     * Construct of GRVCrowdsale.
     * @param _rate Number of token units a buyer gets per wei
     * @param _wallet Address where collected funds will be forwarded to
     * @param _token Address of the token being sold
     * @param _walletTeam wallet of the team
     * @param _walletAdvisor wallet of the advisor
     * @param _walletAirdrop wallet of the Airdrop
     * @param _openingTime Crowdsale opening time
     * @param _blocks blocks of the token to Crowdsale
     * @param _blocks percent price of the _oneTokenInWei per block
     */
    constructor (uint256 _rate, 
                 address _wallet, 
                 GRVToken _token,
                 address _walletTeam,
                 address _walletAdvisor,
                 address _walletAirdrop,
                 uint256 _oneTokenInWei,
                 uint256 _openingTime, 
                 uint256[] _blocks,
                 uint256[] _blocksPrice
                 )
      public  
      Crowdsale(_rate, _wallet, _token)              
      IncreasingPriceCrowdsale(_oneTokenInWei, _blocks, _blocksPrice) {
        walletTeam = _walletTeam;
        walletAdvisor = _walletAdvisor;        
        walletAirdrop = _walletAirdrop;
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
     * //modify whenNotPaused - rule of the Paused smart contract
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

        // Update tokenAmount        
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
        // call super class.
        super._updatePurchasingState(_beneficiary, _weiAmount);
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
        // if all tokens not minted yet OR balance less , minted token
        uint256 balanceTokenWalletCrowdSale = token.balanceOf(wallet);
        if ((token.totalSupply() < totalInitialSupply) || (balanceTokenWalletCrowdSale < _tokenAmount) ){
            require(GRVToken(token).mint(_beneficiary, _tokenAmount));
        } else {
            // if all tokens minted, transfer token minted and refound...
            super._deliverTokens(_beneficiary, _tokenAmount);
        }
    }

    //====================================================================================================//
    //                                   manegemant crowdsale Contract Functions
    //====================================================================================================//

    /**
     * @dev initialize crowdsale 
     * 
     * 
     */
    function preAllocate() public onlyOwner returns (bool){
        if (state == State.Unknown){
            state = State.Preparing;
            // rules of hold team and advisor
            GRVToken coin = GRVToken(token);
    
            // mint GRV of the team
            coin.mint(walletTeam, TOKEN_OF_THE_TEAM);
            // mint GRV of the advisor
            coin.mint(walletAdvisor, TOKEN_OF_THE_ADVISOR);
            // mint GRV of the AIRDROP
            coin.mint(walletAirdrop, TOKEN_OF_THE_AIRDROP);
    
            // hold team
            uint256 closeTimeTeam = openingTime;
            closeTimeTeam = closeTimeTeam.add(timeHoldTeam);
            coin.addLimitedTransfer(walletTeam, TOKEN_OF_THE_TEAM, closeTimeTeam);
            // hold advisor
            uint256 closeTimeAdvisor = openingTime;
            closeTimeAdvisor = closeTimeAdvisor.add(timeHoldAdvisor);
            coin.addLimitedTransfer(walletAdvisor, TOKEN_OF_THE_ADVISOR, closeTimeAdvisor);
            state = State.Active;
            return true;
        } else{
            return false;
        }
        
    }

    /**
     * @dev Release new coin of the crowdsale.
     * @param _tokenAmount amount of the coin
     *
     */
    function mintToken(uint256 _tokenAmount) external onlyOwner {
        require(_tokenAmount > 0, "tokenAmount less than zero.");
        require(currentBlock >= MAX_BLOCKS_CROWDSALE, "GRVC in release  block state");
        GRVToken coin = GRVToken(token);
        coin.mint(wallet, _tokenAmount);
    }
    
    /**
     * @dev Manager GRGRVToken Hold rule (limited Transfer)
     * @param _limitedTransfer Bool value of limited control enable or disable
     * 
     */
    function updateLimited(bool _limitedTransfer) public onlyOwner returns(bool) {
        GRVToken coin = GRVToken(token);
        return coin.updateLimited(_limitedTransfer);
    }

}