import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { TransactionType } from '../../baseCoin';
import { BuildTransactionError } from '../../baseCoin/errors';
import { TransactionBuilder } from './transactionBuilder';
import { WalletInitializationBuilder } from './walletInitializationBuilder';

export class TransactionBuilderFactory {
  protected walletClass = WalletInitializationBuilder;
  constructor(protected _coinConfig: Readonly<CoinConfig>) {}

  type(type: TransactionType.WalletInitialization): WalletInitializationBuilder;
  type(type: TransactionType.AddressInitialization): TransactionBuilder;
  type(type: TransactionType): TransactionBuilder;
  type(type: TransactionType): TransactionBuilder {
    switch (type) {
      case TransactionType.WalletInitialization:
        return new this.walletClass(this._coinConfig);
      default:
        throw new BuildTransactionError('Unsupported transaction type');
    }
  }
}
