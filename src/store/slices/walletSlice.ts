import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Web3 from 'web3';

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      on: (event: string, callback: (params?: unknown) => void) => void;
      removeListener: (
        event: string,
        callback: (params?: unknown) => void
      ) => void;
      selectedAddress?: string;
      chainId?: string;
      isMetaMask?: boolean;
    };
  }
}

// Constants
const POLYGON_RPC = 'https://polygon-rpc.com';

// Types
interface WalletState {
  address: string;
  chainId: string;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

// Initial state
const initialState: WalletState = {
  address: '',
  chainId: '',
  isConnected: false,
  isConnecting: false,
  error: null,
};

// Type Guard for MetaMask Errors
interface MetaMaskError extends Error {
  code: number;
}

function isMetaMaskError(error: unknown): error is MetaMaskError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'number'
  );
}

// Helper function to get Web3 instance
export const getWeb3Instance = (): Web3 => {
  if (!window.ethereum) {
    console.log('Using public RPC for read operations');
    return new Web3(POLYGON_RPC);
  }
  console.log('Using wallet provider for transactions');
  return new Web3(window.ethereum);
};

/**
 * Switch to Polygon Network
 */
export const switchToPolygonNetwork = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('wallet/switchToPolygonNetwork', async (_, { rejectWithValue }) => {
  try {
    console.log('Switching to Polygon network...');
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const chainId = '0x89'; // Polygon Mainnet
    console.log('Target chainId:', chainId);

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
    console.log('Successfully switched to Polygon network');
  } catch (error) {
    console.log('Error switching network:', error);
    // If the chain isn't added, attempt to add it
    if (isMetaMaskError(error) && error.code === 4902) {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }
      try {
        console.log('Adding Polygon network...');
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x89',
              chainName: 'Polygon Mainnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              rpcUrls: ['https://polygon-rpc.com/'],
              blockExplorerUrls: ['https://polygonscan.com/'],
            },
          ],
        });
        console.log('Successfully added Polygon network');
      } catch (addError) {
        console.error('Error adding Polygon network:', addError);
        const msg =
          addError instanceof Error
            ? addError.message
            : 'Failed to add Polygon network';
        return rejectWithValue(msg);
      }
    } else if (error instanceof Error) {
      return rejectWithValue(error.message || 'Failed to switch to Polygon');
    } else {
      return rejectWithValue('Failed to switch to Polygon network');
    }
  }
});

/**
 * Connect Wallet
 */
export const connectWallet = createAsyncThunk<
  { address: string; chainId: string },
  void,
  { rejectValue: string }
>('wallet/connect', async (_, { dispatch, rejectWithValue }) => {
  try {
    console.log('Connecting wallet...');
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const accountsResult = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!Array.isArray(accountsResult) || accountsResult.length === 0) {
      throw new Error('No accounts found');
    }

    const accounts = accountsResult as string[];
    console.log('Connected account:', accounts[0]);

    const chainIdResult = await window.ethereum.request({
      method: 'eth_chainId',
    });
    const chainId = chainIdResult as string;
    console.log('Current chainId:', chainId);

    if (chainId !== '0x89') {
      console.log('Wrong network, switching to Polygon...');
      await dispatch(switchToPolygonNetwork()).unwrap();
    }

    return { address: accounts[0], chainId: '0x89' };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    const msg =
      error instanceof Error ? error.message : 'Failed to connect wallet';
    return rejectWithValue(msg);
  }
});

// Wallet Slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    disconnectWallet: (state) => {
      state.address = '';
      state.chainId = '';
      state.isConnected = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.address = action.payload.address;
        state.chainId = action.payload.chainId;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.isConnected = false;
        state.error = action.payload ?? 'Failed to connect wallet';
      })
      .addCase(switchToPolygonNetwork.pending, (state) => {
        state.error = null;
      })
      .addCase(switchToPolygonNetwork.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to switch network';
      });
  },
});

export const { disconnectWallet } = walletSlice.actions;
export default walletSlice.reducer;
