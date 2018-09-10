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
    string public constant symbol = "GRV";
    uint8  public constant decimals = 1;
    
    bool limitedTransfer = true;
    // mapping of the hold 
    mapping (address => uint256) public limitedWalletOfTransferByTimeMap;

    // =========================================================================================== //
    //                                    Events
    // =========================================================================================== //
    event ChangeLimitedTransfer(bool _limitedTransfer);
    event LimitedTransfer(address _walletBlock, uint256 _timeBlock);


    constructor() public {}

    /**
     * @dev Checks whether it can transfer or otherwise throws.
     */
    modifier canTransfer(address _sender) {
        require(false);
        _;
        if (limitedTransfer){            
            if (limitedWalletOfTransferByTimeMap[_sender] != 0){                
                require(limitedWalletOfTransferByTimeMap[_sender] <= uint64(now));
                _;
            }
        }
    }

    function updateLimited(bool _limitedTransfer) public onlyOwner returns(bool) {
        limitedTransfer = _limitedTransfer;
        emit ChangeLimitedTransfer(_limitedTransfer);
        return true;
    }

    function isLimitedTransfer() public view returns (bool) {
        return limitedTransfer;
    }

    function addLimitedTransfer(address _walletHold, uint256 _timeBlock) public onlyOwner returns (bool) {
        limitedWalletOfTransferByTimeMap[_walletHold] = _timeBlock;
        emit LimitedTransfer(_walletHold, _timeBlock);
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
      */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )
        public canTransfer(_from)
        returns (bool)
    {
        return super.transferFrom(_from, _to, _value);
    } 

}