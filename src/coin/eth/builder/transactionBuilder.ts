import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import BigNumber from 'bignumber.js';
import { RLP } from 'ethers/utils';
import * as Crypto from '../../../utils/crypto';
import { BaseTransaction, BaseTransactionBuilder, TransactionType } from '../../baseCoin';
import { BaseAddress, BaseKey } from '../../baseCoin/iface';
import { Transaction, Utils } from '../index';
import {
  BuildTransactionError,
  InvalidTransactionError,
  ParseTransactionError,
  SigningError,
} from '../../baseCoin/errors';
import { KeyPair } from '../keyPair';
import { Fee, SignatureParts, TransactionClass, TxData } from '../iface';
import { isValidEthAddress, hasSignature } from '../utils';

/**
 * Ethereum transaction builder.
 */
export class TransactionBuilder extends BaseTransactionBuilder {
  protected _type: TransactionType;
  private readonly _transactionClass;
  private _transaction: Transaction;
  private _sourceKeyPair: KeyPair;
  private _chainId: number;
  private _counter: number;
  private _fee: Fee;
  private _sourceAddress: string;

  // the signature on the external ETH transaction
  private _txSignature: SignatureParts;

  /**
   * Public constructor.
   *
   * @param _coinConfig
   * @param transactionImplementation
   */
  constructor(_coinConfig: Readonly<CoinConfig>, transactionImplementation: TransactionClass = Transaction) {
    super(_coinConfig);
    this._transactionClass = transactionImplementation;
    this._counter = 0;
    this.transaction = new transactionImplementation(this._coinConfig);
  }

  /** @inheritdoc */
  protected async buildImplementation(): Promise<BaseTransaction> {
    const transactionData = this.getTransactionData();

    if (this._txSignature) {
      Object.assign(transactionData, this._txSignature);
    }

    this.transaction.setTransactionType(this._type);
    this.transaction.setTransactionData(transactionData);

    // Build and sign a new transaction based on the latest changes
    if (this._sourceKeyPair && this._sourceKeyPair.getKeys().prv) {
      await this.transaction.sign(this._sourceKeyPair);
    }
    return this.transaction;
  }

  protected getTransactionData(): TxData {
    throw new BuildTransactionError('Unsupported transaction type');
  }

  /** @inheritdoc */
  protected fromImplementation(rawTransaction: string): Transaction {
    let tx: Transaction;
    if (/^0x?[0-9a-f]{1,}$/.test(rawTransaction.toLowerCase())) {
      tx = this._transactionClass.fromSerialized(this._coinConfig, rawTransaction);
      this.loadBuilderInput(tx.toJson());
    } else {
      const txData = JSON.parse(rawTransaction);
      tx = new this._transactionClass(this._coinConfig, txData);
    }
    return tx;
  }

  /**
   * Load the builder data using the deserialized transaction
   *
   * @param {TxData} transactionJson the deserialized transaction json
   */
  protected loadBuilderInput(transactionJson: TxData): void {
    const decodedType = Utils.classifyTransaction(transactionJson.data);
    this.fee({ fee: transactionJson.gasPrice, gasLimit: transactionJson.gasLimit });
    this.counter(transactionJson.nonce);
    this.chainId(Number(transactionJson.chainId));
    if (hasSignature(transactionJson)) {
      this._txSignature = { v: transactionJson.v!, r: transactionJson.r!, s: transactionJson.s! };
    }
    if (transactionJson.from) {
      this.source(transactionJson.from);
    }
    this.setTransactionTypeFields(decodedType, transactionJson);
  }

  protected setTransactionTypeFields(decodedType: TransactionType, transactionJson: TxData): void {
    throw new BuildTransactionError('Unsupported transaction type');
  }

  /**@inheritdoc */
  protected signImplementation(key: BaseKey): BaseTransaction {
    const signer = new KeyPair({ prv: key.key });
    if (this._sourceKeyPair) {
      throw new SigningError('Cannot sign multiple times a non send-type transaction');
    }
    // Signing the transaction is an async operation, so save the source and leave the actual
    // signing for the build step
    this._sourceKeyPair = signer;
    return this.transaction;
  }

