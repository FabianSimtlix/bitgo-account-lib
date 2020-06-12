import { coins } from '@bitgo/statics';
import should from 'should';
import { TransactionType } from '../../../../../src/coin/baseCoin';
import * as testData from '../../../../resources/cgld/cgld';
import { TransactionBuilderFactory } from '../../../../../src/coin/cgld/builder/transactionBuilderFactory';

describe('An address initialization', () => {
  const factory = new TransactionBuilderFactory(coins.get('cgld'));
  describe('Should sign and build', () => {
    it('an address initialization transaction', async () => {
      const txBuilder = factory.type(TransactionType.AddressInitialization);
      txBuilder.fee({
        fee: '1000000000',
        gasLimit: '12100000',
      });
      txBuilder.chainId(44786);
      txBuilder.source(testData.KEYPAIR_PRV.getAddress());
      txBuilder.counter(2);
      txBuilder.contractCounter(1);
      txBuilder.contract(testData.CONTRACT_ADDRESS);
      txBuilder.sign({ key: testData.KEYPAIR_PRV.getKeys().prv });
      const tx = await txBuilder.build();
      tx.type.should.equal(TransactionType.AddressInitialization);
      const txJson = tx.toJson();
      txJson.gasLimit.should.equal('12100000');
      txJson.gasPrice.should.equal('1000000000');
      should.equal(txJson.nonce, 2);
      should.equal(txJson.chainId, 44786);
      should.equal(tx.toBroadcastFormat(), testData.TX_ADDRESS_INIT);
      should.equal(txJson.deployedAddress, '0x016e4eee27f3f355bbb78d0e5eb813c4761822c9');
    });
  });

  describe('Should fail to build', () => {
    it('an address initialization transaction without fee', async () => {
      const txBuilder = factory.type(TransactionType.AddressInitialization);
      txBuilder.chainId(44786);
      txBuilder.source(testData.KEYPAIR_PRV.getAddress());
      txBuilder.counter(1);
      txBuilder.contract(testData.CONTRACT_ADDRESS);
      await txBuilder.build().should.be.rejectedWith('Invalid transaction: missing fee');
    });

    it('an address initialization transaction without source', async () => {
      const txBuilder = factory.type(TransactionType.AddressInitialization);
      txBuilder.fee({
        fee: '10000000000',
        gasLimit: '2000000',
      });
      txBuilder.chainId(44786);
      txBuilder.counter(1);
      txBuilder.contract(testData.CONTRACT_ADDRESS);
      await txBuilder.build().should.be.rejectedWith('Invalid transaction: missing source');
    });

    it('an address initialization transaction without chain id', async () => {
      const txBuilder = factory.type(TransactionType.AddressInitialization);
      txBuilder.fee({
        fee: '10000000000',
        gasLimit: '2000000',
      });
      txBuilder.source(testData.KEYPAIR_PRV.getAddress());
      txBuilder.counter(1);
      txBuilder.contract(testData.CONTRACT_ADDRESS);
      await txBuilder.build().should.be.rejectedWith('Invalid transaction: missing chain id');
    });
  });
});
