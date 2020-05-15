import BigNumber from 'bignumber.js';
import { Transaction as EthereumTx } from 'ethereumjs-tx';
import { addHexPrefix, bufferToHex, bufferToInt } from 'ethereumjs-util';
import { TxJson } from './iface';

/**
 * An Ethereum transaction with helpers for serialization and deserialization.
 */
export class EthTransaction {
  constructor(public tx: EthereumTx, private chainId?: number) {}

  /**
   * Build an ethereum transaction from its JSON representation
   *
   * @param tx The JSON representation of the transaction
   */
  public static fromJson(tx: TxJson): EthTransaction {
    return new EthTransaction(
      new EthereumTx({
        nonce: tx.nonce,
        to: tx.to,
        gasPrice: addHexPrefix(new BigNumber(tx.gasPrice).toString(16)),
        gasLimit: addHexPrefix(new BigNumber(tx.gasLimit).toString(16)),
        value: addHexPrefix(new BigNumber(tx.value).toString(16)),
        data: tx.data,
      }),
      tx.chainId,
    );
  }

  /**
   * Build an ethereum transaction from its string serialization
   *
   * @param tx The string serialization of the ethereum transaction
   */
  public static fromSerialized(tx: string): EthTransaction {
    return new EthTransaction(new EthereumTx(tx));
  }

  /**
   * Return the JSON representation of this transaction
   */
  toJson(): TxJson {
    const result: TxJson = {
      nonce: bufferToInt(this.tx.nonce),
      gasPrice: new BigNumber(bufferToHex(this.tx.gasPrice), 16).toString(10),
      gasLimit: new BigNumber(bufferToHex(this.tx.gasLimit), 16).toString(10),
      value: this.tx.value.length === 0 ? '0' : new BigNumber(bufferToHex(this.tx.value), 16).toString(10),
      data: addHexPrefix(new BigNumber(bufferToHex(this.tx.data).slice(2), 16).toString(16)),
    };

    if (this.tx.to) {
      result.to = bufferToHex(this.tx.to);
    }

    if (this.tx.verifySignature()) {
      result.from = bufferToHex(this.tx.getSenderAddress());
    }

    if (this.chainId) {
      result.chainId = this.chainId;
    }

    return result;
  }

  /**
   * Return the hex string serialization of this transaction
   */
  toSerialized(): string {
    return addHexPrefix(this.tx.serialize().toString('hex'));
  }
}