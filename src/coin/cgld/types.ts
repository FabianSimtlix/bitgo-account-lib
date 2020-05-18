import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import { signTransaction } from '@celo/contractkit/lib/utils/signing-utils';
import {
  addHexPrefix,
  toBuffer,
  bufferToHex,
  bufferToInt,
  rlp,
  rlphash,
  stripZeros,
  ecrecover,
  publicToAddress,
} from 'ethereumjs-util';
import { EthLikeTransaction, TxData } from '../eth/iface';
import { EthTransaction } from '../eth/types';
import { KeyPair } from '../eth';


/**
 * An Ethereum transaction with helpers for serialization and deserialization.
 */
export class CgldTransaction implements EthLikeTransaction {
	private readonly _feeCurrency: Buffer;
	private readonly _gatewayFeeRecipient: Buffer = toBuffer('0x');
	private readonly _gatewayFee: Buffer = toBuffer('0x');

	constructor(private readonly txData: TxData, protected readonly chainId?: string) {
		this._feeCurrency = toBuffer('0x');
		this._gatewayFeeRecipient = toBuffer('0x');
		this._gatewayFee = toBuffer('0x');
	}

  public static fromJson(tx: TxData): EthLikeTransaction {
    const chainId = addHexPrefix(new BigNumber(Number(tx.chainId)).toString(16));
    return new CgldTransaction(Object.assign({}, tx, {
        v: tx.v || chainId,
      }),
      chainId,
    );
  }

	/**
	 * Build an ethereum transaction from its string serialization
	 *
	 * @param tx The string serialization of the ethereum transaction
	 */
	public static fromSerialized(tx: string): EthLikeTransaction {
		return new CgldTransaction(EthTransaction.fromSerialized(tx).toJson());
	}

	/** @inheritdoc */
  async sign(keyPair: KeyPair) {
    const privateKey = addHexPrefix(keyPair.getKeys().prv as string);
    const data = this.toJson();
    const rawTransaction = await signTransaction(data, privateKey);
    this.txData.v = rawTransaction.tx.v;
		this.txData.r = rawTransaction.tx.r;
		this.txData.s = rawTransaction.tx.s;
  }

	/** @inheritdoc */
	toJson(): TxData {
		const result: TxData = _.cloneDeep(this.txData);

		if (this.getSenderAddress()) {
			result.from = this.getSenderAddress();
		}

		if (this.chainId) {
			result.chainId = this.chainId;
		}

		return result;
	}

	/** @inheritdoc */
	toSerialized(): string {
		return addHexPrefix(rlp.encode(this.getRaw()).toString('hex'));
	}

	private getRaw(): Buffer[] {
		return [
			toBuffer(this.txData.nonce),
			toBuffer(this.txData.gasPrice),
			toBuffer(this.txData.gasLimit),
			this._feeCurrency,
			this._gatewayFeeRecipient,
			this._gatewayFee,
			toBuffer(this.txData.to),
			toBuffer(this.txData.value !== '0x0' ? this.txData.value : '0x'),
			toBuffer(this.txData.data),
			toBuffer(this.txData.v),
			toBuffer(this.txData.r),
			toBuffer(this.txData.s),
		];
	}

	private hash(includeSignature?: boolean): Buffer {
		let items;
		if (includeSignature) {
			items = this.getRaw();
		} else {
			items = this.getRaw()
				.slice(0, 9)
				.concat([toBuffer(this.getChainId()), stripZeros(toBuffer(0)), stripZeros(toBuffer(0))]);
		}

		return rlphash(items);
	}

	private getChainId(): number {
		if (!(this.txData.v && this.txData.r && this.txData.s)) {
			throw new Error(`No signature to calculate chain id`);
		}


		let chainId = bufferToInt(Buffer.from(this.txData.v, 'hex'));
		if (this.txData.r.length && this.txData.s.length) {
			chainId = (chainId - 35) >> 1;
		}
		return chainId;
	}

	private getSenderAddress(): string | undefined {
		if (!(this.txData.v && this.txData.r && this.txData.s)) {
			return undefined;
		}

		let senderAddress;
		try {
			const msgHash = this.hash(false);
			const chainId = this.getChainId();
			const v = bufferToInt(Buffer.from(this.txData.v, 'hex')) - (2 * chainId + 35);
			const senderPubkey = ecrecover(msgHash, v + 27, Buffer.from(this.txData.r, 'hex'), Buffer.from(this.txData.s, 'hex'));
			senderAddress = addHexPrefix(bufferToHex(publicToAddress(senderPubkey)));
		} catch (e) {
			return undefined;
		}

		return senderAddress;
	}
}
