import { Account, ApiURL, Contact, WalletMeta } from '../../../shared/types';
import { eventsService } from '../../infra/eventsService';
import { createError, getAddress } from '../../infra/utils';
import { AppThDispatch, GetState, AccountTxs, Tx } from '../../types';

export const SET_WALLET_META = 'SET_WALLET_META';
export const SET_ACCOUNTS = 'SET_ACCOUNTS';
export const SET_CURRENT_ACCOUNT_INDEX = 'SET_CURRENT_ACCOUNT_INDEX';
export const SET_CURRENT_MODE = 'SET_CURRENT_MODE';

export const SET_MNEMONIC = 'SET_MNEMONIC';
export const SET_TRANSACTIONS = 'SET_TRANSACTIONS';
export const SET_CONTACTS = 'SET_CONTACTS';

export const UPDATE_ACCOUNT_DATA = 'UPDATE_ACCOUNT_DATA';

export const SAVE_WALLET_FILES = 'SAVE_WALLET_FILES';

export const SET_BACKUP_TIME = 'SET_BACKUP_TIME';

export const setWalletMeta = (wallet: WalletMeta) => ({ type: SET_WALLET_META, payload: wallet });

export const setAccounts = (accounts: Account[]) => ({ type: SET_ACCOUNTS, payload: accounts });

export const setCurrentAccount = (index: number) => ({ type: SET_CURRENT_ACCOUNT_INDEX, payload: index });

export const setMnemonic = (mnemonic: string) => ({ type: SET_MNEMONIC, payload: mnemonic });

export const updateAccountData = ({ account, accountId }: { account: any; accountId: string }) => ({ type: UPDATE_ACCOUNT_DATA, payload: { account, accountId } });

export const setTransactions = ({ txs, publicKey }: { txs: AccountTxs; publicKey: string }) => ({ type: SET_TRANSACTIONS, payload: { txs, publicKey } });

export const setContacts = (contacts: Contact[]) => ({ type: SET_CONTACTS, payload: contacts });

export const setCurrentMode = (mode: number) => ({ type: SET_CURRENT_MODE, payload: mode });

export const readWalletFiles = () => async (dispatch: AppThDispatch) => {
  const { error, files } = await eventsService.readWalletFiles();
  if (error) {
    console.log(error); // eslint-disable-line no-console
    dispatch({ type: SAVE_WALLET_FILES, payload: [] });
    return [];
  }
  dispatch({ type: SAVE_WALLET_FILES, payload: files });
  return files;
};

export const createNewWallet = ({ existingMnemonic = '', password, url = '' }: { existingMnemonic?: string | undefined; password: string; url?: ApiURL }) => (
  dispatch: AppThDispatch
) =>
  eventsService
    .createWallet({ password, existingMnemonic, url })
    .then((data) => {
      const { meta, accounts, mnemonic } = data;
      dispatch(setWalletMeta(meta));
      dispatch(setAccounts(accounts));
      dispatch(setMnemonic(mnemonic));
      dispatch(readWalletFiles());
      return data;
    })
    .catch((err) => {
      console.log(err); // eslint-disable-line no-console
      throw createError('Error creating new wallet!', () => dispatch(createNewWallet({ existingMnemonic, password, url })));
    });

export const unlockWallet = ({ password }: { password: string }) => async (dispatch: AppThDispatch, getState: GetState) => {
  const { walletFiles } = getState().wallet;
  const { error, accounts, mnemonic, meta, contacts } = await eventsService.unlockWallet({ path: walletFiles ? walletFiles[0] : '', password });
  if (error) {
    console.log(error); // eslint-disable-line no-console
    throw createError(error.message, () => dispatch(unlockWallet({ password })));
  } else {
    dispatch(setWalletMeta(meta));
    dispatch(setAccounts(accounts));
    dispatch(setMnemonic(mnemonic));
    dispatch(setContacts(contacts));
    dispatch(setCurrentAccount(0));
  }
};

export const updateWalletName = ({ displayName }: { displayName: string }) => async (dispatch: AppThDispatch, getState: GetState) => {
  const { wallet } = getState();
  const { walletFiles, meta } = wallet;
  const updatedMeta = { ...meta, displayName };
  await eventsService.updateWalletFile({ fileName: walletFiles ? walletFiles[0] : '', data: updatedMeta });
  dispatch(setWalletMeta(updatedMeta));
};

