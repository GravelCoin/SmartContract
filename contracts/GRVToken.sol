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

    /**
      * @dev Function to mint tokens
      * @param _to The address that will receive the minted tokens.
      * @param _amount The amount of tokens to mint.
      * @return A boolean that indicates if the operation was successful.

      //override MintableToken.mint();
    */
    function mint(
        address _to,
        uint256 _amount
    )
        hasMintPermission
        canMint
        public
        returns (bool)
    {
        require(_amount > 0, "tokenAmount less than zero.");
        return super.mint(_to,_amount);      
    }
}