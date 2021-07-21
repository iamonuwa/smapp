import { WalletMeta } from '../../../shared/types';
import type { WalletState, CustomAction } from '../../types';
import { LOGOUT } from '../auth/actions';
import {
  SAVE_WALLET_FILES,
  SET_WALLET_META,
  SET_ACCOUNTS,
  SET_MNEMONIC,
  SET_TRANSACTIONS,
  SET_CONTACTS,
  SET_CURRENT_ACCOUNT_INDEX,
  SET_BACKUP_TIME,
  SET_CURRENT_MODE,
  UPDATE_ACCOUNT_DATA
} from './actions';

const initialState = {
  walletFiles: null,
  meta: {} as WalletMeta,
  mnemonic: '',
  accounts: [],
  currentAccountIndex: 0,
  transactions: {},
  lastUsedContacts: [],
  contacts: [],
  backupTime: '',
  vaultMode: 0
};

// TODO: fix this while fixing contacts feature
// const getFirst3UniqueAddresses = (txList: TxList, ownAddress): Contact[] => {
//   const unique = new Set();
//   for (let i = 0; i < txList.length && i < 10; i += 1) {
//     if (!unique.has(txList[i]) && txList[i].receiver !== ownAddress) {
//       unique.add(txList[i]);
//     }
//   }
//   return Array.from(unique).map((uniqueTx: Tx) => ({ address: uniqueTx.receiver, nickname: uniqueTx.nickname || '' }));
// };

const reducer = (state: WalletState = initialState, action: CustomAction) => {
  switch (action.type) {
    case SAVE_WALLET_FILES: {
      return { ...state, walletFiles: action.payload };
    }
    case SET_WALLET_META: {
      return { ...state, meta: action.payload };
    }
    case SET_ACCOUNTS: {
      return { ...state, accounts: action.payload };
    }
    case SET_MNEMONIC: {
      return { ...state, mnemonic: action.payload };
    }
    case SET_CURRENT_ACCOUNT_INDEX: {
      const index = action.payload;
      if (index < state.accounts.length && index >= 0) {
        return { ...state, currentAccountIndex: index };
      }
      return state;
    }
    case SET_CURRENT_MODE: {
      return { ...state, vaultMode: action.payload };
    }
    case UPDATE_ACCOUNT_DATA: {
      const { account, accountId } = action.payload;
      const accountIndexToUpdate = state.accounts.findIndex((account) => account.publicKey === accountId);
      return {
        ...state,
        accounts: [
          ...state.accounts.slice(0, accountIndexToUpdate),
          { ...state.accounts[accountIndexToUpdate], currentState: account.currentState, projectedState: account.projectedState },
          ...state.accounts.slice(accountIndexToUpdate + 1)
        ]
      };
    }
    case SET_TRANSACTIONS: {
      const { publicKey, txs } = action.payload;
      if (state.transactions[publicKey]) {
        return { ...state, transactions: { ...state.transactions, [publicKey]: { ...state.transactions[publicKey], ...txs } } };
      }
      return { ...state, transactions: { ...state.transactions, [publicKey]: { ...txs } } };
    }
    case SET_CONTACTS: {
      return { ...state, contacts: action.payload };
    }
    case SET_BACKUP_TIME: {
      const { backupTime } = action.payload;
      return { ...state, backupTime };
    }
    case LOGOUT: {
      return initialState;
    }
    default:
      return state;
  }
};

export default reducer;
