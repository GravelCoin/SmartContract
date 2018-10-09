pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/zeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./GRVToken.sol";

/**
 * @title IncreasingPriceCrowdsale
 * @dev Extension of Crowdsale contract that increases the price of tokens linearly in time.
 * Note that what should be provided to the constructor is the initial and final _rates_, that is,
 * the amount of tokens per wei contributed. Thus, the initial rate must be greater than the final rate.
 */
contract IncreasingPriceCrowdsale is Crowdsale, Ownable {
    using SafeMath for uint256;   
    
    // FIXME: Update max blocks from the withepaper.
    /* MAX BLOCKS OF THE CROWDSALE */
    uint256 public constant MAX_BLOCKS_CROWDSALE = 3;

    /* the number of tokens already sold through this contract*/
    uint256 public tokensSold = 0;
    
    /* How many weis one token costs */
    uint256 public oneTokenInWei;
    
    /* manager release blocks... */
    // initialize blocks of the Crowdsale
    uint256[] public blocks;
    uint256[] public blocksPrice;
    uint256   public currentBlock = 0;

    /**
     * @dev Constructor, takes intial and final rates of tokens received per wei contributed.
     * @param _oneTokenInWei value of one tokens 
     * 
     */
    constructor(uint256 _oneTokenInWei, uint256[] _blocks, uint256[] _blocksPrice) public {                
        require(_oneTokenInWei > 0);
        oneTokenInWei = _oneTokenInWei;
        blocks = _blocks;
        blocksPrice = _blocksPrice;
    }
    
    //====================================================================================================//
    //                                               Events 
    //====================================================================================================//
    event UpdateTokenPrice(uint256 _tokenPriceInWei);


    /**
     * @dev Returns the rate of tokens per eth at the present tokenSold.
     * Note that, as price _increases_ with _totalSupply of the toekn, the rate _decreases_.
     * @return The number of tokens a buyer gets per eth at a given tokenSold
     *
     * /override Crowdsale.getCurrentRate
     */
    function getCurrentRate() public view returns (uint256) { 
        if (currentBlock < MAX_BLOCKS_CROWDSALE){
            uint256 txPrice = blocksPrice[currentBlock];
            return oneTokenInWei.mul(txPrice).div(100);
        } else {
            return oneTokenInWei;
        }
    }

    /**
     * @dev Overrides parent method taking into account variable rate.
     * @param _weiAmount The value in wei to be converted into tokens
     * @return The number of tokens _weiAmount wei will buy at present tokenSold
     *
     * /override Crowdsale._getTokenAmount
     */
    function _getTokenAmount(uint256 _weiAmount)
        internal view returns (uint256)
    {        
        uint256 currentRate = getCurrentRate();
        
        // rule of block distribution
        uint256 tokenAmount = _weiAmount.div(currentRate);
        uint256 tokenLeft = getTokenLeft();
        // test token of the block
        require(tokenAmount <= tokenLeft, "Token left insuficient.");
        
        return tokenAmount;
    }
    
    function getTokenLeft() public view returns(uint256){
        uint256 tokenReserved = blocks[currentBlock];
        uint256 tokenLeft = tokenReserved.sub(token.totalSupply());
        return tokenLeft;
    }
    
    /* Check for sane ether to token price */
    modifier isTokenPriceSane(uint _value){
        require(_value > 0);
        _;
    }

    /**
     * @dev Updates the token price, only to be called by owner, 
     * @param _oneTokenInWei new price of the one token in wei
     *
     */
    function updateTokenPrice(uint256 _oneTokenInWei) isTokenPriceSane(_oneTokenInWei) onlyOwner external {
        oneTokenInWei = _oneTokenInWei;
        emit UpdateTokenPrice(_oneTokenInWei);
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
      internal
    {
        super._processPurchase(_beneficiary, _tokenAmount);        
        
        // update token sold
        tokensSold = tokensSold.add(_tokenAmount);
    }   
    
    /**
     * @dev Override for extensions that require an internal state to check for validity (current user contributions, etc.)
     * @param _beneficiary Address receiving the tokens
     * @param _weiAmount Value in wei involved in the purchase
     *
     * //override Crowdsale._updatePurchasingState
     * 
     */
    function _updatePurchasingState(
        address _beneficiary,
        uint256 _weiAmount
    )
      internal 
    {
        // if max blocks not target increment currnetBlock
        // if tokenLeft of the currnet block = 0 increment currnetBlock
        if (currentBlock < MAX_BLOCKS_CROWDSALE && token.totalSupply() == blocks[currentBlock]){
            currentBlock = currentBlock.add(1);
        }
    } 

}