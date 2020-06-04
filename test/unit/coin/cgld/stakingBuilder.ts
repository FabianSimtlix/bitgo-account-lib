import should from 'should';
import { StakingBuilder } from '../../../../src/coin/cgld/stakingBuilder';
import { getOperationParams } from '../../../../src/coin/cgld/stakingUtils';
import { StakingOperationsTypes } from '../../../../src/coin/baseCoin';

describe('Celo staking operations builder', function() {
  let builder: StakingBuilder;
  beforeEach(() => {
    builder = new StakingBuilder();
    builder.type(StakingOperationsTypes.LOCK);
    builder.amount('1000');
    builder.coin('cgld');
  });

  const lockOperation = getOperationParams(StakingOperationsTypes.LOCK, 'cgld');

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
