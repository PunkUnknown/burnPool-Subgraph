import { BigInt } from "@graphprotocol/graph-ts"
import {
  Contract,
  LogEmergencyWithdrawa,
  LogNewCouponCycle,
  LogOraclePriceAndPeriod,
  LogRewardClaimed,
  LogRewardsAccrued,
  LogSetBlockDuration,
  LogSetCurveShifter,
  LogSetEpochs,
  LogSetInitialRewardShare,
  LogSetMeanAndDeviationWithFormulaConstants,
  LogSetMultiSigAddress,
  LogSetMultiSigRewardShare,
  LogSetOracle,
  LogSetOraclePeriod,
  LogStartNewDistributionCycle,
  LogTotalRewardClaimed,
  OwnershipTransferred
} from "../generated/Contract/Contract"
import { ExampleEntity } from "../generated/schema"

export function handleLogEmergencyWithdrawa(
  event: LogEmergencyWithdrawa
): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.withdrawAmount_ = event.params.withdrawAmount_

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.blockDuration(...)
  // - contract.burnPool1(...)
  // - contract.burnPool2(...)
  // - contract.bytes16ToUnit256(...)
  // - contract.checkStabilizerAndGetReward(...)
  // - contract.circBalance(...)
  // - contract.curveShifter(...)
  // - contract.debase(...)
  // - contract.deviation(...)
  // - contract.earned(...)
  // - contract.epochs(...)
  // - contract.getCurveValue(...)
  // - contract.getUserCouponBalance(...)
  // - contract.initialRewardShare(...)
  // - contract.lastRebase(...)
  // - contract.mean(...)
  // - contract.multiSigAddress(...)
  // - contract.multiSigRewardShare(...)
  // - contract.multiSigRewardToClaimShare(...)
  // - contract.oneDivDeviationSqrtTwoPi(...)
  // - contract.oracle(...)
  // - contract.oracleNextUpdate(...)
  // - contract.oraclePeriod(...)
  // - contract.owner(...)
  // - contract.peakScaler(...)
  // - contract.policy(...)
  // - contract.positiveToNeutralRebaseRewardsDisabled(...)
  // - contract.rewardCycles(...)
  // - contract.rewardCyclesLength(...)
  // - contract.rewardsAccrued(...)
  // - contract.totalRewardsDistributed(...)
  // - contract.twoDeviationSquare(...)
  // - contract.uint256ToBytes16(...)
}

export function handleLogNewCouponCycle(event: LogNewCouponCycle): void {}

export function handleLogOraclePriceAndPeriod(
  event: LogOraclePriceAndPeriod
): void {}

export function handleLogRewardClaimed(event: LogRewardClaimed): void {}

export function handleLogRewardsAccrued(event: LogRewardsAccrued): void {}

export function handleLogSetBlockDuration(event: LogSetBlockDuration): void {}

export function handleLogSetCurveShifter(event: LogSetCurveShifter): void {}

export function handleLogSetEpochs(event: LogSetEpochs): void {}

export function handleLogSetInitialRewardShare(
  event: LogSetInitialRewardShare
): void {}

export function handleLogSetMeanAndDeviationWithFormulaConstants(
  event: LogSetMeanAndDeviationWithFormulaConstants
): void {}

export function handleLogSetMultiSigAddress(
  event: LogSetMultiSigAddress
): void {}

export function handleLogSetMultiSigRewardShare(
  event: LogSetMultiSigRewardShare
): void {}

export function handleLogSetOracle(event: LogSetOracle): void {}

export function handleLogSetOraclePeriod(event: LogSetOraclePeriod): void {}

export function handleLogStartNewDistributionCycle(
  event: LogStartNewDistributionCycle
): void {}

export function handleLogTotalRewardClaimed(
  event: LogTotalRewardClaimed
): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}
