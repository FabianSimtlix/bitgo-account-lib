import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { Eth } from '../../../index';
import { TransactionType } from '../../baseCoin';
import { Transaction } from '../transaction';
import { StakingLockBuilder, StakingVoteBuilder } from './stakingLockBuilder';

export class TransactionBuilderFactory extends Eth.TransactionBuilderFactory {
  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
    this.transactionClass = Transaction;
  }

  type(type: TransactionType.StakingLock): StakingLockBuilder;
  type(type: TransactionType.StakingVote): StakingVoteBuilder;
  type(type: TransactionType.WalletInitialization): Eth.WalletInitializationBuilder;
  type(type: TransactionType): Eth.TransactionBuilder;
  type(type: TransactionType): Eth.TransactionBuilder {
    switch (type) {
      case TransactionType.StakingVote:
        return new StakingVoteBuilder(this._coinConfig);
      case TransactionType.StakingLock:
        return new StakingLockBuilder(this._coinConfig);
      default:
        return super.type(type);
    }
  }
}
