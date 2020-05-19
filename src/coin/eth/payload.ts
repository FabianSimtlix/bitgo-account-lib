import { Buffer } from 'buffer';
import EthereumAbi from 'ethereumjs-abi';
import { addHexPrefix, toBuffer } from 'ethereumjs-util';
import * as BN from 'bn.js';
import { BuildTransactionError } from '../baseCoin/errors';
import {
  walletSimpleConstructor,
  walletSimpleByteCode,
  createForwarderMethodId,
  sendMultisigMethodId,
} from './walletUtil';

export interface Payload {
  // /**
  //  * @returns {JSON} - the smart contract method params-value json
  //  */
  // toJson();

  /**
   * @returns {string} - the smart contract encoded data
   */
  serialize(): string;
}

export class WalletInitialization implements Payload {
  addresses: string[];
  constructor(payload: string | string[]) {
    if (typeof payload === 'string') {
      this.addresses = this.decodeWalletCreationData(payload);
    } else {
      this.addresses = payload;
    }
  }

  /** @inheritdoc */
  serialize() {
    const params = [this.addresses];
    const resultEncodedParameters = EthereumAbi.rawEncode(walletSimpleConstructor, params)
      .toString('hex')
      .replace('0x', '');
    return walletSimpleByteCode + resultEncodedParameters;
  }

  // /** @inheritdoc */
  // toJson() {
  //   return { ownerAddresses: this.addresses };
  // }

  private decodeWalletCreationData(data: string): string[] {
    if (!data.startsWith(walletSimpleByteCode)) {
      throw new BuildTransactionError(`Invalid wallet bytecode: ${data}`);
    }

    const splitBytecode = data.split(walletSimpleByteCode);
    if (splitBytecode.length !== 2) {
      throw new BuildTransactionError(`Invalid wallet bytecode: ${data}`);
    }

    const serializedSigners = Buffer.from(splitBytecode[1], 'hex');

    const resultEncodedParameters = EthereumAbi.rawDecode(walletSimpleConstructor, serializedSigners);
    if (resultEncodedParameters.length !== 1) {
      throw new BuildTransactionError(`Could not decode wallet constructor bytecode: ${resultEncodedParameters}`);
    }

    const addresses: BN[] = resultEncodedParameters[0];
    if (addresses.length !== 3) {
      throw new BuildTransactionError(`invalid number of addresses in parsed constructor: ${addresses}`);
    }

    return addresses.map(address => addHexPrefix(address.toString('hex')));
  }
}

export interface SendMultiSigPayloadData {
  to: string;
  value: number;
  data: string;
  expireTime: number;
  sequenceId: number;
  signature: string;
}

export class SendMultiSig implements Payload {
  to: string;
  value: number;
  data: string;
  expireTime: number;
  sequenceId: number;
  signature: string;
  private types = ['address', 'uint', 'bytes', 'uint', 'uint', 'bytes'];
  private method = EthereumAbi.methodID('sendMultiSig', this.types);

  constructor(
    payload:
      | string
      | { to: string; value: number; data: string; expireTime: number; sequenceId: number; signature: string },
  ) {
    if (typeof payload === 'string') {
      //TODO: deserialize
    } else {
      this.to = payload.to;
      this.value = payload.value;
      this.data = payload.data;
      this.expireTime = payload.expireTime;
      this.sequenceId = payload.sequenceId;
      this.signature = payload.signature;
    }
  }

  /** @inheritdoc */
  serialize(): string {
    const params = [
      this.to,
      this.value,
      toBuffer(this.data),
      this.expireTime,
      this.sequenceId,
      toBuffer(this.signature),
    ];
    const args = EthereumAbi.rawEncode(this.types, params);
    return addHexPrefix(Buffer.concat([this.method, args]).toString('hex'));
  }

  private decodeTransferData(data: string): string[] {
    if (!data.startsWith(sendMultisigMethodId)) {
      throw new BuildTransactionError(`Invalid transfer bytecode: ${data}`);
    }
    return [''];
  }
}
