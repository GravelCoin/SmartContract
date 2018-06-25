pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
// Extension of Crowdsale contract whose tokens are minted in each purchase. Token ownership should be transferred to MintedCrowdsale for minting. 
import "../node_modules/zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "./BlockCrowdsale.sol";

/**
 * Crowdsale contract of the GravelCoin
 */
contract GRVCrowdsale is MintedCrowdsale, BlockCrowdsale{
    using SafeMath for uint256;

     /**
     * Construct of GRVCrowdsale.
     */
    constructor (uint256 _rate, address _wallet, MintableToken _token)
      public  
      Crowdsale(_rate, _wallet, _token)
      // TODO: implements rules of the release block and weidh value
      // FIXME: 
      BlockCrowdsale(1, 1) {
    }

}