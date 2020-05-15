import should from 'should';
import { RLP } from 'ethers/utils';
import { TransactionType } from '../../../../src/coin/baseCoin/';
import { getBuilder, Eth } from '../../../../src';
import * as testData from '../../../resources/cgld/cgld';
import { getContractData } from '../../../../src/coin/eth/utils';

describe('Celo Transaction builder', function() {
  let txBuilder;

  beforeEach(() => {
    txBuilder = getBuilder('cgld');
    txBuilder.fee({
      fee: '1000000000',
      gasLimit: '12100000',
    });
    txBuilder.chainId(44786);
    txBuilder.source(defaultKeyPair.getAddress());
    txBuilder.counter(2);
  });

  const defaultKeyPair = new Eth.KeyPair({
    prv: '8CAA00AE63638B0542A304823D66D96FF317A576F692663DB2F85E60FAB2590C',
  });

  describe('should validate', () => {
    it('a raw transaction', async () => {
      const builder: any = getBuilder('cgld');
      should.doesNotThrow(() => builder.from(testData.TX_BROADCAST));
      should.doesNotThrow(() => builder.from(testData.TX_JSON));
      should.throws(() => builder.from('0x00001000'), 'There was error in decoding the hex string');
      should.throws(() => builder.from(''), 'There was error in decoding the hex string');
      should.throws(() => builder.from('pqrs'), 'There was error in parsing the JSON string');
      should.throws(() => builder.from(1234), 'Transaction is not a hex string or stringified json');
    });
  });

  describe('should sign', () => {
    it('an init transaction', async () => {
      txBuilder.type(TransactionType.WalletInitialization);
      txBuilder.owner('0x386Fe4E3D2b6Acce93CC13d06e92B00aa50F429c');
      txBuilder.owner('0xBa8eA9C3729686d7DB120efCfC81cD020C8DC1CB');
      txBuilder.owner('0x2fa96fca36dd9d646AC8a4e0C19b4D3a0Dc7e456');
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
    it('an send transaction', async () => {
      txBuilder.type(TransactionType.Send);
      txBuilder.contract('0x8f977e912ef500548a0c3be6ddde9899f1199b81');
      txBuilder
        .transfer(1000000000)
        .to('0x19645032c7f1533395d44a629462e751084d3e4c')
        .expirationTime(1590066728)
        .sequenceId(5)
        .key(defaultKeyPair.getKeys().prv);
      txBuilder.sign({ key: defaultKeyPair.getKeys().prv });
      const tx = await txBuilder.build(); //shoud build and sign
      should.equal(tx.toBroadcastFormat(), testData.SEND_TX_BROADCAST);
    });

    it.skip('an unsigned init transaction from serialized', async () => {
      //TODO: this is not working due to the encoding of the tx in toBroadcastFormat()
      txBuilder.type(TransactionType.WalletInitialization);
      txBuilder.owner('0x386Fe4E3D2b6Acce93CC13d06e92B00aa50F429c');
      txBuilder.owner('0xBa8eA9C3729686d7DB120efCfC81cD020C8DC1CB');
      txBuilder.owner('0x2fa96fca36dd9d646AC8a4e0C19b4D3a0Dc7e456');
      txBuilder.source(defaultKeyPair.getAddress());
      const tx = await txBuilder.build();
      const serialized = tx.toBroadcastFormat();

      // now rebuild from the signed serialized tx and make sure it stays the same
      const newTxBuilder: any = getBuilder('cgld');
      newTxBuilder.from(serialized);
      newTxBuilder.source(defaultKeyPair.getAddress());
      const newTx = await newTxBuilder.build();
      should.equal(newTx.toBroadcastFormat(), serialized);

      newTxBuilder.sign({ key: defaultKeyPair.getKeys().prv });
      const signedTx = await newTxBuilder.build();
      should.equal(signedTx.toBroadcastFormat(), testData.TX_BROADCAST);
    });

    it('a signed init transaction from serialized', async () => {
      txBuilder.type(TransactionType.WalletInitialization);
      txBuilder.source(defaultKeyPair.getAddress());
      txBuilder.owner('0x6461EC4E9dB87CFE2aeEc7d9b02Aa264edFbf41f');
      txBuilder.owner('0xf10C8f42BD63D0AeD3338A6B2b661BC6D9fa7C44');
      txBuilder.owner('0xa4b5666FB4fFEA84Dd848845E1114b84146de4b3');
      txBuilder.sign({ key: defaultKeyPair.getKeys().prv });
      const tx = await txBuilder.build();
      const serialized = tx.toBroadcastFormat();

      // now rebuild from the signed serialized tx and make sure it stays the same
      const newTxBuilder: any = getBuilder('cgld');
      newTxBuilder.from(serialized);
      newTxBuilder.source(defaultKeyPair.getAddress());
      newTxBuilder.sign({ key: defaultKeyPair.getKeys().prv });
      const newTx = await newTxBuilder.build();
      should.equal(newTx.toBroadcastFormat(), serialized);
    });
  });
});
