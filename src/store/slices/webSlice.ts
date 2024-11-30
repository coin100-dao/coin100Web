// src/store/slices/web3Slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Web3 from 'web3';

// Define the Web3 state
interface Web3State {
  walletAddress: string | null;
  tokenBalance: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: Web3State = {
  walletAddress: null,
  tokenBalance: null,
  loading: false,
  error: null,
};

// Define the ABI and token address (replace with your token details)
const tokenABI = [
  // Only the functions you need; for balance, this is sufficient
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
];
const tokenAddress = "YOUR_TOKEN_CONTRACT_ADDRESS"; // Replace with the actual token contract address

// Async thunk to connect to MetaMask
export const connectWallet = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>('web3/connectWallet', async (_, { rejectWithValue }) => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0]; // Return the first connected wallet address
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to connect wallet");
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
      throw new Error("MetaMask is not installed");
    }

    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(tokenABI as any, tokenAddress);
    const balance = await contract.methods.balanceOf(walletAddress).call();

    // Convert balance from Wei to Ether (or the appropriate decimal format for your token)
    return web3.utils.fromWei(balance, "ether");
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch token balance");
  }
});

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
    builder.addCase(connectWallet.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.walletAddress = action.payload;
    });
    builder.addCase(connectWallet.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle fetchTokenBalance
    builder.addCase(fetchTokenBalance.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTokenBalance.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.tokenBalance = action.payload;
    });
    builder.addCase(fetchTokenBalance.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { disconnectWallet } = web3Slice.actions;
export default web3Slice.reducer;
