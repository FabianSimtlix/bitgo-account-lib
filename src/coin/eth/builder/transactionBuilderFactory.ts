import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { BaseTransaction, TransactionType } from '../../baseCoin';
import { BuildTransactionError, SigningError } from '../../baseCoin/errors';
import { getContractData, isValidEthAddress } from '../utils';
import { TxData } from '../iface';
import { BaseKey } from '../../baseCoin/iface';
import { Utils } from '../index';
import { TransactionBuilder } from './transactionBuilder';

const DEFAULT_M = 3;
class WalletInitializationBuilder extends TransactionBuilder {
  private _walletOwnerAddresses: string[];

  /** @inheritDoc */
  protected signImplementation(key: BaseKey): BaseTransaction {
    if (this._walletOwnerAddresses.length === 0) {
      throw new SigningError('Cannot sign an wallet initialization transaction without owners');
    }
    return super.signImplementation(key);
  }

  /** @inheritDoc */
  validateTransaction(transaction: BaseTransaction) {
    if (this._walletOwnerAddresses === undefined) {
      throw new BuildTransactionError('Invalid transaction: missing wallet owners');
    }
    if (this._walletOwnerAddresses.length !== 3) {
      throw new BuildTransactionError(
        `Invalid transaction: wrong number of owners -- required: 3, found: ${this._walletOwnerAddresses.length}`,
      );
    }
    super.validateTransaction(transaction);
  }

  /** @inheritDoc */
  protected loadBuilderInput(transactionJson: TxData) {
    const owners = Utils.decodeWalletCreationData(transactionJson.data);
    owners.forEach(element => {
      this.owner(element);
    });
    super.loadBuilderInput(transactionJson);
  }

  /**
   * Set one of the owners of the multisig wallet.
   *
   * @param {string} address An Ethereum address
   */
  owner(address: string): void {
    if (this._walletOwnerAddresses.length >= DEFAULT_M) {
      throw new BuildTransactionError('A maximum of ' + DEFAULT_M + ' owners can be set for a multisig wallet');
    }
    if (!isValidEthAddress(address)) {
      throw new BuildTransactionError('Invalid address: ' + address);
    }
    if (this._walletOwnerAddresses.includes(address)) {
      throw new BuildTransactionError('Repeated owner address: ' + address);
    }
    this._walletOwnerAddresses.push(address);
  }

  /**
   * Build a transaction for a generic multisig contract.
   *
   * @returns {TxData} The Ethereum transaction data
   */
  private buildWalletInitializationTransaction(): TxData {
    return this.buildBase(getContractData(this._walletOwnerAddresses));
  }
}

export class TransactionBuilderFactory {
  constructor(protected _coinConfig: Readonly<CoinConfig>) {}

  type(type: TransactionType): TransactionBuilder {
    switch (type) {
      case TransactionType.WalletInitialization:
        new WalletInitializationBuilder(this._coinConfig);
      default:
        throw new BuildTransactionError('Unsupported transaction type');
    }
  }
}
