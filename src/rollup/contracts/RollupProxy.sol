// SPDX-License-Identifier: MPL-2.0
pragma solidity >=0.6.2;

import '@NutBerry/rollup-bricks/src/tsm/contracts/RollupUtils.sol';

/// @notice Callforwarding proxy
contract RollupProxy is RollupUtils {
  constructor (address initialImplementation) {
    assembly {
      sstore(not(returndatasize()), initialImplementation)
    }
    emit RollupUtils.RollupUpgrade(initialImplementation);
  }

  fallback () external payable {
    assembly {
      calldatacopy(returndatasize(), returndatasize(), calldatasize())
      // keep a copy to be used after the call
      let zero := returndatasize()
      let success := delegatecall(
        gas(),
        sload(not(returndatasize())),
        returndatasize(),
        calldatasize(),
        returndatasize(),
        returndatasize()
      )

      returndatacopy(zero, zero, returndatasize())

      if success {
        return(zero, returndatasize())
      }
      revert(zero, returndatasize())
    }
  }
}
