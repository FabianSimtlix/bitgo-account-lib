import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { Eth } from '../../../index';
import { Transaction } from '../transaction';

export class WalletInitializationBuilder extends Eth.WalletInitializationBuilder {
  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
    this._transactionClass = Transaction;
    this.transaction = new Transaction(this._coinConfig);
  }
}
