import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import {
	Contract,
	LogNewCouponCycle,
	LogOraclePriceAndPeriod,
	LogRewardClaimed,
	LogRewardsAccrued,
	LogSetCurveShifter,
	LogSetEpochs,
	LogSetInitialRewardShare,
	LogSetMeanAndDeviationWithFormulaConstants,
	LogSetMultiSigRewardShare,
	LogStartNewDistributionCycle,
	InitializeCall,
	LogSetOracleBlockPeriod,
	LogSetRewardBlockPeriod
} from '../generated/Contract/Contract';
import { Setting, RewardCycle, ExpansionCycle, DistributionCycle } from '../generated/schema';

let DIVIDER_9_INT = BigInt.fromI32(1000000000);
let DIVIDER_9_DECIMAL = BigDecimal.fromString('1000000000');
let ZERO = BigInt.fromI32(0);
let ZERO_DECIMAL = BigDecimal.fromString('0');

let DIVIDER_18_DECIMAL = BigDecimal.fromString('1000000000000000000');

export function handleInitialize(call: InitializeCall): void {
	let setting = new Setting('0');
	let contract = Contract.bind(call.to);

	setting.epochs = call.inputs.epochs_;
	setting.oracleBlockPeriod = call.inputs.oracleBlockPeriod_;
	setting.curveShifter = call.inputs.curveShifter_.divDecimal(DIVIDER_18_DECIMAL);
	setting.initialRewardShare = call.inputs.initialRewardShare_.divDecimal(DIVIDER_18_DECIMAL);
	setting.multiSigRewardShare = call.inputs.multiSigRewardShare_.divDecimal(DIVIDER_18_DECIMAL);
	setting.rewardBlockPeriod = contract.rewardBlockPeriod();

	setting.mean = contract.bytes16ToUnit256(call.inputs.mean_, DIVIDER_9_INT).divDecimal(DIVIDER_9_DECIMAL);

	setting.deviation = contract.bytes16ToUnit256(call.inputs.deviation_, DIVIDER_9_INT).divDecimal(DIVIDER_9_DECIMAL);

	setting.oneDivDeviationSqrtTwoPi = contract
		.bytes16ToUnit256(call.inputs.oneDivDeviationSqrtTwoPi_, DIVIDER_9_INT)
		.divDecimal(DIVIDER_9_DECIMAL);

	setting.twoDeviationSquare = contract
		.bytes16ToUnit256(call.inputs.twoDeviationSquare_, DIVIDER_9_INT)
		.divDecimal(DIVIDER_9_DECIMAL);

	setting.peakScaler = contract.bytes16ToUnit256(contract.peakScaler(), DIVIDER_9_INT).divDecimal(DIVIDER_9_DECIMAL);

	let rebase = contract.lastRebase();

	if (rebase === 0) {
		setting.lastRebase = 'POSITIVE';
	} else if (rebase === 1) {
		setting.lastRebase = 'NEUTRAL';
	} else if (rebase === 2) {
		setting.lastRebase = 'NEGATIVE';
	} else {
		setting.lastRebase = 'NONE';
	}

	setting.save();
}

export function handleLogNewCouponCycle(event: LogNewCouponCycle): void {
	let cycle = new RewardCycle(event.params.index_.toString());
	cycle.rewardShare = event.params.rewardAmount_.divDecimal(DIVIDER_18_DECIMAL);
	cycle.debasePerEpoch = event.params.debasePerEpoch_.divDecimal(DIVIDER_18_DECIMAL);
	cycle.rewardBlockPeriod = event.params.rewardBlockPeriod_;
	cycle.oracleBlockPeriod = event.params.oracleBlockPeriod_;
	cycle.epochsToReward = event.params.epochsToReward_;
	cycle.epochsRewarded = ZERO;
	cycle.couponsIssued = ZERO_DECIMAL;
	cycle.rewardDistributed = ZERO_DECIMAL;

	cycle.oracleLastPrices = [];
	cycle.oracleNextUpdates = [];

	let copy = cycle.oracleLastPrices;
	let copy2 = cycle.oracleNextUpdates;

	copy.push(event.params.oracleLastPrice_.divDecimal(DIVIDER_18_DECIMAL));
	copy2.push(event.params.oracleNextUpdate_);

	cycle.oracleLastPrices = copy;
	cycle.oracleNextUpdates = copy2;

	cycle.save();
}

export function handleLogOraclePriceAndPeriod(event: LogOraclePriceAndPeriod): void {
	let contract = Contract.bind(event.address);
	let id = contract.rewardCyclesLength().minus(BigInt.fromI32(1));
	let cycle = RewardCycle.load(id.toString());

	let oracleLastPrice = cycle.oracleLastPrices;
	let oracleNextUpdate = cycle.oracleNextUpdates;

	oracleLastPrice.push(event.params.price_.divDecimal(DIVIDER_18_DECIMAL));
	oracleNextUpdate.push(event.params.period_);

	cycle.oracleLastPrices = oracleLastPrice;
	cycle.oracleNextUpdates = oracleNextUpdate;

	cycle.save();
}

export function handleLogRewardClaimed(event: LogRewardClaimed): void {}

