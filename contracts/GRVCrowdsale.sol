pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
// Extension of Crowdsale contract whose tokens are minted in each purchase. Token ownership should be transferred to MintedCrowdsale for minting. 
import "../node_modules/zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "./IncreasingPriceCrowdsale.sol";

/**
 * Crowdsale contract of the GravelCoin
 */
contract GRVCrowdsale is MintedCrowdsale, IncreasingPriceCrowdsale{
    using SafeMath for uint256;
    
    /* the number of tokens already sold through this contract*/
    uint256 public tokensSold = 0;

     /**
     * Construct of GRVCrowdsale.
     */
    constructor (uint256 _rate, address _wallet, MintableToken _token)
      public  
      Crowdsale(_rate, _wallet, _token)
      // TODO: implements rules of the release block and weidh value
      // FIXME: 
      IncreasingPriceCrowdsale(3, 10) {
    }

  /**
   * @dev Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
   * @param _beneficiary Address receiving the tokens
   * @param _tokenAmount Number of tokens to be purchased
   *
   * override Crowdsale._processPurchase
   */
    function _processPurchase(
        address _beneficiary,
        uint256 _tokenAmount
    )
      internal
    {
        // update token sold
        tokensSold.add(_tokenAmount);
        
        super._deliverTokens(_beneficiary, _tokenAmount);
    }    

}