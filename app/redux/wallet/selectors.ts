import { WalletType } from '../../../shared/types';
import { RootState } from '../../types';

// eslint-disable-next-line import/prefer-default-export
export const isWalletOnly = (state: RootState) => state.wallet.meta.mode[0] === WalletType.REMOTE_API;
