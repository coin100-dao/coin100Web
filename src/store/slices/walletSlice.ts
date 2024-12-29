import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { executeContractCall } from '../../utils/web3Utils';

// Constants
export const POLYGON_CHAIN_ID = '0x89'; // Polygon Mainnet Chain ID
export const POLYGON_CHAIN_NAME = 'Polygon Mainnet';
export const POLYGON_RPC_URL = 'https://polygon-rpc.com';
export const POLYGON_BLOCK_EXPLORER = 'https://polygonscan.com';

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

// Helper function to validate Ethereum provider
const validateEthereumProvider = (): MetaMaskInpageProvider => {
  if (!window.ethereum) {
    throw new Error('No Ethereum provider found. Please install MetaMask.');
  }
  return window.ethereum;
};

interface SwitchChainError extends Error {
  code: number;
}

// Switch to Polygon network
export const switchToPolygonNetwork = createAsyncThunk(
  'wallet/switchNetwork',
  async () => {
    try {
      const ethereum = validateEthereumProvider();

      try {
        // Try switching to Polygon network
        await executeContractCall(async () => {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: POLYGON_CHAIN_ID }],
          });
        });
      } catch (error) {
        // If the error code is 4902, the chain hasn't been added to MetaMask
        const switchError = error as SwitchChainError;
        if (switchError.code === 4902) {
          await executeContractCall(async () => {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: POLYGON_CHAIN_ID,
                  chainName: POLYGON_CHAIN_NAME,
                  nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18,
                  },
                  rpcUrls: [POLYGON_RPC_URL],
                  blockExplorerUrls: [POLYGON_BLOCK_EXPLORER],
                },
              ],
            });
          });
        } else {
          throw switchError;
        }
      }

      return { chainId: POLYGON_CHAIN_ID };
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  }
);

// Connect wallet function
export const connectWallet = createAsyncThunk(
  'wallet/connect',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log('Connecting wallet...');
      const ethereum = validateEthereumProvider();

      const accountsResult = await executeContractCall(async () => {
        const result = await ethereum.request({
          method: 'eth_requestAccounts',
        });
        return result;
      });

      if (!Array.isArray(accountsResult) || accountsResult.length === 0) {
        throw new Error('No accounts found');
      }

      const accounts = accountsResult as string[];
      const walletAddress = accounts[0];
      console.log('Connected account:', walletAddress);

      const chainIdResult = await executeContractCall(async () => {
        const result = await ethereum.request({
          method: 'eth_chainId',
        });
        return result;
      });
      const chainId = chainIdResult as string;
      console.log('Current chainId:', chainId);

      if (chainId !== POLYGON_CHAIN_ID) {
        console.log('Wrong network, switching to Polygon...');
        await dispatch(switchToPolygonNetwork()).unwrap();
      }

      return { address: walletAddress, chainId: POLYGON_CHAIN_ID };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to connect wallet'
      );
    }
  }
);

// Wallet slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    resetWalletState: () => initialState,
    disconnectWallet: () => initialState,
    updateWalletState: (state, action) => {
      state.address = action.payload.address;
      state.chainId = action.payload.chainId;
      state.isConnected = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Connect Wallet
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.address = action.payload.address;
        state.chainId = action.payload.chainId;
        state.isConnected = true;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload as string;
      })

      // Switch Network
      .addCase(switchToPolygonNetwork.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(switchToPolygonNetwork.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.chainId = action.payload.chainId;
      })
      .addCase(switchToPolygonNetwork.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.error.message || 'Failed to switch network';
      });
  },
});

export const { resetWalletState, disconnectWallet, updateWalletState } =
  walletSlice.actions;
export default walletSlice.reducer;
