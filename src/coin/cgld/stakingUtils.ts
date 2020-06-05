import { StakingOperationsTypes } from '../baseCoin';

export const alfajores = 'tcgld';
export const mainnet = 'cgld';

export const LockMethodId = '0xf83d08ba';
export const VoteMethodId = '0x580d747a';

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
  [StakingOperationsTypes.VOTE]: {
    [alfajores]: {
      contractAddress: '0x11fe523f93cac185d12cb39cc3bd279D2de524f8',
      methodId: VoteMethodId,
      types: ['address', 'uint256', 'address', 'address'],
    },
    [mainnet]: {
      contractAddress: '0x8d6677192144292870907e3fa8a5527fe55a7ff6',
      methodId: VoteMethodId,
      types: ['address', 'uint256', 'address', 'address'],
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
