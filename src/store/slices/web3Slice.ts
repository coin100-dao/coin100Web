// src/store/slices/web3Slice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import coin100ContractAbi from '../coin100-contract-abi.json';

// Define the EthereumProvider interface based on EIP-1193
interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(eventName: string, callback: (...args: unknown[]) => void): void;
}

// Extend the global Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// Define the Web3 state interface
interface Web3State {
  walletAddress: string | null;
  tokenBalance: string | null;
  loading: boolean;
  error: string | null;
  connectedAt: number | null;
  chainId: string | null;
}

const initialState: Web3State = {
  walletAddress: null,
  tokenBalance: null,
  loading: false,
  error: null,
  connectedAt: null,
  chainId: null,
};

// the ABI and token address
const tokenABI: AbiItem[] = coin100ContractAbi as AbiItem[];
const tokenAddress = '0xdbe819ddf0d14a54ffe611c6d070b32a7f9d23d1'; // Replace with the actual token contract address

// the ITokenContract type
type ITokenContract = Contract<typeof tokenABI>;

// a custom error type for MetaMask errors
interface MetaMaskError extends Error {
  code: number;
}

// Type guard to check if an error is a MetaMaskError
function isMetaMaskError(error: unknown): error is MetaMaskError {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const err = error as { code?: unknown; message?: unknown };

  return typeof err.code === 'number' && typeof err.message === 'string';
}

// Async thunk to switch to Polygon network
export const switchToPolygonNetwork = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('web3/switchToPolygonNetwork', async (_, { rejectWithValue }) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const chainId = '0x89'; // 137 in hex

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (error) {
    // If the chain hasn't been added to MetaMask, prompt the user to add it
    if (isMetaMaskError(error) && error.code === 4902) {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }
      try {
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
      } catch (addError) {
        if (addError instanceof Error) {
          return rejectWithValue(
            addError.message || 'Failed to add Polygon network'
          );
        } else {
          return rejectWithValue('Failed to add Polygon network');
        }
      }
    } else if (error instanceof Error) {
      return rejectWithValue(
        error.message || 'Failed to switch to Polygon network'
      );
    } else {
      return rejectWithValue('Failed to switch to Polygon network');
    }
  }
});

// Async thunk to connect to MetaMask and fetch token balance
export const connectAndFetchBalance = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>('web3/connectAndFetchBalance', async (_, { dispatch, rejectWithValue }) => {
  try {
    await dispatch(switchToPolygonNetwork()).unwrap();
    const walletAddress = await dispatch(connectWallet()).unwrap();
    await dispatch(fetchTokenBalance({ walletAddress })).unwrap();
    return walletAddress;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(
        error.message || 'Failed to connect and fetch balance'
      );
    } else {
      return rejectWithValue('Failed to connect and fetch balance');
    }
  }
});

// Async thunk to connect to MetaMask
export const connectWallet = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>('web3/connectWallet', async (_, { dispatch, rejectWithValue }) => {
  try {
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

    const chainIdResult = await window.ethereum.request({
      method: 'eth_chainId',
    });
    const chainId = chainIdResult as string;

    if (chainId !== '0x89') {
      await dispatch(switchToPolygonNetwork()).unwrap();
    }

    return accounts[0];
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message || 'Failed to connect wallet');
    } else {
      return rejectWithValue('Failed to connect wallet');
    }
  }
});

// Async thunk to fetch token balance
export const fetchTokenBalance = createAsyncThunk<
  string,
  { walletAddress: string },
  { rejectValue: string }
>('web3/fetchTokenBalance', async ({ walletAddress }, { rejectWithValue }) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const web3 = new Web3(window.ethereum);

    const contract: ITokenContract = new web3.eth.Contract(
      tokenABI,
      tokenAddress
    ) as ITokenContract;

    const balance: string = await contract.methods
      .balanceOf(walletAddress)
      .call();

    return web3.utils.fromWei(balance, 'ether');
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message || 'Failed to fetch token balance');
    } else {
      return rejectWithValue('Failed to fetch token balance');
    }
  }
});

// Create the web3 slice
const web3Slice = createSlice({
  name: 'web3',
  initialState,
  reducers: {
    disconnectWallet(state) {
      state.walletAddress = null;
      state.tokenBalance = null;
      state.error = null;
      state.connectedAt = null;
      state.chainId = null;
    },
  },
  extraReducers: (builder) => {
    // Handle connectWallet
    builder.addCase(connectWallet.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      connectWallet.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.walletAddress = action.payload;
        state.connectedAt = Date.now();
      }
    );
    builder.addCase(connectWallet.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to connect wallet';
    });

    // Handle fetchTokenBalance
    builder.addCase(fetchTokenBalance.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchTokenBalance.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.tokenBalance = action.payload;
      }
    );
    builder.addCase(fetchTokenBalance.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to fetch token balance';
    });

    // Handle switchToPolygonNetwork
    builder.addCase(switchToPolygonNetwork.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(switchToPolygonNetwork.fulfilled, (state) => {
      state.loading = false;
      state.chainId = '0x89';
    });
    builder.addCase(switchToPolygonNetwork.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to switch to Polygon network';
    });
  },
});

// Export actions and reducer
export const { disconnectWallet } = web3Slice.actions;
export default web3Slice.reducer;
