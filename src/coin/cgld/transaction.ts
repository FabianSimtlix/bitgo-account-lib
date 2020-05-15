import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { Eth } from '../../index';
import { TxData } from '../eth/iface';
import { CgldTransaction } from './types';

export class Transaction extends Eth.Transaction {
  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
  }

  setTransactionData(txData: TxData): void {
    this._ethTransaction = CgldTransaction.fromJson(txData);
  }
}
