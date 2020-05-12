import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { Eth } from '../../index';
import { InvalidTransactionError } from '../baseCoin/errors';
import { TxData } from '../eth/iface';
import { KeyPair, Utils } from './';

export class Transaction extends Eth.Transaction {
  /**
   * Public constructor.
   *
   * @param {Readonly<CoinConfig>} coinConfig
   * @param {TxData | string} txData The object transaction data or encoded transaction data
   */
  constructor(coinConfig: Readonly<CoinConfig>) {
    super(coinConfig);
  }

  /**
   * Sign the transaction with the provided key. It does not check if the signer is allowed to sign
   * it or not.
   *
   * @param {KeyPair} keyPair The key to sign the transaction with
   */
  async sign(keyPair: KeyPair): Promise<void> {
    // Check if there is a transaction to sign
    if (!this._parsedTransaction) {
      throw new InvalidTransactionError('Empty transaction');
    }
    this._encodedTransaction = await Utils.sign(this._parsedTransaction, keyPair);
  }
}
