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
        // Casting to int, because unsigned int doesn't have negative numbers
        require(int(_amount) > 0, "tokenAmount less than zero.");
        return super.mint(_to,_amount);
    }

    /**
   * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
   *
   * Beware that changing an allowance with this method brings the risk that someone may use both the old
   * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
   * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.

   //override StandardToken.approve();
   */
  function approve(address _spender, uint256 _value) public returns (bool) {
    require(int(_value) > 0, "value less than zero.");
    return super.approve(_spender, _value);
  }

    /**
   * @dev Increase the amount of tokens that an owner allowed to a spender.
   *
   * approve should be called when allowed[_spender] == 0. To increment
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _addedValue The amount of tokens to increase the allowance by.

   //override StandardToken.increaseApproval();
   */
  function increaseApproval(
    address _spender,
    uint _addedValue
  )
    public
    returns (bool)
  {
    require(int(_addedValue) > 0, "added value less than zero.");
    return super.increaseApproval(_spender, _addedValue);
  }

  /**
   * @dev Decrease the amount of tokens that an owner allowed to a spender.
   *
   * approve should be called when allowed[_spender] == 0. To decrement
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _subtractedValue The amount of tokens to decrease the allowance by.

   //override StandardToken.decreaseApproval();
   */
  function decreaseApproval(
    address _spender,
    uint _subtractedValue
  )
    public
    returns (bool)
  {
    require(int(_subtractedValue) > 0, "subtracted value less than zero.");
    return super.decreaseApproval(_spender, _subtractedValue);
  }
}