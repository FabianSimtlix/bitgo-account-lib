import { NetworkType } from '@bitgo/statics';
import { StakingOperationTypes } from '../baseCoin';
import { ContractMethodConfig } from '../eth/iface';

export const LockMethodId = '0xf83d08ba';

const operations = {
  [StakingOperationTypes.LOCK]: {
    [NetworkType.TESTNET]: {
      contractAddress: '0x94c3e6675015d8479b648657e7ddfcd938489d0d',
      methodId: LockMethodId,
      types: [],
    },
    [NetworkType.MAINNET]: {
      contractAddress: '0x6cc083aed9e3ebe302a6336dbc7c921c9f03349e',
      methodId: LockMethodId,
      types: [],
    },
  },
};

/**
 * @param type
 * @param network
 */
export function getOperationConfig(type: StakingOperationTypes, network: NetworkType): ContractMethodConfig {
  return operations[type][network];
}
