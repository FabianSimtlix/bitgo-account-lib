import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { Eth } from '../../index';
import { TxData } from '../eth/iface';
import { CgldTransaction } from './types';
import * as Utils from './utils';

export class Transaction extends Eth.Transaction {
  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
  }

  setTransactionData(txData: TxData): void {
    this._ethTransaction = CgldTransaction.fromJson(txData);
  }

  /**@inheritdoc */
  public static fromSerialized(coinConfig: Readonly<CoinConfig>, serializedTx: string): Transaction {
    const tx = new Transaction(coinConfig);
    tx.setTransactionData(Utils.deserialize(serializedTx)); //TODO: maybe create a constructor that takes 2 arguments
    return tx;
  }
}
