pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/zeppelin-solidity/contracts/crowdsale/Crowdsale.sol";


/**
 * @title IncreasingPriceCrowdsale
 * @dev Extension of Crowdsale contract that increases the price of tokens linearly in time.
 * Note that what should be provided to the constructor is the initial and final _rates_, that is,
 * the amount of tokens per wei contributed. Thus, the initial rate must be greater than the final rate.
 */
contract IncreasingPriceCrowdsale is Crowdsale {
    using SafeMath for uint256;   

    /* the number of tokens already sold through this contract*/
    uint256 public tokensSold = 0;
    
    /* How many weis one token costs */
    uint256 public oneTokenInWei;

    uint256 public multiplier;

    /**
     * @dev Constructor, takes intial and final rates of tokens received per wei contributed.
     * @param _oneTokenInWei value of one tokens 
     * @param _multiplier to be define
     * 
     */
    constructor(uint256 _oneTokenInWei, uint256 _multiplier) public {                
        require(_oneTokenInWei > 0);
        require(_multiplier > 0);
        oneTokenInWei = _oneTokenInWei;
        multiplier = _multiplier;
    }

    /**
     * @dev Returns the rate of tokens per eth at the present tokenSold.
     * Note that, as price _increases_ with tokenSold, the rate _decreases_.
     * @return The number of tokens a buyer gets per eth at a given tokenSold
     *
     * /override Crowdsale.getCurrentRate
     */
     // TODO: rever tabela de preços atualizada
    function getCurrentRate() public view returns (uint256) {        
        // price of U$ 0.04 - 40% of the oneToken
        if (tokensSold <= 15000000) {return oneTokenInWei.mul(40).div(100);}
        // price of U$ 0.06 - 60% of the oneToken
        if (tokensSold <= 30000000) {return oneTokenInWei.mul(60).div(100);}
        // price of U$ 0.08 - 80% of the oneToken
        if (tokensSold <= 80000000) {return oneTokenInWei.mul(80).div(100);}
        // price of U$ 0.10 - 100% of the oneToken
        if (tokensSold <= 130000000){return oneTokenInWei;}                
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
        return _weiAmount.mul(multiplier).div(currentRate);
    }

}