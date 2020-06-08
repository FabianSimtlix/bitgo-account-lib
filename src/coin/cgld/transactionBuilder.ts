import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { Eth } from '../../index';
import { TransactionType, StakingOperationTypes } from '../baseCoin';
import { BuildTransactionError } from '../baseCoin/errors';
import { TxData } from '../eth/iface';
import { Transaction } from './transaction';
import { StakingBuilder } from './stakingBuilder';
import { StakingCall } from './stakingCall';

export class TransactionBuilder extends Eth.TransactionBuilder {
  // Staking specific parameters
  private _stakingBuilder: StakingBuilder;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
    this.transaction = new Transaction(this._coinConfig);
  }

  protected getTransactionData(): TxData {
    if (this._type === TransactionType.StakingLock) {
      return this.buildLockStakeTransaction();
    }
    return super.getTransactionData();
  }

  /** @inheritdoc */
  protected fromImplementation(rawTransaction: string): Transaction {
    let tx: Transaction;
    if (/^0x?[0-9a-f]{1,}$/.test(rawTransaction.toLowerCase())) {
      tx = Transaction.fromSerialized(this._coinConfig, rawTransaction);
      super.loadBuilderInput(tx.toJson());
    } else {
      const txData = JSON.parse(rawTransaction);
      tx = new Transaction(this._coinConfig);
      tx.setTransactionData(txData); //TODO: maybe create a constructor that takes 2 arguments
    }
    return tx;
  }

  protected setTransactionTypeFields(decodedType: TransactionType, transactionJson: TxData): void {
    if (decodedType === TransactionType.StakingLock) {
      this._stakingBuilder = new StakingBuilder(this._coinConfig)
        .type(StakingOperationTypes.LOCK)
        .amount(transactionJson.value);
    } else {
      super.setTransactionTypeFields(decodedType, transactionJson);
    }
  }

  //region Stake methods
  lock(): StakingBuilder {
    if (this._type !== TransactionType.StakingLock) {
      throw new BuildTransactionError('Lock can only be set for Staking Lock transactions type');
    }
    if (!this._stakingBuilder) {
      this._stakingBuilder = new StakingBuilder(this._coinConfig).type(StakingOperationTypes.LOCK);
    }
    return this._stakingBuilder;
  }

  private getStaking(): StakingCall {
    if (!this._stakingBuilder) {
      throw new BuildTransactionError('No staking information set');
    }
    return this._stakingBuilder.build();
  }

  private buildLockStakeTransaction(): TxData {
    const stake = this.getStaking();
    const data = this.buildBase(stake.serialize());
    data.to = stake.address;
    data.value = stake.amount;
    return data;
  }

  //endregion
}
