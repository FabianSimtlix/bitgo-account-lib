import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { RLP } from 'ethers/utils';
import { bigNumberify } from 'ethers/utils/bignumber';
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
  constructor(coinConfig: Readonly<CoinConfig>, txData?: TxData | string) {
    super(coinConfig, txData);
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

  /**
   * Initialize the transaction fields based on another serialized transaction.
   *
   * @param {string} serializedTransaction Transaction in broadcast format.
   */
  initFromSerializedTransaction(serializedTransaction: string): void {
    this._encodedTransaction = serializedTransaction;
    const decodedTx = RLP.decode(serializedTransaction);
    const [
      rawNonce,
      rawGasPrice,
      rawGasLimit,
      rawFeeCurrency,
      rawGatewayFeeRecipient,
      rawGatewayFee,
      rawTo,
      rawValue,
      rawData,
      rawV,
      rawR,
      rawS,
    ] = decodedTx;
    const parsedTransaction: TxData = {
      nonce: bigNumberify(rawNonce).toNumber(),
      gasPrice: bigNumberify(rawGasPrice).toNumber(),
      gasLimit: bigNumberify(rawGasLimit).toNumber(),
      to: rawTo,
      value: bigNumberify(rawValue).toNumber(),
      data: rawData,
      chainId: 44786,
      v: bigNumberify(rawV).toNumber(),
      r: rawR,
      s: rawS,
    };
    this._parsedTransaction = parsedTransaction;
  }
}
