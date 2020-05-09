import * as testData from '../../../resources/cgld/cgld';
import { sign } from '../../../../src/coin/cgld/utils';
import { KeyPair } from '../../../../src/coin/eth/keyPair';

describe('Celo utils', async function() {
  it('should fail to sign', async () => {
    const defaultKeyPair = new KeyPair({ pub: testData.PUBLIC_KEY });
    return sign(testData.TXDATA, defaultKeyPair).should.be.rejectedWith('Missing private key');
  });
});
