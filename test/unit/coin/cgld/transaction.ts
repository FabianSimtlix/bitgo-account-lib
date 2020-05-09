import should from 'should';
import { coins } from '@bitgo/statics';
import { Transaction } from '../../../../src/coin/cgld/transaction';
import * as testData from '../../../resources/cgld/cgld';

describe('Celo Transaction', function() {
  describe('should throw empty transaction', function() {
    const tx = new Transaction(coins.get('cgld'));
    should.throws(() => {
      tx.toJson();
    });
    should.throws(() => {
      tx.toBroadcastFormat();
    });
  });

  describe('should construct a valid transaction', function() {
    it('set parsed transaction data', () => {
      const tx = new Transaction(coins.get('cgld'), testData.TXDATA);
      should.equal(tx.toJson(), testData.TXDATA);
    });

    it('set encoded transaction data', () => {
      const tx = new Transaction(coins.get('cgld'), testData.ENCODED_TRANSACTION);
      should.equal(tx.toBroadcastFormat(), testData.ENCODED_TRANSACTION);
    });
  });

  describe('should return valid transaction', function() {
    const tx = new Transaction(coins.get('cgld'));
    tx.setTransactionData(testData.TXDATA);
    should.equal(tx.toJson(), testData.TXDATA);
    should.throws(() => {
      tx.toBroadcastFormat();
    });
  });

  describe('should sign', function() {
    it('invalid', function() {
      const tx = new Transaction(coins.get('cgld'));
      return tx.sign(testData.KEYPAIR_PRV).should.be.rejected();
    });

    it('valid', function() {
      const tx = new Transaction(coins.get('cgld'));
      tx.setTransactionData(testData.TXDATA);
      return tx.sign(testData.KEYPAIR_PRV).should.be.fulfilled();
    });
  });

  describe('should return encoded tx', function() {
    it('valid sign', async function() {
      const tx = new Transaction(coins.get('cgld'));
      tx.setTransactionData(testData.TXDATA);
      await tx.sign(testData.KEYPAIR_PRV);
      should.equal(tx.toBroadcastFormat(), testData.ENCODED_TRANSACTION);
    });
  });
});
