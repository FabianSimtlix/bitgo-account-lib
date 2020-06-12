import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { TransactionType } from './enum';

export abstract class BaseTransactionBuilderFactory {
  /**
   * Base constructor.
   *
   * @param _coinConfig BaseCoin from statics library
   */
  protected constructor(protected _coinConfig: Readonly<CoinConfig>) {}

  abstract type(type: TransactionType);
}
