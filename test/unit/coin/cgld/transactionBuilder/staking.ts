import should from 'should';
import { Cgld, getBuilder } from '../../../../../src';
import { TransactionType } from '../../../../../src/coin/baseCoin';
import * as testData from '../../../../resources/cgld/cgld';
import { LockOperation } from '../../../../../src/coin/cgld/stakingUtils';

describe('Celo staking transaction builder', () => {
  let txBuilder;
  beforeEach(() => {
    txBuilder = getBuilder('cgld') as Cgld.TransactionBuilder;
    txBuilder.type(TransactionType.Staking_Lock);
    txBuilder.fee({
      fee: '1000000000',
      gasLimit: '12100000',
    });
    txBuilder.chainId(44786);
    txBuilder.source(testData.KEYPAIR_PRV.getAddress());
    txBuilder.counter(1);
  });

  it('should build a lock transaction', async function() {
    txBuilder.lock().amount('100');
    const txJson = (await txBuilder.build()).toJson();
    should.equal(txJson.to, LockOperation.contractAddress);
    should.equal(txJson.data, LockOperation.methodId);
  });

  it('should sign and build a lock transaction from serialized', async function() {
    const builder = getBuilder('cgld') as Cgld.TransactionBuilder;
    builder.from('0xed01843b9aca0083b8a1a08080809494c3e6675015d8479b648657e7ddfcd938489d0d6484f83d08ba82aef28080');
    builder.source(testData.KEYPAIR_PRV.getAddress());
    builder.sign({ key: testData.PRIVATE_KEY });
    const tx = await builder.build();
    const txJson = tx.toJson();
    should.equal(txJson.to, LockOperation.contractAddress);
    should.equal(txJson.data, LockOperation.methodId);
    should.equal(txJson.from, testData.ACCOUNT1);
    should.equal(tx.toBroadcastFormat(), testData.LOCK_BROADCAST_TX);
  });

  it('should fail to call lock if it is not an staking lock type transaction', () => {
    txBuilder.type(TransactionType.AddressInitialization);
    should.throws(
      () => {
        txBuilder.lock();
      },
      e => {
        return e.message === 'Lock can only be set for Staking Lock transactions type';
      },
    );
  });

  it('should fail to build and staking lock operation if operationBuilder is not set', async () => {
    await txBuilder.build().should.be.rejectedWith('No staking information set');
  });
});
