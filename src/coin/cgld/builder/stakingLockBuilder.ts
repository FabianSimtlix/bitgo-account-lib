import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { Eth } from '../../../index';
import { StakingBuilder } from '../stakingBuilder';
import { Transaction } from '../transaction';
import { BaseTransaction, StakingOperationTypes, TransactionType } from '../../baseCoin';
import { TxData } from '../../eth/iface';
import { BuildTransactionError } from '../../baseCoin/errors';
import { StakingCall } from '../stakingCall';

class StakingTransactionBuilder extends Eth.TransactionBuilder {
  protected _stakingBuilder?: StakingBuilder;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig, Transaction);
  }

  /** @inheritdoc */
  type(type: TransactionType): void {
    super.type(type);
    this._stakingBuilder = undefined;
  }

  /** @inheritDoc */
  validateTransaction(transaction: BaseTransaction) {
    super.validateBaseTransactionFields();
  }

  protected getStaking(): StakingCall {
    if (!this._stakingBuilder) {
      throw new BuildTransactionError('No staking information set');
    }
    return this._stakingBuilder.build();
  }
}

export class StakingLockBuilder extends StakingTransactionBuilder {
  /** @inheritDoc */
  protected setTransactionTypeFields(decodedType: TransactionType, transactionJson: TxData): void {
    this._stakingBuilder = new StakingBuilder(this._coinConfig)
      .type(StakingOperationTypes.LOCK)
      .amount(transactionJson.value);
  }

  protected getTransactionData(): TxData {
    const stake = this.getStaking();
    const data = this.buildBase(stake.serialize());
    data.to = stake.address;
    data.value = stake.amount;
    return data;
  }

  lock(): StakingBuilder {
    if (!this._stakingBuilder) {
      this._stakingBuilder = new StakingBuilder(this._coinConfig).type(StakingOperationTypes.LOCK);
    }
    return this._stakingBuilder;
  }
}

export class StakingVoteBuilder extends StakingTransactionBuilder {
  /** @inheritDoc */
  protected setTransactionTypeFields(decodedType: TransactionType, transactionJson: TxData): void {
    this._stakingBuilder = new StakingBuilder(this._coinConfig, transactionJson.data);
  }

  protected getTransactionData(): TxData {
    const stake = this.getStaking();
    const data = this.buildBase(stake.serialize());
    data.to = stake.address;

    return data;
  }

  /**
   * Gets the staking vote builder if exist, or creates a new one for this transaction and returns it
   *
   * @returns {StakingBuilder} the staking builder
   */
  vote(): StakingBuilder {
    if (!this._stakingBuilder) {
      this._stakingBuilder = new StakingBuilder(this._coinConfig).type(StakingOperationTypes.VOTE);
    }

    return this._stakingBuilder;
  }
}