  /** @inheritdoc */
  validateAddress(address: BaseAddress): void {
    if (!isValidEthAddress(address.address)) {
      throw new BuildTransactionError('Invalid address ' + address.address);
    }
  }

  /**@inheritdoc */
  validateKey(key: BaseKey): void {
    if (!(Crypto.isValidXprv(key.key) || Crypto.isValidPrv(key.key))) {
      throw new BuildTransactionError('Invalid key');
    }
  }

  /**
   * Validate the raw transaction is either a JSON or
   * a hex encoded transaction
   *
   * @param {any} rawTransaction The raw transaction to be validated
   */
  validateRawTransaction(rawTransaction: any): void {
    if (!rawTransaction) {
      throw new InvalidTransactionError('Raw transaction is empty');
    }
    if (typeof rawTransaction === 'string') {
      if (/^0x?[0-9a-f]{1,}$/.test(rawTransaction.toLowerCase())) {
        try {
          RLP.decode(rawTransaction);
        } catch (e) {
          throw new ParseTransactionError('There was error in decoding the hex string');
        }
      } else {
        try {
          JSON.parse(rawTransaction);
        } catch (e) {
          throw new ParseTransactionError('There was error in parsing the JSON string');
        }
      }
    } else {
      throw new InvalidTransactionError('Transaction is not a hex string or stringified json');
    }
  }

  protected validateBaseTransactionFields(): void {
    if (this._fee === undefined) {
      throw new BuildTransactionError('Invalid transaction: missing fee');
    }
    if (this._chainId === undefined) {
      throw new BuildTransactionError('Invalid transaction: missing chain id');
    }
    if (this._counter === undefined) {
      throw new BuildTransactionError('Invalid transaction: missing address counter');
    }
    if (!this._sourceAddress) {
      throw new BuildTransactionError('Invalid transaction: missing source');
    }
  }

  /**@inheritdoc */
  validateTransaction(transaction: BaseTransaction): void {
    throw new BuildTransactionError('Unsupported transaction type');
  }

  validateValue(value: BigNumber): void {
    if (value.isLessThan(0)) {
      throw new BuildTransactionError('Value cannot be below less than zero');
    }
    // TODO: validate the amount is not bigger than the max amount in each Eth family coin
  }

  // region Common builder methods
  /**
   * Set the transaction chain id.
   *
   * @param {number} chainId A block hash to use as branch reference
   */
  chainId(chainId: number): void {
    this._chainId = chainId;
    // TODO: Infer it from coinConfig
  }

  /**
   * Set the transaction fees. Low fees may get a transaction rejected or never picked up by bakers.
   *
   * @param {Fee} fee Baker fees. May also include the maximum gas to pay
   */
  fee(fee: Fee): void {
    this.validateValue(new BigNumber(fee.fee));
    if (fee.gasLimit) {
      this.validateValue(new BigNumber(fee.gasLimit));
    }
    this._fee = fee;
  }

  /**
   * Set the transaction counter to prevent submitting repeated transactions.
   *
   * @param {number} counter The counter to use
   */
  counter(counter: number): this {
    if (counter < 0) {
      throw new BuildTransactionError(`Invalid counter: ${counter}`);
    }

    this._counter = counter;
    return this;
  }

  /**
   * Set the transaction initiator. This account will pay for the transaction fees, but it will not
   * be added as an owner of a wallet in a init transaction, unless manually set as one of the
   * owners.
   *
   * @param {string} source An Ethereum compatible address
   */
  source(source: string): void {
    this.validateAddress({ address: source });
    this._sourceAddress = source;
  }

  protected buildBase(data: string): TxData {
    return {
      gasLimit: this._fee.gasLimit,
      gasPrice: this._fee.fee,
      nonce: this._counter,
      data: data,
      chainId: this._chainId.toString(),
      value: '0',
    };
  }

  /** @inheritdoc */
  protected get transaction(): Transaction {
    return this._transaction;
  }

  /** @inheritdoc */
  protected set transaction(transaction: Transaction) {
    this._transaction = transaction;
  }
}
