pragma solidity ^0.4.23;

import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";


/*
 * @title Haltable
 * @dev  Abstract contract that implement an
 * emergency stop mechanism. Differs from Pausable by causing a throw when in halt mode.
 * Originally envisioned in FirstBlood ICO contract.
 * Taken and inspired from https://tokenmarket.net contract
 */
contract Haltable is Ownable {
  
    bool public halted;

    modifier stopInEmergency {
        require(!halted);
        _;
    }

    modifier onlyInEmergency {
        require(halted);
        _;
    }

    // called by the owner on emergency, triggers stopped state
    function halt() external onlyOwner {
        halted = true;
    }

    // called by the owner on end of emergency, returns to normal state
    function unhalt() external onlyOwner onlyInEmergency {
        halted = false;
    }

}