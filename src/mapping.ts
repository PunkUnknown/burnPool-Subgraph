import { BigInt } from '@graphprotocol/graph-ts';
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
import { Setting, RewardCycle, ExpansionCycle } from '../generated/schema';

export function handleInitialize(call: InitializeCall): void {
	let setting = new Setting('0');

	setting.epochs = call.inputs.epochs_;
	setting.oracleBlockPeriod = call.inputs.oracleBlockPeriod_;
	setting.curveShifter = call.inputs.curveShifter_;
	setting.initialRewardShare = call.inputs.initialRewardShare_;
	setting.multiSigRewardShare = call.inputs.multiSigRewardShare_;
	setting.mean = call.inputs.mean_;
	setting.deviation = call.inputs.deviation_;
	setting.oneDivDeviationSqrtTwoPi = call.inputs.oneDivDeviationSqrtTwoPi_;
	setting.twoDeviationSquare = call.inputs.twoDeviationSquare_;

	let contract = Contract.bind(call.to);

	setting.rewardBlockPeriod = contract.rewardBlockPeriod();
	setting.peakScaler = contract.peakScaler();

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
	let cycle = new RewardCycle(event.params.index.toString());
	cycle.rewardAmount = event.params.rewardAmount;
	cycle.epochsToReward = event.params.epochsToReward;
	cycle.epochsRewarded = event.params.epochsRewarded;
	cycle.couponsIssued = event.params.couponsIssued;
	cycle.periodFinish = event.params.periodFinish;
	cycle.rewardDistributed = event.params.rewardDistributed;
	cycle.save();
}

export function handleLogOraclePriceAndPeriod(event: LogOraclePriceAndPeriod): void {
	let contract = Contract.bind(event.address);
	let id = contract.rewardCyclesLength().minus(BigInt.fromI32(1));
	let cycle = RewardCycle.load(id.toString());

	cycle.price.push(event.params.price_);
	cycle.priceUpdateBlock.push(event.params.period_);
	cycle.save();
}

export function handleLogRewardClaimed(event: LogRewardClaimed): void {}

export function handleLogRewardsAccrued(event: LogRewardsAccrued): void {
	let expansionCycle: ExpansionCycle;
	if (event.params.rewardsAccrued_ === event.params.expansionPercentageScaled_) {
		expansionCycle = new ExpansionCycle(ExpansionCycle.length.toString());
	} else {
		let len = ExpansionCycle.length - 1;
		expansionCycle = ExpansionCycle.load(len.toString());
	}
	expansionCycle.rewardAccrued = event.params.rewardsAccrued_;
	expansionCycle.cycleExpansion.push(event.params.expansionPercentageScaled_);
	expansionCycle.curveScale.push(event.params.value);
	expansionCycle.save();
}

export function handleLogSetRewardBlockPeriod(event: LogSetRewardBlockPeriod): void {
	let setting = Setting.load('0');
	setting.rewardBlockPeriod = event.params.rewardBlockPeriod_;
	setting.save();
}

export function handleLogSetCurveShifter(event: LogSetCurveShifter): void {
	let setting = Setting.load('0');
	setting.curveShifter = event.params.curveShifter_;
	setting.save();
}

export function handleLogSetEpochs(event: LogSetEpochs): void {
	let setting = Setting.load('0');
	setting.epochs = event.params.epochs_;
	setting.save();
}

export function handleLogSetInitialRewardShare(event: LogSetInitialRewardShare): void {
	let setting = Setting.load('0');
	setting.initialRewardShare = event.params.initialRewardShare_;
	setting.save();
}

export function handleLogSetMeanAndDeviationWithFormulaConstants(
	event: LogSetMeanAndDeviationWithFormulaConstants
): void {
	let setting = Setting.load('0');
	setting.mean = event.params.mean_;
	setting.deviation = event.params.deviation_;
	setting.oneDivDeviationSqrtTwoPi = event.params.oneDivDeviationSqrtTwoPi_;
	setting.twoDeviationSquare = event.params.twoDeviationSquare_;
	setting.save();
}

export function handleLogSetMultiSigRewardShare(event: LogSetMultiSigRewardShare): void {
	let setting = Setting.load('0');
	setting.multiSigRewardShare = event.params.multiSigRewardShare_;
	setting.save();
}

export function handleLogSetOracleBlockPeriod(event: LogSetOracleBlockPeriod): void {
	let setting = Setting.load('0');
	setting.oracleBlockPeriod = event.params.oracleBlockPeriod_;
	setting.save();
}

export function handleLogStartNewDistributionCycle(event: LogStartNewDistributionCycle): void {}
