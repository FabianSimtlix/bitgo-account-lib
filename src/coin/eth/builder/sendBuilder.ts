import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { TransactionClass, TxData } from '../iface';
import { TransferBuilder } from '../transferBuilder';
import { isValidEthAddress } from '../utils';
import { BuildTransactionError } from '../../baseCoin/errors';
import { BaseTransaction, TransactionType } from '../../baseCoin';
import { TransactionBuilder } from './transactionBuilder';

export class SendBuilder extends TransactionBuilder {
  private _contractAddress;
  private _transfer: TransferBuilder;

  constructor(_coinConfig: Readonly<CoinConfig>, transactionImplementation: TransactionClass) {
    super(_coinConfig, transactionImplementation);
    this._type = TransactionType.Send;
  }

  /** @inheritDoc */
  protected setTransactionTypeFields(decodedType: TransactionType, transactionJson: TxData): void {
    if (transactionJson.to === undefined) {
      throw new BuildTransactionError('Undefined recipient address');
    }
    this._contractAddress = transactionJson.to;
    this._transfer = new TransferBuilder(transactionJson.data);
  }

  /** @inheritDoc */
  protected getTransactionData(): TxData {
    const sendData = this.getSendData();
    const tx: TxData = this.buildBase(sendData);
    tx.to = this._contractAddress;
    return tx;
  }

  /** @inheritDoc */
  validateTransaction(transaction: BaseTransaction) {
    this.validateBaseTransactionFields();
    if (this._contractAddress === undefined) {
      throw new BuildTransactionError('Invalid transaction: missing contract address');
    }
  }

  contract(address: string): void {
    if (isValidEthAddress(address)) {
      this._contractAddress = address;
    } else {
      throw new BuildTransactionError('Invalid address: ' + address);
    }
  }

  /**
   * Gets the transfer funds builder if exist, or creates a new one for this transaction and returns it
   *
   * @returns {TransferBuilder} the transfer builder
   */
  transfer(): TransferBuilder {
    if (!this._transfer) {
      this._transfer = new TransferBuilder();
    }
    return this._transfer;
  }

  /**
   * Returns the serialized sendMultiSig contract method data
   *
   * @returns {string} serialized sendMultiSig data
   */
  private getSendData(): string {
    if (!this._transfer) {
      throw new BuildTransactionError('Missing transfer information');
    }
    return this._transfer.signAndBuild();
  }
}
