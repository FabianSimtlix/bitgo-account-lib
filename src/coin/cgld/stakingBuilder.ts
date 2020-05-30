import { isValidAmount } from '../eth/utils';
import { InvalidParameterValueError, InvalidTransactionError } from '../baseCoin/errors';
import { Staking } from './staking';

//TODO: get this values from config, currently it's set to baklava test network
const LockOperation = {
  //contractAddress: '0x26be4840a10be5BF67eBA736f91D27E7f2C80013',
  contractAddress: '0xd01E94451aA66930Fb76287D502e6dc1689464FC',
  methodId: '0xf83d08ba',
  types: [],
};

export enum StakingOperationsTypes {
  LOCK,
}

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
