import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { Eth } from '../../index';
import { BaseTransaction, TransactionType } from '../baseCoin';
import { Transaction } from './transaction';

export class TransactionBuilder extends Eth.TransactionBuilder {
  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
    this.transaction = new Transaction(_coinConfig);
  }

  /** @inheritdoc */
  protected fromImplementation(rawTransaction: string): Transaction {
    this._serializedTransaction = rawTransaction;
    const tx = new Transaction(this._coinConfig, rawTransaction);
    return tx;
  }

  /** @inheritdoc */
  async buildImplementation(): Promise<BaseTransaction> {
    // If the from() method was called, use the serialized transaction as a base
    if (this._serializedTransaction) {
      this.transaction.initFromSerializedTransaction(this._serializedTransaction);
    } else {
      let transactionData;
      switch (this._type) {
        case TransactionType.WalletInitialization:
          transactionData = this.buildWalletInitializationTransaction();
          break;
        //TODO Other transaction types
      }
      this.transaction.setTransactionType(this._type);
      this.transaction.setTransactionData(transactionData);
    }
    // Build and sign a new transaction based on the latest changes
    if (this._sourceKeyPair && this._sourceKeyPair.getKeys().prv) {
      await this.transaction.sign(this._sourceKeyPair);
    }
    return this.transaction;
  }
}
