import { coins } from '@bitgo/statics';
import ethUtil from 'ethereumjs-util';
import { isValidAmount, isValidEthAddress, getRawDecoded, getBufferedByteCode } from '../eth/utils';
import { BuildTransactionError, InvalidParameterValueError, InvalidTransactionError } from '../baseCoin/errors';
import { StakingOperationsTypes } from '../baseCoin';
import { Staking } from './staking';
import { alfajores, getOperationParams, mainnet, VoteMethodId } from './stakingUtils';

export class StakingBuilder {
  private readonly DEFAULT_ADDRESS = '0x0000000000000000000000000000000000000000';
  private _amount: string;
  private _groupToVote: string;
  private _lesser = this.DEFAULT_ADDRESS;
  private _greater = this.DEFAULT_ADDRESS;
  private _type: StakingOperationsTypes;
  private _coinName: string;

  constructor();
  constructor(serializedData: string);
  constructor(serializedData?: string) {
    this._coinName = mainnet;
    if (serializedData) {
      this.decodeStakingData(serializedData);
    } else {
      this._type = StakingOperationsTypes.LOCK;
    }
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

  for(groupToVote: string): this {
    if (!isValidEthAddress(groupToVote)) {
      throw new InvalidParameterValueError('Invalid address to vote for');
    }
    this._groupToVote = groupToVote;
    return this;
  }

  lesser(lesser: string): this {
    if (!isValidEthAddress(lesser)) {
      throw new InvalidParameterValueError('Invalid address for lesser');
    }
    this._lesser = lesser;
    return this;
  }

  greater(greater: string): this {
    if (!isValidEthAddress(greater)) {
      throw new InvalidParameterValueError('Invalid address for greater');
    }
    this._greater = greater;
    return this;
  }

  build(): Staking {
    switch (this._type) {
      case StakingOperationsTypes.LOCK:
        return this.buildLockStaking();
      case StakingOperationsTypes.VOTE:
        this.validateVoteFields();
        return this.buildVoteStaking();
      default:
        throw new InvalidTransactionError('Invalid staking operation: ' + this._type);
    }
  }

  private buildLockStaking(): Staking {
    const operation = getOperationParams(this._type, this._coinName);
    return new Staking(this._amount, operation.contractAddress, operation.methodId, operation.types, []);
  }

  private validateVoteFields(): void {
    if (!this._groupToVote) {
      throw new BuildTransactionError('Missing group to vote for');
    }

    if (this._lesser === this._greater) {
      throw new BuildTransactionError('Greater and lesser values should not the same');
    }
  }

  private buildVoteStaking(): Staking {
    const operation = getOperationParams(this._type, this._coinName);
    const params = [this._groupToVote, this._amount, this._lesser, this._greater];
    return new Staking('0', operation.contractAddress, operation.methodId, operation.types, params);
  }

  private decodeStakingData(data: string): void {
    if (!data.startsWith(VoteMethodId)) {
      throw new BuildTransactionError(`Invalid staking bytecode: ${data}`);
    }

    this._type = StakingOperationsTypes.VOTE;
    const operation = getOperationParams(this._type, this._coinName);
    const decoded = getRawDecoded(operation.types, getBufferedByteCode(operation.methodId, data));
    if (decoded.length != 4) {
      throw new BuildTransactionError(`Invalid decoded data: ${data}`);
    }
    const [groupToVote, amount, lesser, greater] = decoded;

    this._amount = ethUtil.bufferToHex(amount);
    this._groupToVote = ethUtil.bufferToHex(groupToVote);
    this._lesser = ethUtil.bufferToHex(lesser);
    this._greater = ethUtil.bufferToHex(greater);
  }
}