export const createNewAccount = ({ password }: { password: string }) => async (dispatch: AppThDispatch, getState: GetState) => {
  const { walletFiles, accounts } = getState().wallet;
  const { error, newAccount } = await eventsService.createNewAccount({ fileName: walletFiles ? walletFiles[0] : '', password });
  if (error) {
    console.log(error); // eslint-disable-line no-console
    throw createError('Failed to create new account', () => dispatch(createNewAccount({ password })));
  } else {
    dispatch(setAccounts([...accounts, newAccount]));
  }
};

export const updateAccountName = ({ accountIndex, name, password }: { accountIndex: number; name: string; password: string }) => async (
  dispatch: AppThDispatch,
  getState: GetState
) => {
  const { walletFiles, accounts, mnemonic, contacts } = getState().wallet;
  const updatedAccount = { ...accounts[accountIndex], displayName: name };
  const updatedAccounts = [...accounts.slice(0, accountIndex), updatedAccount, ...accounts.slice(accountIndex + 1)];
  await eventsService.updateWalletFile({ fileName: walletFiles ? walletFiles[0] : '', password, data: { mnemonic, accounts: updatedAccounts, contacts } });
  dispatch(setAccounts(updatedAccounts));
};

export const addToContacts = ({ contact, password }: { contact: Contact; password: string }) => async (dispatch: AppThDispatch, getState: GetState) => {
  const { walletFiles, accounts, mnemonic, contacts } = getState().wallet;
  const updatedContacts = [contact, ...contacts];
  await eventsService.updateWalletFile({ fileName: walletFiles ? walletFiles[0] : '', password, data: { accounts, mnemonic, contacts: updatedContacts } });
  dispatch(setContacts(updatedContacts));
};

export const removeFromContacts = ({ contact, password }: { contact: Contact; password: string }) => async (dispatch: AppThDispatch, getState: GetState) => {
  const { walletFiles, accounts, mnemonic, contacts } = getState().wallet;
  const updatedContacts = contacts.filter((item) => contact.address !== item.address);
  await eventsService.updateWalletFile({ fileName: walletFiles ? walletFiles[0] : '', password, data: { accounts, mnemonic, contacts: updatedContacts } });
  dispatch(setContacts(updatedContacts));
};

export const restoreFile = ({ filePath }: { filePath: string }) => async (dispatch: AppThDispatch, getState: GetState) => {
  const { walletFiles } = getState().wallet;
  const { error, newFilePath } = await eventsService.copyFile({ filePath });
  if (error) {
    console.log(error); // eslint-disable-line no-console
    throw createError('Error restoring file!', () => dispatch(restoreFile({ filePath })));
  } else {
    dispatch({ type: SAVE_WALLET_FILES, payload: walletFiles ? [newFilePath, ...walletFiles] : [newFilePath] });
  }
};

export const backupWallet = () => async (dispatch: AppThDispatch, getState: GetState) => {
  const { walletFiles } = getState().wallet;
  const { error } = await eventsService.copyFile({ filePath: walletFiles ? walletFiles[0] : '', copyToDocuments: true });
  if (error) {
    console.log(error); // eslint-disable-line no-console
    throw createError('Error creating wallet backup!', () => dispatch(backupWallet()));
  } else {
    dispatch({ type: SET_BACKUP_TIME, payload: { backupTime: new Date() } });
  }
};

export const sendTransaction = ({ receiver, amount, fee, note }: { receiver: string; amount: number; fee: number; note: string }) => async (
  dispatch: AppThDispatch,
  getState: GetState
) => {
  const { accounts, currentAccountIndex, contacts } = getState().wallet;
  const fullTx: Tx = {
    txId: '',
    sender: getAddress(accounts[currentAccountIndex].publicKey),
    receiver,
    amount,
    fee,
    status: 0,
    timestamp: new Date().getTime(),
    note
  };
  contacts.forEach((contact) => {
    if (contact.address.substring(2) === fullTx.sender || contact.address.substring(2) === fullTx.receiver) {
      fullTx.nickname = contact.nickname;
    }
  });
  const { error, tx, state } = await eventsService.sendTx({ fullTx, accountIndex: currentAccountIndex });
  if (error) {
    console.log(error); // eslint-disable-line no-console
    throw createError('Error sending transaction!', () => {
      dispatch(sendTransaction({ receiver, amount, fee, note }));
    });
  } else {
    return { txId: tx.id, state };
  }
};
