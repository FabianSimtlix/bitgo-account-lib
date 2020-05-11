import { Buffer } from 'buffer';
import { isValidAddress, addHexPrefix } from 'ethereumjs-util';
import EthereumAbi from 'ethereumjs-abi';
import EthereumCommon from 'ethereumjs-common';
import { Transaction } from 'ethereumjs-tx';
import { BigNumber } from 'bignumber.js';
import { SigningError } from '../baseCoin/errors';
import { TxData } from './iface';
import { KeyPair } from './keyPair';
import { walletSimpleConstructor, walletSimpleByteCode } from './walletUtil';
import { testnetCommon, mainnetCommon } from './resources';

/**
 * Signs the transaction using the appropriate algorithm
 * and the provided common for the blockchain
 *
 * @param {TxData} transactionData the transaction data to sign
 * @param {KeyPair} keyPair the signer's keypair
 * @param {EthereumCommon} customCommon the network's custom common
 * @returns {string} the transaction signed and encoded
 */
export async function signInternal(
  transactionData: TxData,
  keyPair: KeyPair,
  customCommon: EthereumCommon,
): Promise<string> {
  if (!keyPair.getKeys().prv) {
    throw new SigningError('Missing private key');
  }
  const ethTx = new Transaction(formatTransaction(transactionData), { common: customCommon });
  const privateKey = Buffer.from(keyPair.getKeys().prv as string, 'hex');
  ethTx.sign(privateKey);
  const encodedTransaction = ethTx.serialize().toString('hex');
  return addHexPrefix(encodedTransaction);
}

/**
 * Signs the transaction using the appropriate algorithm
 *
 * @param {TxData} transactionData the transaction data to sign
 * @param {KeyPair} keyPair the signer's keypair
 * @returns {string} the transaction signed and encoded
 */
export async function sign(transactionData: TxData, keyPair: KeyPair): Promise<string> {
  return signInternal(transactionData, keyPair, testnetCommon);
}

/**
 * Format transaction to be signed
 *
 * @param {TxData} transactionData the transaction data with base values
 * @returns {TxData} the transaction data with hex values
 */
function formatTransaction(transactionData: TxData): TxData {
  return {
    gasLimit: addHexPrefix(Number(transactionData.gasLimit).toString(16)),
    gasPrice: addHexPrefix(new BigNumber(transactionData.gasPrice as string).toString(16)),
    nonce: addHexPrefix(Number(transactionData.nonce).toString(16)),
    data: transactionData.data,
  };
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
 * Returns the contract method encoded data
 *
 * @param {string} to destination address
 * @param {number} value Amount to tranfer
 * @param {string} data aditional method call data
 * @param {number} expireTime expiration time for the transaction in seconds
 * @param {number} sequenceId sequence id
 * @param {string} signature signature of the call
 * @returns {string} -- the contract method encoded data
 */
export function sendMultiSigData(
  to: string,
  value: number,
  data: string,
  expireTime: number,
  sequenceId: number,
  signature: string,
): string {
  const params = [to, value, data, expireTime, sequenceId, signature];
  const types = ['address', 'uint256', 'bytes', 'uint256', 'uint256', 'bytes'];
  const method = EthereumAbi.methodID('sendMultiSig', types).toString('hex');
  const args = EthereumAbi.rawEncode(types, params)
    .toString('hex')
    .replace('0x', '');
  return method + args;
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
