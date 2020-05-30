import { Buffer } from 'buffer';
import EthereumAbi from 'ethereumjs-abi';
import { addHexPrefix } from 'ethereumjs-util';

export class Staking {
  constructor(
    public amount: string,
    public address: string,
    private _methodId: string,
    private _types: string[],
    private _params: [],
  ) {}

  serialize(): string {
    const args = EthereumAbi.rawEncode(this._types, this._params);
    return addHexPrefix(Buffer.concat([this._methodId, args]).toString('hex'));
  }
}
