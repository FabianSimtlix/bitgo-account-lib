import { coins } from '@bitgo/statics';
import { isValidAmount } from '../eth/utils';
import { BuildTransactionError, InvalidParameterValueError, InvalidTransactionError } from '../baseCoin/errors';
import { StakingOperationsTypes } from '../baseCoin';
import { Staking } from './staking';
import { alfajores, getOperationParams, mainnet } from './stakingUtils';

export class StakingBuilder {
  private _amount: string;
  private _type: StakingOperationsTypes;
  private _coinName: string;

  constructor() {
    this._type = StakingOperationsTypes.LOCK;
    this._coinName = mainnet;
  }

  coin(name: string): this {
    const coin = coins.get(name);
    const coinName = coin.name;
    if (!(coinName === mainnet || coinName === alfajores)) {
      throw new BuildTransactionError('There was an error using that coin as a lock currency');
    }
    this._coinName = coinName;
    return this;
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
    const operation = getOperationParams(this._type, this._coinName);
    return new Staking(this._amount, operation.contractAddress, operation.methodId, operation.types, []);
  }
}
