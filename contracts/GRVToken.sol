pragma solidity ^0.4.23;

//import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../node_modules/zeppelin-solidity/contracts/token/ERC20/CappedToken.sol";

/**
 * Token of Gravel Token.
 *
 */
contract GRVToken is CappedToken{
   
    string public constant name = "Gravel Token";
    string public constant symbol = "GRV";
    uint8  public constant decimals = 1;

    uint256 public constant INITIAL_SUPPLY = 250000 * (10 ** uint256(decimals));
    uint256 public constant MAX_SUPPLY = 13000000 * (10 ** uint256(decimals));

    constructor() public 
        CappedToken(MAX_SUPPLY){        
        mint(owner, INITIAL_SUPPLY);
    }

}