export function handleLogRewardsAccrued(event: LogRewardsAccrued): void {
	let contract = Contract.bind(event.address);
	let id = contract.rewardCyclesLength();

	if (event.params.rewardsAccrued_ === event.params.expansionPercentageScaled_) {
		let expansionCycle = new ExpansionCycle(id.toString());

		expansionCycle.exchangeRate = event.params.exchangeRate_.divDecimal(DIVIDER_18_DECIMAL);

		expansionCycle.rewardAccrued = event.params.rewardsAccrued_.divDecimal(DIVIDER_18_DECIMAL);

		let cycleExpansion = expansionCycle.cycleExpansion;
		let curveValue = expansionCycle.curveValue;

		cycleExpansion.push(event.params.expansionPercentageScaled_.divDecimal(DIVIDER_18_DECIMAL));
		curveValue.push(contract.bytes16ToUnit256(event.params.value_, DIVIDER_9_INT).divDecimal(DIVIDER_9_DECIMAL));

		expansionCycle.cycleExpansion = cycleExpansion;
		expansionCycle.curveValue = curveValue;

		expansionCycle.save();
	} else {
		let expansionCycle = ExpansionCycle.load(id.toString());

		expansionCycle.exchangeRate = event.params.exchangeRate_.divDecimal(DIVIDER_18_DECIMAL);

		expansionCycle.rewardAccrued = event.params.rewardsAccrued_.divDecimal(DIVIDER_18_DECIMAL);

		let cycleExpansion = expansionCycle.cycleExpansion;
		let curveValue = expansionCycle.curveValue;

		cycleExpansion.push(event.params.expansionPercentageScaled_.divDecimal(DIVIDER_18_DECIMAL));
		curveValue.push(contract.bytes16ToUnit256(event.params.value_, DIVIDER_9_INT).divDecimal(DIVIDER_9_DECIMAL));

		expansionCycle.cycleExpansion = cycleExpansion;
		expansionCycle.curveValue = curveValue;

		expansionCycle.save();
	}
}

export function handleLogSetRewardBlockPeriod(event: LogSetRewardBlockPeriod): void {
	let setting = Setting.load('0');
	setting.rewardBlockPeriod = event.params.rewardBlockPeriod_;
	setting.save();
}

export function handleLogSetCurveShifter(event: LogSetCurveShifter): void {
	let setting = Setting.load('0');
	setting.curveShifter = event.params.curveShifter_.divDecimal(DIVIDER_18_DECIMAL);
	setting.save();
}

export function handleLogSetEpochs(event: LogSetEpochs): void {
	let setting = Setting.load('0');
	setting.epochs = event.params.epochs_;
	setting.save();
}

export function handleLogSetInitialRewardShare(event: LogSetInitialRewardShare): void {
	let setting = Setting.load('0');
	setting.initialRewardShare = event.params.initialRewardShare_.divDecimal(DIVIDER_18_DECIMAL);
	setting.save();
}

export function handleLogSetMeanAndDeviationWithFormulaConstants(
	event: LogSetMeanAndDeviationWithFormulaConstants
): void {
	let setting = Setting.load('0');
	let contract = Contract.bind(event.address);

	setting.mean = contract.bytes16ToUnit256(event.params.mean_, DIVIDER_9_INT).divDecimal(DIVIDER_9_DECIMAL);
	setting.deviation = contract.bytes16ToUnit256(event.params.deviation_, DIVIDER_9_INT).divDecimal(DIVIDER_9_DECIMAL);
	setting.peakScaler = contract
		.bytes16ToUnit256(event.params.peakScaler_, DIVIDER_9_INT)
		.divDecimal(DIVIDER_9_DECIMAL);
	setting.oneDivDeviationSqrtTwoPi = contract
		.bytes16ToUnit256(event.params.oneDivDeviationSqrtTwoPi_, DIVIDER_9_INT)
		.divDecimal(DIVIDER_9_DECIMAL);
	setting.twoDeviationSquare = contract
		.bytes16ToUnit256(event.params.twoDeviationSquare_, DIVIDER_9_INT)
		.divDecimal(DIVIDER_9_DECIMAL);
	setting.save();
}

export function handleLogSetMultiSigRewardShare(event: LogSetMultiSigRewardShare): void {
	let setting = Setting.load('0');
	setting.multiSigRewardShare = event.params.multiSigRewardShare_.divDecimal(DIVIDER_18_DECIMAL);
	setting.save();
}

export function handleLogSetOracleBlockPeriod(event: LogSetOracleBlockPeriod): void {
	let setting = Setting.load('0');
	setting.oracleBlockPeriod = event.params.oracleBlockPeriod_;
	setting.save();
}

export function handleLogStartNewDistributionCycle(event: LogStartNewDistributionCycle): void {
	let contract = Contract.bind(event.address);
	let distributionId = event.block.hash.toHex();
	let id = contract.rewardCyclesLength().minus(BigInt.fromI32(1));

	let distributionCycle = new DistributionCycle(distributionId);
	distributionCycle.rewardCycle = id.toString();
	distributionCycle.poolTotalShare = event.params.poolShareAdded_.divDecimal(DIVIDER_18_DECIMAL);
	distributionCycle.rewardRate = event.params.rewardRate_.divDecimal(DIVIDER_18_DECIMAL);
	distributionCycle.periodFinish = event.params.periodFinish_;
	distributionCycle.curveValue = contract
		.bytes16ToUnit256(event.params.curveValue_, DIVIDER_9_INT)
		.divDecimal(DIVIDER_9_DECIMAL);

	distributionCycle.save();

	let rewardCycle = RewardCycle.load(id.toString());
	let distributions = rewardCycle.distributions;
	distributions.push(distributionId);
	rewardCycle.distributions = distributions;

	rewardCycle.save();
}
