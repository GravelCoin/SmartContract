pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
// Extension of Crowdsale contract whose tokens are minted in each purchase. Token ownership should be transferred to MintedCrowdsale for minting. 
import "../node_modules/zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";


/**
 * @title BlockCrowdsale
 * @dev Crowdsale accepting contributions only within a time frame.
 */
contract BlockCrowdsale is Crowdsale {
    using SafeMath for uint256;

    uint256 public openingTime;
    uint256 public closingTime;

    /** State machine
     *
     * - Preparing: All contract initialization calls and variables have not been set yet
     * - Prefunding: We have not passed start time yet
     * - Funding: Active crowdsale
     * - Success: Minimum funding goal reached
     * - Failure: Minimum funding goal not reached before ending time
     * - Finalized: The finalized has been called and succesfully executed
     * - Refunding: Refunds are loaded on the contract for reclaim.
     */
    enum State{Unknown, Preparing, PreFunding, Funding, Success, Failure, Finalized, Refunding}

    /**
     * Crowdfund state machine management.
     *
     * We make it a function and do not assign the result to a variable, so there is no chance of the variable being stale.
     */
    /*function getState() public constant returns (State) {
      if(finalized) return State.Finalized;
      else if (isMaximumGoalReached()) return State.Success;
      else if (address(finalizeAgent) == 0) return State.Preparing;
      else if (block.timestamp < startTimePreICO) return State.Preparing;
      else if (block.timestamp > startTimePreICO && block.timestamp <= closeTimePreICO) return State.PreFunding;
      else if (block.timestamp > startTimeICO && block.timestamp <= closeTimeICO && !isCrowdsaleFull()) return State.Funding;
      else if (isMinimumGoalReached()) return State.Success;
      else if (!isMinimumGoalReached() && weiRaised > 0 && loadedRefund >= weiRaised) return State.Refunding;
      else return State.Failure;
    }*/

    /**
     * @dev Reverts if not in crowdsale time range.
     */
    modifier onlyWhileOpen {
        // solium-disable-next-line security/no-block-members
        require(block.timestamp >= openingTime && block.timestamp <= closingTime);
        _;
    }

    /**
     * @dev Constructor, takes crowdsale opening and closing times.
     * @param _openingTime Crowdsale opening time
     * @param _closingTime Crowdsale closing time
     */
    constructor(uint256 _openingTime, uint256 _closingTime) public {
        // solium-disable-next-line security/no-block-members
        require(_openingTime >= block.timestamp);
        require(_closingTime >= _openingTime);

        openingTime = _openingTime;
        closingTime = _closingTime;
    }

    /**
     * @dev Checks whether the period in which the crowdsale is open has already elapsed.
     * @return Whether crowdsale period has elapsed
     */
    function hasClosed() public view returns (bool) {
        // solium-disable-next-line security/no-block-members
        return block.timestamp > closingTime;
    }

    /**
     * @dev Extend parent behavior requiring to be within contributing period
     * @param _beneficiary Token purchaser
     * @param _weiAmount Amount of wei contributed
     */
    function _preValidatePurchase(
        address _beneficiary,
        uint256 _weiAmount
    )
        internal
        onlyWhileOpen
    {
        super._preValidatePurchase(_beneficiary, _weiAmount);
    }

}
