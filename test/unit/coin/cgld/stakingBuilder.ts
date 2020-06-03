import should from 'should';
import { StakingBuilder } from '../../../../src/coin/cgld/stakingBuilder';
import { LockOperation, VoteOperation } from '../../../../src/coin/cgld/stakingUtils';
import { StakingOperationsTypes } from '../../../../src/coin/baseCoin';

describe('Celo staking operations builder', function() {
  let builder: StakingBuilder;
  beforeEach(() => {
    builder = new StakingBuilder();
    builder.type(StakingOperationsTypes.LOCK);
    builder.amount('1000');
  });

  it('should build an staking lock operation', () => {
    const staking = builder.build();
    should.equal(staking.address, LockOperation.contractAddress);
    should.equal(staking.serialize(), LockOperation.methodId);
  });

  it('should build a staking vote operation', () => {
    builder.type(StakingOperationsTypes.VOTE);
    builder.for('0x34084d6a4df32d9ad7395f4baad0db55c9c38145');
    builder.lesser('0x1e5f2141701f2698b910d442ec7adee2af96f852');
    builder.greater('0xa34da18dccd65a80b428815f57dc2075466e270e');
    const staking = builder.build();
    should.equal(staking.address, VoteOperation.contractAddress);
    should.equal(
      staking.serialize(),
      '0x580d747a00000000000000000000000034084d6a4df32d9ad7395f4baad0db55c9c3814500000000000000000000000000000000000000000000000000000000000003e80000000000000000000000001e5f2141701f2698b910d442ec7adee2af96f852000000000000000000000000a34da18dccd65a80b428815f57dc2075466e270e',
    );
  });

  it('should fail if the group to vote address is invalid', () => {
    should.throws(() => {
      builder.for('invalidaddress');
    }, 'Invalid address to vote for');
  });

  it('should fail if the lesser address is invalid', () => {
    should.throws(() => {
      builder.lesser('invalidaddress');
    }, 'Invalid address for lesser');
  });

  it('should fail if the greater address is invalid', () => {
    should.throws(() => {
      builder.greater('invalidaddress');
    }, 'Invalid address for greater');
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