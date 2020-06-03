import { isValidAmount } from '../eth/utils';
import { InvalidParameterValueError, InvalidTransactionError } from '../baseCoin/errors';
import { StakingOperationsTypes } from '../baseCoin/enum';
import { isValidEthAddress } from '../eth/utils';
import { Staking } from './staking';
import { LockOperation, VoteOperation } from './stakingUtils';

export class StakingBuilder {
  private _amount: string;
  private _groupToVote: string;
  private _lesser: string;
  private _greater: string;
  public stakingType: StakingOperationsTypes;

  constructor() {
    this.stakingType = StakingOperationsTypes.LOCK;
  }

  type(type: StakingOperationsTypes): this {
    this.stakingType = type;
    return this;
  }

  amount(value: string): this {
    if (!isValidAmount(value)) {
      throw new InvalidParameterValueError('Invalid value for stake transaction');
    }
    this._amount = value;
    return this;
  }

  for(groupToVote: string): this {
    if (!isValidEthAddress(groupToVote)) {
      throw new InvalidParameterValueError('Invalid value for stake transaction');
    }
    this._groupToVote = groupToVote;
    return this;
  }

  lesser(lesser: string): this {
    if (!isValidEthAddress(lesser)) {
      throw new InvalidParameterValueError('Invalid value for stake transaction');
    }
    this._lesser = lesser;
    return this;
  }

  greater(greater: string): this {
    if (!isValidEthAddress(greater)) {
      throw new InvalidParameterValueError('Invalid value for stake transaction');
    }
    this._greater = greater;
    return this;
  }

  build(): Staking {
    switch (this.stakingType) {
      case StakingOperationsTypes.LOCK:
        return this.buildLockStaking();
      case StakingOperationsTypes.VOTE:
        const params = [this._groupToVote, this._amount, this._lesser, this._greater];
        return this.buildVoteStaking(params);
      default:
        throw new InvalidTransactionError('Invalid staking operation: ' + this.stakingType);
    }
  }

  private buildLockStaking(): Staking {
    return new Staking(this._amount, LockOperation.contractAddress, LockOperation.methodId, LockOperation.types, []);
  }

  private buildVoteStaking(params: string[]): Staking {
    return new Staking('0', VoteOperation.contractAddress, VoteOperation.methodId, VoteOperation.types, params);
  }
}
