pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * Token of Gravel Token.
 *
 */
contract GRVToken is MintableToken{
    using SafeMath for uint256;
   
    string public constant name = "Gravel Coin";
    string public constant symbol = "GRVC";
    uint8  public constant decimals = 0;

    constructor() public {}

}