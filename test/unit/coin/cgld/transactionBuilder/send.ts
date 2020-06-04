import should from 'should';
import { TransactionType } from '../../../../../src/coin/baseCoin';
import { getBuilder, Cgld } from '../../../../../src';
import * as testData from '../../../../resources/cgld/cgld';

describe('Send transaction', function() {
  let txBuilder: Cgld.TransactionBuilder;
  const initTxBuilder = (): void => {
    txBuilder = getBuilder('cgld') as Cgld.TransactionBuilder;
    txBuilder.fee({
      fee: '1000000000',
      gasLimit: '12100000',
    });
    txBuilder.chainId(44786);
    txBuilder.source(testData.KEYPAIR_PRV.getAddress());
    txBuilder.counter(2);
    txBuilder.type(TransactionType.Send);
  };
  const key = testData.KEYPAIR_PRV.getKeys().prv as string;

  describe('should sign and build', () => {
    it('a send token transaction', async () => {
      initTxBuilder();
      txBuilder.contract('0x8f977e912ef500548a0c3be6ddde9899f1199b81');
      txBuilder
        .transfer()
        .coin('tcusd')
        .amount('1000000000')
        .to('0x19645032c7f1533395d44a629462e751084d3e4c')
        .expirationTime(1590066728)
        .contractSequenceId(5)
        .key(key);
      txBuilder.sign({ key: testData.PRIVATE_KEY });
      const tx = await txBuilder.build();
      should.equal(tx.toBroadcastFormat(), testData.SEND_TOKEN_TX_BROADCAST);
    });

    it('a send token transactions from serialized', async () => {
      const txBuilder = getBuilder('cgld') as Cgld.TransactionBuilder;
      txBuilder.from(testData.SEND_TOKEN_TX_BROADCAST);
      const tx = await txBuilder.build();
      should.equal(tx.toBroadcastFormat(), testData.SEND_TOKEN_TX_BROADCAST);
    });
  });

  describe('should fail to build', async () => {
    it('a send token transaction without fee', async () => {
      const txBuilder = getBuilder('cgld') as Cgld.TransactionBuilder;
      txBuilder.type(TransactionType.Send);
      txBuilder.chainId(44786);
      txBuilder.source(testData.KEYPAIR_PRV.getAddress());
      txBuilder.counter(1);
      txBuilder.contract(testData.CONTRACT_TOKEN_CUSD_ADDRESS);
      await txBuilder.build().should.be.rejectedWith('Invalid transaction: missing fee');
    });

    it('a send token transaction without source', async () => {
      const txBuilder = getBuilder('cgld') as Cgld.TransactionBuilder;
      txBuilder.type(TransactionType.Send);
      txBuilder.fee({
        fee: '10000000000',
        gasLimit: '2000000',
      });
      txBuilder.chainId(44786);
      txBuilder.counter(1);
      txBuilder.contract(testData.CONTRACT_TOKEN_CUSD_ADDRESS);
      await txBuilder.build().should.be.rejectedWith('Invalid transaction: missing source');
    });

    it('a send token transaction without chain id', async () => {
      const txBuilder = getBuilder('cgld') as Cgld.TransactionBuilder;
      txBuilder.type(TransactionType.Send);
      txBuilder.fee({
        fee: '10000000000',
        gasLimit: '2000000',
      });
      txBuilder.source(testData.KEYPAIR_PRV.getAddress());
      txBuilder.counter(1);
      txBuilder.contract(testData.CONTRACT_TOKEN_CUSD_ADDRESS);
      await txBuilder.build().should.be.rejectedWith('Invalid transaction: missing chain id');
    });

    it('a send token transaction without nonce', async () => {
      const txBuilder = getBuilder('cgld') as Cgld.TransactionBuilder;
      txBuilder.type(TransactionType.Send);
      txBuilder.fee({
        fee: '10000000000',
        gasLimit: '2000000',
      });
      txBuilder.source(testData.KEYPAIR_PRV.getAddress());
      txBuilder.chainId(44786);
      txBuilder.counter(1);
      await txBuilder.build().should.be.rejectedWith('Invalid transaction: missing contract address');
    });

    it('a send token transaction with wrong transaction type', async () => {
      initTxBuilder();
      txBuilder.type(TransactionType.WalletInitialization);
      txBuilder.contract('0x8f977e912ef500548a0c3be6ddde9899f1199b81');
      should.throws(() => {
        txBuilder.transfer();
      }, 'Error: Token transfers can only be set for send token transactions');
    });

    it('a send token transaction without token information', async () => {
      const txBuilder = getBuilder('cgld') as Cgld.TransactionBuilder;
      txBuilder.type(TransactionType.Send);
      txBuilder.fee({
        fee: '10000000000',
        gasLimit: '2000000',
      });
      txBuilder.source(testData.KEYPAIR_PRV.getAddress());
      txBuilder.chainId(44786);
      txBuilder.counter(1);
      txBuilder.contract(testData.CONTRACT_TOKEN_CUSD_ADDRESS);
      await txBuilder.build().should.be.rejectedWith('Missing transfer information');
    });
  });
});
