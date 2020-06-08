import should from 'should';
import { coins } from '@bitgo/statics';
import { StakingBuilder } from '../../../../src/coin/cgld/stakingBuilder';
import { getOperationConfig } from '../../../../src/coin/cgld/stakingUtils';
import { StakingOperationTypes } from '../../../../src/coin/baseCoin';

describe('Celo staking operations builder', function() {
  const coin = coins.get('tcgld');
  let builder: StakingBuilder;
  beforeEach(() => {
    builder = new StakingBuilder(coin);
    builder.type(StakingOperationTypes.LOCK);
    builder.amount('1000');
  });

  const lockOperation = getOperationConfig(StakingOperationTypes.LOCK, coin.network.type);

  it('should build an staking lock operation', () => {
    const staking = builder.build();
    should.equal(staking.address, lockOperation.contractAddress);
    should.equal(staking.serialize(), lockOperation.methodId);
  });

  it('should fail if amount is invalid number', () => {
    should.throws(() => {
      builder.amount('asd');
    }, 'Invalid value for stake transaction');
  });

  it('should fail to build if type is not supported', function() {
    const NOT_SUPPORTED = 100;
    builder.type(NOT_SUPPORTED);
    should.throws(
      () => {
        builder.build();
      },
      e => {
        return e.message === 'Invalid staking operation: 100';
      },
    );
  });
});
