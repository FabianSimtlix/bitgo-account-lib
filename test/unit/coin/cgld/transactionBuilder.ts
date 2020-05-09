import should from 'should';
import { RLP } from 'ethers/utils';
import { TransactionType } from '../../../../src/coin/baseCoin/';
import { getBuilder, Eth } from '../../../../src';
import * as testData from '../../../resources/cgld/cgld';
import { formatTx } from '../../../../src/coin/cgld/utils';
import { getContractData } from '../../../../src/coin/eth/utils';

describe('Celo Transaction builder', function() {
  const defaultKeyPair = new Eth.KeyPair({
    prv: '8CAA00AE63638B0542A304823D66D96FF317A576F692663DB2F85E60FAB2590C',
  });

  describe('should sign', () => {
    it('an init transaction', async () => {
      const txBuilder: any = getBuilder('cgld');
      txBuilder.type(TransactionType.WalletInitialization);
      txBuilder.fee({
        fee: '1000000000',
        gasLimit: '12100000',
      });
      txBuilder.chainId(44786);
      const source = {
        prv: '8CAA00AE63638B0542A304823D66D96FF317A576F692663DB2F85E60FAB2590C',
      };
      const sourceKeyPair = new Eth.KeyPair(source);
      txBuilder.source(sourceKeyPair.getAddress());
      txBuilder.counter(2);
      txBuilder.owner(testData.ACCOUNT1);
      txBuilder.owner(testData.ACCOUNT2);
      txBuilder.owner(testData.ACCOUNT3);
      txBuilder.sign({ key: defaultKeyPair.getKeys().prv });
      const tx = await txBuilder.build(); //shoud build and sign
      tx.type.should.equal(TransactionType.WalletInitialization);
      const txJson = tx.toJson();
      txJson.gasLimit.should.equal('12100000');
      txJson.gasPrice.should.equal('1000000000');
      should.equal(txJson.nonce, 2);
      should.equal(txJson.chainId, 44786);
      should.equal(tx.toBroadcastFormat(), testData.TX_BROADCAST);
    });

    it('an encoded transaction', async () => {
      const txBuilder: any = getBuilder('cgld');
      txBuilder.type(TransactionType.WalletInitialization);
      txBuilder.owner(testData.ACCOUNT1);
      txBuilder.owner(testData.ACCOUNT2);
      txBuilder.owner(testData.ACCOUNT3);
      const walletOwners = [testData.ACCOUNT1, testData.ACCOUNT2, testData.ACCOUNT3];
      const txData = testData.TXDATA_EMPTY_DATA;
      txData.data = getContractData(walletOwners);
      const txFormat = formatTx(txData);
      const encodedTxData = RLP.encode([
        txFormat.nonce,
        txFormat.gasPrice,
        txFormat.gasLimit,
        '0x',
        '0x',
        '0x',
        '0x',
        '0x',
        txFormat.data,
        txFormat.chainId,
        '0x',
        '0x',
        '0x',
      ]);
      txBuilder.from(encodedTxData);
      txBuilder.sign({ key: defaultKeyPair.getKeys().prv });
      const tx = await txBuilder.build();
      const txJson = tx.toJson();
      should.equal(txJson.nonce, testData.TXDATA_EMPTY_DATA.nonce);
      should.equal(txJson.gasPrice, testData.TXDATA_EMPTY_DATA.gasPrice);
      should.equal(txJson.gasLimit, testData.TXDATA_EMPTY_DATA.gasLimit);
      should.equal(tx.toBroadcastFormat(), testData.TX_BROADCAST);
    });
  });

  describe('should build', () => {
    it('an init transaction', async () => {
      const txBuilder: any = getBuilder('cgld');
      txBuilder.type(TransactionType.WalletInitialization);
      txBuilder.fee({
        fee: '1000000000',
        gasLimit: '12100000',
      });
      txBuilder.chainId(44786);
      const source = {
        prv: '8CAA00AE63638B0542A304823D66D96FF317A576F692663DB2F85E60FAB2590C',
      };
      const sourceKeyPair = new Eth.KeyPair(source);
      txBuilder.source(sourceKeyPair.getAddress());
      txBuilder.counter(2);
      txBuilder.owner('0x386Fe4E3D2b6Acce93CC13d06e92B00aa50F429c');
      txBuilder.owner('0xBa8eA9C3729686d7DB120efCfC81cD020C8DC1CB');
      txBuilder.owner('0x2fa96fca36dd9d646AC8a4e0C19b4D3a0Dc7e456');
      const tx = await txBuilder.build(); //build without sign
      tx.type.should.equal(TransactionType.WalletInitialization);
      const txJson = tx.toJson();
      txJson.gasLimit.should.equal('12100000');
      txJson.gasPrice.should.equal('1000000000');
      should.equal(txJson.nonce, 2);
      should.equal(txJson.chainId, 44786);
    });
  });

  describe('should fail to build', () => {
    it('an unsupported type of transaction', () => {
      const txBuilder: any = getBuilder('cgld');
      txBuilder.type(TransactionType.AddressInitialization);
      return txBuilder.build().should.be.rejectedWith('Unsupported transaction type');
    });
  });
});
