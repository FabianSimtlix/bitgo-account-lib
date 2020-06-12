import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { TransactionClass, TxData } from '../iface';
import { BaseTransaction, TransactionType } from '../../baseCoin';
import { BuildTransactionError } from '../../baseCoin/errors';
import { calculateForwarderAddress, getAddressInitializationData, isValidEthAddress } from '../utils';
import { TransactionBuilder } from './transactionBuilder';

export class AddressInitializationBuilder extends TransactionBuilder {
  private _contractAddress: string;
  private _contractCounter: number;

  constructor(_coinConfig: Readonly<CoinConfig>, transactionImplementation: TransactionClass) {
    super(_coinConfig, transactionImplementation);
    this._type = TransactionType.AddressInitialization;
  }

  /**@inheritdoc */
  validateTransaction(transaction: BaseTransaction): void {
    this.validateBaseTransactionFields();
    if (this._contractAddress === undefined) {
      throw new BuildTransactionError('Invalid transaction: missing contract address');
    }

    if (this._contractCounter === undefined) {
      throw new BuildTransactionError('Invalid transaction: missing contract counter');
    }
  }

  /**
   * Build a transaction data to create a forwarder.
   *
   * @returns {TxData} The Ethereum transaction data
   */
  protected getTransactionData(): TxData {
    const addressInitData = getAddressInitializationData();
    const tx: TxData = this.buildBase(addressInitData);
    tx.to = this._contractAddress;
    tx.deployedAddress = calculateForwarderAddress(this._contractAddress, this._contractCounter);
    return tx;
  }

  /**
   * Set the contract transaction nonce to calculate the forwarder address.
   *
   * @param {number} contractCounter The counter to use
   */
  contractCounter(contractCounter: number): void {
    if (contractCounter < 0) {
      throw new BuildTransactionError(`Invalid contract counter: ${contractCounter}`);
    }

    this._contractCounter = contractCounter;
  }

  contract(address: string): void {
    if (isValidEthAddress(address)) {
      this._contractAddress = address;
    } else {
      throw new BuildTransactionError('Invalid address: ' + address);
    }
  }
}
