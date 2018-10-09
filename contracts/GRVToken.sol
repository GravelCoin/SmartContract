pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
//import "../node_modules/zeppelin-solidity/contracts/token/ERC20/CappedToken.sol";

/**
 * Token of Gravel Token.
 *
 */
contract GRVToken is MintableToken{
    using SafeMath for uint256;
   
    string public constant name = "Gravel Token";
    string public constant symbol = "GRVC";
    uint8  public constant decimals = 0;
    
    bool limitedTransfer = true;
    // mapping of the hold 
    mapping (address => uint256[]) public limitedWalletOfTransferByTimeMap;

    // =========================================================================================== //
    //                                    Events
    // =========================================================================================== //
    event ChangeLimitedTransfer(bool _limitedTransfer);
    event LimitedTransfer(address _walletBlock, uint256 _value, uint256 _timeBlock);


    constructor() public {}

    /**
     * @dev Checks whether it can transfer or otherwise throws.
     */
    function canTransfer(address _sender, uint256 _value) public view returns(bool) {
        if (limitedTransfer){            
            if (limitedWalletOfTransferByTimeMap[_sender][0] > 0){       
                bool isBlocked = limitedWalletOfTransferByTimeMap[_sender][1] <= uint64(now);
                bool hasTokenLeft = uint256(balanceOf(_sender)).sub(_value) < 0;
                return !(isBlocked && hasTokenLeft);
            }
        } 
        return true;
    }

    function updateLimited(bool _limitedTransfer) public onlyOwner returns(bool) {
        limitedTransfer = _limitedTransfer;
        emit ChangeLimitedTransfer(_limitedTransfer);
        return true;
    }

    function isLimitedTransfer() public view returns (bool) {
        return limitedTransfer;
    }

    function addLimitedTransfer(address _walletHold, uint256 _value, uint256 _timeBlock) public onlyOwner returns (bool) {
        require(_value > 0, "Value not be zero(0).");
        require(_timeBlock > now, "Time block not be now.");
        limitedWalletOfTransferByTimeMap[_walletHold] = [_value, _timeBlock];
        emit LimitedTransfer(_walletHold, _value, _timeBlock);
        return true;
    }

    // =============================================================================================== //
    //                                       Override  functions
    // =============================================================================================== //
    /**
      * @dev Transfer tokens from one address to another
      * @param _from address The address which you want to send tokens from
      * @param _to address The address which you want to transfer to
      * @param _value uint256 the amount of tokens to be transferred
      * // Override BasicToken.transferFrom
      */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )
        public
        returns (bool)
    {
        require(canTransfer(_from, _value), "Hold value");
        return super.transferFrom(_from, _to, _value);
    } 
    
    /**
      * @dev transfer token for a specified address
      * @param _to The address to transfer to.
      * @param _value The amount to be transferred.
      * // Override BasicToken.transfer
      */
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(canTransfer(msg.sender, _value), "Hold value");
        return super.transfer(_to, _value);
    }

}