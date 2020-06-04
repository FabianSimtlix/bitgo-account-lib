import { StakingOperationsTypes } from '../baseCoin';

export const alfajores = 'tcgld';
export const mainnet = 'cgld';

export const LockMethodId = '0xf83d08ba';

const operations = {
  [StakingOperationsTypes.LOCK]: {
    [alfajores]: {
      contractAddress: '0x94c3e6675015d8479b648657e7ddfcd938489d0d',
      methodId: '0xf83d08ba',
      types: [],
    },
    [mainnet]: {
      contractAddress: '0x6cc083aed9e3ebe302a6336dbc7c921c9f03349e',
      methodId: '0xf83d08ba',
      types: [],
    },
  },
};

/**
 * @param type
 * @param coinName
 */
export function getOperationParams(type: StakingOperationsTypes, coinName: string) {
  return operations[type][coinName];
}
