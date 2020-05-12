import { BaseFee } from '../baseCoin/iface';

export interface Fee extends BaseFee {
  gasLimit: string;
}

/**
 * A transaction's data.
 */
export interface TxData {
  /**
   * The transaction's gas limit.
   */
  gasLimit?: string;
  /**
   * The transaction's gas price.
   */
  gasPrice?: string;
  /**
   * The transaction's the address is sent to.
   */
  to?: string;
  /**
   * The transaction's nonce.
   */
  nonce?: string;
  /**
   * This will contain the data of the message or the init of a contract
   */
  data?: string;
  /**
   * EC recovery ID.
   */
  v?: string;
  /**
   * EC signature parameter.
   */
  r?: string;
  /**
   * EC signature parameter.
   */
  s?: string;
  /**
   * The amount of Ether sent.
   */
  value?: string;
  /**
   * The chainId's nonce.
   */
  chainId?: string;
}

export interface FieldStruct {
  components?: any;
  name: string;
  inputs?: any;
  type: string;
}
