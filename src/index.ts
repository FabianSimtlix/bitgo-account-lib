import { coins } from '@bitgo/statics';
import { BuildTransactionError } from './coin/baseCoin/errors';
import { BaseTransactionBuilder, BaseTransactionBuilderFactory } from './coin/baseCoin';

import * as crypto from './utils/crypto';
export { crypto };
// coins
import * as BaseCoin from './coin/baseCoin';
export { BaseCoin };

import * as Trx from './coin/trx';
export { Trx };

import * as Xtz from './coin/xtz';
export { Xtz };

import * as Eth from './coin/eth';
export { Eth };

import * as Etc from './coin/etc';
export { Etc };

import * as Rbtc from './coin/rbtc';
export { Rbtc };

import * as Cgld from './coin/cgld';
export { Cgld };

const coinBuilderMap = {
  trx: Trx.TransactionBuilder,
  ttrx: Trx.TransactionBuilder,
  xtz: Xtz.TransactionBuilder,
  txtz: Xtz.TransactionBuilder,
  etc: Etc.TransactionBuilderFactory,
  tetc: Etc.TransactionBuilderFactory,
  eth: Eth.TransactionBuilderFactory,
  teth: Eth.TransactionBuilderFactory,
  rbtc: Rbtc.TransactionBuilderFactory,
  trbtc: Rbtc.TransactionBuilderFactory,
  cgld: Cgld.TransactionBuilderFactory,
  tcgld: Cgld.TransactionBuilderFactory,
};

/**
 * Get the list of coin tickers supported by this library.
 */
export const supportedCoins = Object.keys(coinBuilderMap);

/**
 * Get a transaction builder for the given coin.
 *
 * @param coinName One of the {@code supportedCoins}
 * @returns An instance of a {@code TransactionBuilder}
 */
export function getBuilder(coinName: string): BaseTransactionBuilder | BaseTransactionBuilderFactory {
  const builderClass = coinBuilderMap[coinName];
  if (!builderClass) {
    throw new BuildTransactionError(`Coin ${coinName} not supported`);
  }

  return new builderClass(coins.get(coinName));
}
