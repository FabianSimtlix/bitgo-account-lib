import { isValidAmount } from '../eth/utils';
import { InvalidParameterValueError, InvalidTransactionError } from '../baseCoin/errors';
import { StakingOperationsTypes } from '../baseCoin/enum';
import { Staking } from './staking';
import { LockOperation } from './stakingUtils';

export class StakingBuilder {
  private _amount: string;
  private _type: StakingOperationsTypes;

  constructor() {
    this._type = StakingOperationsTypes.LOCK;
  }

  type(type: StakingOperationsTypes): this {
    this._type = type;
    return this;
  }

  amount(value: string): this {
    if (!isValidAmount(value)) {
      throw new InvalidParameterValueError('Invalid value for stake transaction');
    }
    this._amount = value;
    return this;
  }

  build(): Staking {
    switch (this._type) {
      case StakingOperationsTypes.LOCK:
        return this.buildLockStaking();
      default:
        throw new InvalidTransactionError('Invalid staking operation: ' + this._type);
    }
  }

  private buildLockStaking(): Staking {
    return new Staking(this._amount, LockOperation.contractAddress, LockOperation.methodId, LockOperation.types, []);
  }
}
