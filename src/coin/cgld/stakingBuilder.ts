import { coins } from '@bitgo/statics';
import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { isValidAmount } from '../eth/utils';
import { BuildTransactionError, InvalidParameterValueError, InvalidTransactionError } from '../baseCoin/errors';
import { StakingOperationTypes } from '../baseCoin';
import { StakingCall } from './stakingCall';
import { getOperationConfig } from './stakingUtils';

export class StakingBuilder {
  private _amount: string;
  private _type: StakingOperationTypes;
  private _coinConfig: Readonly<CoinConfig>;

  constructor(coinConfig: Readonly<CoinConfig>) {
    this._coinConfig = coinConfig;
  }

  coin(name: string): this {
    this._coinConfig = coins.get(name);
    return this;
  }

  type(type: StakingOperationTypes): this {
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

  build(): StakingCall {
    this.validateMandatoryFields();
    switch (this._type) {
      case StakingOperationTypes.LOCK:
        return this.buildLockStaking();
      default:
        throw new InvalidTransactionError('Invalid staking operation: ' + this._type);
    }
  }

  private validateMandatoryFields(): void {
    if (!(this._type !== undefined && this._coinConfig)) {
      throw new BuildTransactionError('Missing staking mandatory fields. Type and coin are required');
    }
  }

  private buildLockStaking(): StakingCall {
    const operation = getOperationConfig(this._type, this._coinConfig.network.type);
    return new StakingCall(this._amount, operation.contractAddress, operation.methodId, operation.types, []);
  }
}
