//
// Wallet
//

import { ApiURL, NetId } from './misc';

export interface Account {
  displayName: string;
  created: string;
  path: string;
  publicKey: string;
  secretKey: string;
}

export interface AccountWithBalance extends Account {
  currentState?: { balance: number; counter: number };
  projectedState?: { balance: number; counter: number };
}

export enum WalletType {
  LOCAL_NODE = 0,
  REMOTE_API = 1
}

export type WalletMode = [WalletType.LOCAL_NODE, NetId] | [WalletType.REMOTE_API, NetId, ApiURL];

export interface WalletMeta {
  displayName: string;
  created: string;
  mode: WalletMode;
  meta: {
    salt: string;
  };
}

export interface WalletCrypto {
  cipher: string;
  cipherText: string;
}

export interface WalletFile {
  meta: WalletMeta;
  crypto: WalletCrypto;
}

export interface Contact {
  address: string;
  nickname: string;
}
