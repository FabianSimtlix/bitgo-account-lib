import { addHexPrefix, isValidAddress } from 'ethereumjs-util';
import EthereumAbi from 'ethereumjs-abi';
import EthereumCommon from 'ethereumjs-common';
import { BuildTransactionError, SigningError } from '../baseCoin/errors';
import { TxJson } from './iface';
import { KeyPair } from './keyPair';
import {
	createForwarderMethodId,
	sendMultisigMethodId,
	walletSimpleByteCode,
	walletSimpleConstructor,
} from './walletUtil';
import { testnetCommon } from './resources';
import { EthTransaction } from './types';
import { TransactionType } from '../baseCoin';
import * as BN from 'bn.js';

/**
 * Signs the transaction using the appropriate algorithm
 * and the provided common for the blockchain
 *
 * @param {TxJson} transactionData the transaction data to sign
 * @param {KeyPair} keyPair the signer's keypair
 * @param {EthereumCommon} customCommon the network's custom common
 * @returns {string} the transaction signed and encoded
 */
export async function signInternal(
  transactionData: TxJson,
  keyPair: KeyPair,
  customCommon: EthereumCommon,
): Promise<string> {
  if (!keyPair.getKeys().prv) {
    throw new SigningError('Missing private key');
  }
  const ethTx = EthTransaction.fromJson(transactionData);
  const privateKey = Buffer.from(keyPair.getKeys().prv as string, 'hex');
  ethTx.tx.sign(privateKey);
  const encodedTransaction = ethTx.tx.serialize().toString('hex');
  return addHexPrefix(encodedTransaction);
}

/**
 * Signs the transaction using the appropriate algorithm
 *
 * @param {TxJson} transactionData the transaction data to sign
 * @param {KeyPair} keyPair the signer's keypair
 * @returns {string} the transaction signed and encoded
 */
export async function sign(transactionData: TxJson, keyPair: KeyPair): Promise<string> {
  return signInternal(transactionData, keyPair, testnetCommon);
}

/**
 * Returns the smart contract encoded data
 *
 * @param {string[]} addresses - the contract signers
 * @returns {string} - the smart contract encoded data
 */
export function getContractData(addresses: string[]): string {
  const params = [addresses];
  const resultEncodedParameters = EthereumAbi.rawEncode(walletSimpleConstructor, params)
    .toString('hex')
    .replace('0x', '');
  return walletSimpleByteCode + resultEncodedParameters;
}

/**
 * Returns whether or not the string is a valid Eth address
 *
 * @param {string} address - the tx hash to validate
 * @returns {boolean} - the validation result
 */
export function isValidEthAddress(address: string): boolean {
  return isValidAddress(address);
}

/**
 * Returns the smart contract encoded data
 *
 * @param {string} data The wallet creation data to decode
 * @returns {string[]} - The list of signer addresses
 */
export function decodeWalletCreationData(data: string): string[] {
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

	return addresses.map((address) => addHexPrefix(address.toString('hex')));
}

/**
 * Classify the given transaction data based as a transaction type.
 * ETH transactions are defined by the first 8 bytes of the transaction data, also known as the method id
 * @param data The data to classify the transactino with
 * @return {TransactionType} The classified transaction type
 */
export function classifyTransaction(data: string): TransactionType {
	if (data.startsWith(walletSimpleByteCode)) {
		return TransactionType.WalletInitialization;
	} else if (data.startsWith(createForwarderMethodId)) {
		return TransactionType.AddressInitialization;
	} else if (data.startsWith(sendMultisigMethodId)) {
		return TransactionType.Send;
	} else {
		throw new BuildTransactionError(`Unrecognized transaction type: ${data}`);
	}
}


