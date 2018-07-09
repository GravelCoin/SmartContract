pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
// Extension of Crowdsale contract whose tokens are minted in each purchase. Token ownership should be transferred to MintedCrowdsale for minting. 
import "../node_modules/zeppelin-solidity/contracts/crowdsale/emission/AllowanceCrowdsale.sol";
import "./IncreasingPriceCrowdsale.sol";
import "./GRVToken.sol";

/**
 * Crowdsale contract of the GravelCoin
 */
contract GRVCrowdsale is AllowanceCrowdsale, IncreasingPriceCrowdsale{
    using SafeMath for uint256;

    // States of the crowdsale
    enum State { Active, Paused, Refunding, Closed }

    // FIXME: get value from the token.
    uint256 public constant multiplier = 10 ** 1;

    // FIXME: update value from the price table
    uint256 public constant oneTokenInWei = (10000 * multiplier); // hardcoded 1 token = 0.0001 ethers

    
    
    /**
     * Construct of GRVCrowdsale.
     */
    constructor (uint256 _rate, address _wallet, GRVToken _token)
      public  
      Crowdsale(_rate, _wallet, _token)
      // TODO: implements rules of the release block and weidh value            
      IncreasingPriceCrowdsale(oneTokenInWei, multiplier) {        
    }

  /**
   * @dev Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
   * @param _beneficiary Address receiving the tokens
   * @param _tokenAmount Number of tokens to be purchased
   *
   * //override Crowdsale._processPurchase
   */
    function _processPurchase(
        address _beneficiary,
        uint256 _tokenAmount
    )
      internal
    {
        super._deliverTokens(_beneficiary, _tokenAmount);

        // update token sold
        tokensSold.add(_tokenAmount);
    }    

}