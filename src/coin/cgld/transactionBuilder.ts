import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { Eth } from '../../index';
import { TransactionType, StakingOperationsTypes } from '../baseCoin';
import { BuildTransactionError } from '../baseCoin/errors';
import { TxData } from '../eth/iface';
import { Transaction } from './transaction';
import { StakingBuilder } from './stakingBuilder';
import { Staking } from './staking';

export class TransactionBuilder extends Eth.TransactionBuilder {
  // Staking specific parameters
  private _stakingBuilder: StakingBuilder;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
    this.transaction = new Transaction(this._coinConfig);
  }

  protected getTransactionData(): TxData {
    switch (this._type) {
      case TransactionType.StakingLock:
        return this.buildLockStakeTransaction();
      case TransactionType.StakingVote:
        return this.buildVoteStakingTransaction();
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
    switch (decodedType) {
      case TransactionType.StakingLock:
        this._stakingBuilder = new StakingBuilder()
          .type(StakingOperationsTypes.LOCK)
          .amount(transactionJson.value)
          .coin(this._coinConfig.name);
        break;
      case TransactionType.StakingVote:
        this._stakingBuilder = new StakingBuilder(transactionJson.data);
        break;
      default:
        super.setTransactionTypeFields(decodedType, transactionJson);
        break;
    }
  }

  //region Stake methods
  lock(): StakingBuilder {
    if (this._type !== TransactionType.StakingLock) {
      throw new BuildTransactionError('Lock can only be set for Staking Lock transactions type');
    }
    if (!this._stakingBuilder) {
      this._stakingBuilder = new StakingBuilder().type(StakingOperationsTypes.LOCK).coin(this._coinConfig.name);
    }
    return this._stakingBuilder;
  }

  private getStaking(): Staking {
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

  /**
   * Gets the staking vote builder if exist, or creates a new one for this transaction and returns it
   *
   * @returns {StakingBuilder} the staking builder
   */
  vote(): StakingBuilder {
    if (this._type !== TransactionType.StakingVote) {
      throw new BuildTransactionError('Votes can only be set for a staking transaction');
    }

    if (!this._stakingBuilder) {
      this._stakingBuilder = new StakingBuilder().type(StakingOperationsTypes.VOTE);
    }

    return this._stakingBuilder;
  }

  private buildVoteStakingTransaction(): TxData {
    const stake = this.getStaking();
    const data = this.buildBase(stake.serialize());
    data.to = stake.address;

    return data;
  }

  // endregion
}
