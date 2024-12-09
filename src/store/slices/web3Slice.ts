import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
// import { Contract } from 'web3-eth-contract';
import coin100ContractAbi from '../../data/coin100-contract-abi.json';
import coin100PublicSaleContractAbi from '../../data/coin100-public-sale-contract-abi.json';
import { RootState } from '../store';

interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(eventName: string, callback: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

interface ICOData {
  polRate: string;
  startTime: number;
  endTime: number;
  finalized: boolean;
  paused: boolean;
  c100Balance: string;
  c100TokenAddress: string;
}

// State interface
interface Web3State {
  walletAddress: string | null;
  tokenBalance: string | null;
  loading: boolean;
  error: string | null;
  connectedAt: number | null;
  chainId: string | null;
  icoData: ICOData | null;
}

// Initial state
const initialState: Web3State = {
  walletAddress: null,
  tokenBalance: null,
  loading: false,
  error: null,
  connectedAt: null,
  chainId: null,
  icoData: null,
};

// Addresses and ABIs
const tokenABI: AbiItem[] = coin100ContractAbi as AbiItem[];
const tokenAddress = '0x6402778921629ffbfeb3b683a4da099f74a2d4c5'; // Example token address
const publicSaleABI: AbiItem[] = coin100PublicSaleContractAbi as AbiItem[];
const publicSaleAddress = '0xc79d86e03eda12720ba2f640d908ff9525227dd6'; // Example sale contract address

// Type guard for MetaMask errors
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

// Thunks
export const switchToPolygonNetwork = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('web3/switchToPolygonNetwork', async (_, { rejectWithValue }) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const chainId = '0x89'; // Polygon Mainnet

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (error) {
    // If the chain isn't added, attempt to add it
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
    const msg =
      error instanceof Error ? error.message : 'Failed to connect wallet';
    return rejectWithValue(msg);
  }
});

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
    const msg =
      error instanceof Error
        ? error.message
        : 'Failed to connect and fetch balance';
    return rejectWithValue(msg);
  }
});

interface FetchTokenBalanceParams {
  walletAddress: string;
}

export const fetchTokenBalance = createAsyncThunk<
  string,
  FetchTokenBalanceParams,
  { rejectValue: string }
>('web3/fetchTokenBalance', async ({ walletAddress }, { rejectWithValue }) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(tokenABI, tokenAddress);

    const balance: string = await contract.methods
      .balanceOf(walletAddress)
      .call();
    return web3.utils.fromWei(balance, 'ether');
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Failed to fetch balance';
    return rejectWithValue(msg);
  }
});

interface BuyTokensWithPOLParams {
  amount: string;
}
export const buyTokensWithPOL = createAsyncThunk<
  void,
  BuyTokensWithPOLParams,
  { rejectValue: string }
>('web3/buyTokensWithPOL', async ({ amount }, { rejectWithValue }) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(publicSaleABI, publicSaleAddress);
    await contract.methods.buyWithPOL().send({
      from: accounts[0],
      value: web3.utils.toWei(amount, 'ether'),
    });
  } catch (error) {
    const msg = isMetaMaskError(error)
      ? error.message
      : 'Failed to buy tokens with POL';
    return rejectWithValue(msg);
  }
});

export const fetchICOData = createAsyncThunk<
  ICOData,
  void,
  { rejectValue: string; state: RootState }
>('web3/fetchICOData', async (_, { rejectWithValue }) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(publicSaleABI, publicSaleAddress);

    // Fetch data from the sale contract
    const polRate = await contract.methods.polRate().call();
    const startTime = await contract.methods.startTime().call();
    const endTime = await contract.methods.endTime().call();
    const finalized = await contract.methods.finalized().call();
    const paused = await contract.methods.paused().call();

    // Fetch c100 token address and balance
    const c100TokenAddress = await contract.methods.c100Token().call();
    // Create token contract instance and get its balance
    const tokenContract = new web3.eth.Contract(
      tokenABI as AbiItem[],
      String(c100TokenAddress),
      {
        from: publicSaleAddress, // Optional: specify the default 'from' address
      }
    );
    const c100Balance = await tokenContract.methods
      .balanceOf(publicSaleAddress)
      .call();

    return {
      polRate: String(polRate || '0'), // Provide a default value if polRate is undefined
      startTime: Number(startTime),
      endTime: Number(endTime),
      finalized: Boolean(finalized), // Explicitly convert to boolean
      paused: Boolean(paused), // Also convert paused to boolean
      c100Balance: String(c100Balance || '0'), // Provide a default value if c100Balance is undefined
      c100TokenAddress: String(c100TokenAddress || ''), // Provide a default empty string if undefined
    };
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Failed to fetch ICO data';
    return rejectWithValue(msg);
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
      state.connectedAt = null;
      state.chainId = null;
    },
  },
  extraReducers: (builder) => {
    // Connect wallet
    builder.addCase(connectWallet.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(connectWallet.fulfilled, (state, action) => {
      state.loading = false;
      state.walletAddress = action.payload;
      state.connectedAt = Date.now();
    });
    builder.addCase(connectWallet.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to connect wallet';
    });

    // Fetch token balance
    builder.addCase(fetchTokenBalance.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTokenBalance.fulfilled, (state, action) => {
      state.loading = false;
      state.tokenBalance = action.payload;
    });
    builder.addCase(fetchTokenBalance.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to fetch token balance';
    });

    // Switch network
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
      state.error = action.payload ?? 'Failed to switch network';
    });

    // Connect and fetch balance
    builder.addCase(connectAndFetchBalance.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(connectAndFetchBalance.fulfilled, (state, action) => {
      state.loading = false;
      state.walletAddress = action.payload;
      state.connectedAt = Date.now();
    });
    builder.addCase(connectAndFetchBalance.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to connect and fetch balance';
    });

    // Buy tokens with POL
    builder.addCase(buyTokensWithPOL.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(buyTokensWithPOL.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(buyTokensWithPOL.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to buy tokens';
    });

    // Fetch ICO Data
    builder.addCase(fetchICOData.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchICOData.fulfilled,
      (state, action: PayloadAction<ICOData>) => {
        state.loading = false;
        state.icoData = action.payload;
      }
    );
    builder.addCase(fetchICOData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to fetch ICO data';
    });
  },
});

export const { disconnectWallet } = web3Slice.actions;

export default web3Slice.reducer;
