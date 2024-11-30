// src/store/slices/web3Slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';

// Define the EthereumProvider interface based on EIP-1193
interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(eventName: string, callback: (...args: unknown[]) => void): void;
  // Add other methods if needed
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
}

// Initial state for the slice
const initialState: Web3State = {
  walletAddress: null,
  tokenBalance: null,
  loading: false,
  error: null,
};

// Define the ABI and token address (replace with your token details)
const tokenABI: AbiItem[] = [
  // Only the functions you need; for balance, this is sufficient
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
];
const tokenAddress = 'YOUR_TOKEN_CONTRACT_ADDRESS'; // Replace with the actual token contract address

// Define the ITokenContract type by extending Contract with custom methods
type ITokenContract = Contract<AbiItem[]> & {
  methods: {
    balanceOf(owner: string): {
      call(): Promise<string>;
    };
    // Add other contract methods if needed
  };
};

// Async thunk to connect to MetaMask
export const connectWallet = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>('web3/connectWallet', async (_, { rejectWithValue }) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!Array.isArray(accounts) || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return accounts[0]; // Return the first connected wallet address
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message || 'Failed to connect wallet');
    }
    return rejectWithValue('Failed to connect wallet');
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

    // Instantiate the contract with the correct typing
    const contract: ITokenContract = new web3.eth.Contract(
      tokenABI,
      tokenAddress
    ) as ITokenContract;

    const balance: string = await contract.methods
      .balanceOf(walletAddress)
      .call();

    // Convert balance from Wei to Ether (or the appropriate decimal format for your token)
    return web3.utils.fromWei(balance, 'ether');
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message || 'Failed to fetch token balance');
    }
    return rejectWithValue('Failed to fetch token balance');
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
  },
});

// Export actions and reducer
export const { disconnectWallet } = web3Slice.actions;
export default web3Slice.reducer;
