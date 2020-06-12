import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { TransactionType } from '../../baseCoin';
import { BuildTransactionError } from '../../baseCoin/errors';
import { Transaction } from '../transaction';
import { TransactionBuilder } from './transactionBuilder';
import { WalletInitializationBuilder } from './walletInitializationBuilder';
import { SendBuilder } from './sendBuilder';
import { AddressInitializationBuilder } from './addressInitializationBuilder';

export class TransactionBuilderFactory {
  protected transactionClass = Transaction;
  constructor(protected _coinConfig: Readonly<CoinConfig>) {}

  type(type: TransactionType.WalletInitialization): WalletInitializationBuilder;
  type(type: TransactionType.AddressInitialization): AddressInitializationBuilder;
  type(type: TransactionType.Send): SendBuilder;
  type(type: TransactionType): TransactionBuilder;
  type(type: TransactionType): TransactionBuilder {
    switch (type) {
      case TransactionType.WalletInitialization:
        return new WalletInitializationBuilder(this._coinConfig, this.transactionClass);
      case TransactionType.AddressInitialization:
        return new AddressInitializationBuilder(this._coinConfig, this.transactionClass);
      case TransactionType.Send:
        return new SendBuilder(this._coinConfig, this.transactionClass);
      default:
        throw new BuildTransactionError('Unsupported transaction type');
    }
  }
}
