// web3Slice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import coin100ContractAbi from '../../data/coin100-contract-abi.json';
import coin100PublicSaleContractAbi from '../../data/coin100-public-sale-contract-abi.json';

// Constants: Replace with your actual deployed contract addresses
const tokenAddress = '0x6402778921629ffbfeb3b683a4da099f74a2d4c5'; // COIN100 Token Contract Address
const publicSaleAddress = '0xc79d86e03eda12720ba2f640d908ff9525227dd6'; // C100PublicSale Contract Address

// Ethereum Provider Interface
interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(eventName: string, callback: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// Data Interfaces
interface ICOData {
  polRate: string;
  startTime: number;
  endTime: number;
  finalized: boolean;
  paused: boolean;
  c100Balance: string;
  c100TokenAddress: string;
  governorContract: string;
  treasury: string;
}

interface COIN100Data {
  totalSupply: string;
  lastRebaseTimestamp: number;
  rebaseFrequency: number;
  transfersWithFee: boolean;
  transferFeeBasisPoints: number;
  governorContract: string;
  treasury: string;
  lpRewardPercentage: number;
  maxLpRewardPercentage: number;
}

interface Web3State {
  walletAddress: string | null;
  tokenBalance: string | null;
  loading: boolean;
  error: string | null;
  connectedAt: number | null;
  chainId: string | null;
  icoData: ICOData | null;
  coin100Data: COIN100Data | null;
  lastRebase: number | null;
}

// Initial State
const initialState: Web3State = {
  walletAddress: null,
  tokenBalance: null,
  loading: false,
  error: null,
  connectedAt: null,
  chainId: null,
  icoData: null,
  coin100Data: null,
  lastRebase: null,
};

// ABIs
const tokenABI: AbiItem[] = coin100ContractAbi as AbiItem[];
const publicSaleABI: AbiItem[] = coin100PublicSaleContractAbi as AbiItem[];

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

// Thunks

/**
 * Switch to Polygon Network
 */
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

/**
 * Connect Wallet
 */
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

/**
 * Connect and Fetch Balance
 */
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

/**
 * Fetch Token Balance
 */
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
      error instanceof Error ? error.message : 'Failed to fetch token balance';
    return rejectWithValue(msg);
  }
});

/**
 * Buy Tokens with POL
 */
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
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }
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

/**
 * Fetch ICO Data
 */
export const fetchICOData = createAsyncThunk<
  ICOData,
  void,
  { rejectValue: string }
>('web3/fetchICOData', async (_, { rejectWithValue }) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(publicSaleABI, publicSaleAddress);

    // Fetch data from the sale contract
    const polRate = (await contract.methods
      .polRate()
      .call()) as unknown as number;
    const startTime = await contract.methods.startTime().call();
    const endTime = await contract.methods.endTime().call();
    const finalized = await contract.methods.finalized().call();
    const paused = await contract.methods.paused().call();

    // Fetch c100 token address and balance
    const c100TokenAddress: string = await contract.methods.c100Token().call();

    // Validate c100TokenAddress
    if (
      !c100TokenAddress ||
      c100TokenAddress === '0x0000000000000000000000000000000000000000'
    ) {
      throw new Error('Invalid C100 Token Address');
    }

    // Create token contract instance and get its balance
    const tokenContract = new web3.eth.Contract(tokenABI, c100TokenAddress);
    const c100BalanceRaw: string = await tokenContract.methods
      .balanceOf(publicSaleAddress)
      .call();
    const c100Balance = web3.utils.fromWei(c100BalanceRaw, 'ether');

    // Fetch additional contract data
    const governorContract: string = await contract.methods
      .govContract()
      .call();
    const treasury: string = await contract.methods.treasury().call();

    return {
      polRate: polRate.toString() || '0',
      startTime: Number(startTime),
      endTime: Number(endTime),
      finalized: Boolean(finalized),
      paused: Boolean(paused),
      c100Balance,
      c100TokenAddress,
      governorContract,
      treasury,
    };
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Failed to fetch ICO data';
    return rejectWithValue(msg);
  }
});

/**
 * Fetch COIN100 Data
 */
export const fetchCOIN100Data = createAsyncThunk<
  COIN100Data,
  void,
  { rejectValue: string }
>('web3/fetchCOIN100Data', async (_, { rejectWithValue }) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(tokenABI, tokenAddress);

    const totalSupplyRaw: string = await contract.methods.totalSupply().call();
    const lastRebaseTimestamp = await contract.methods.lastRebase().call();
    const rebaseFrequency = await contract.methods.rebaseFrequency().call();
    const transfersWithFee = await contract.methods.transfersWithFee().call();
    const transferFeeBasisPoints = await contract.methods
      .transferFeeBasisPoints()
      .call();
    const governorContract: string = await contract.methods
      .govContract()
      .call();
    const treasury: string = await contract.methods.treasury().call();
    const lpRewardPercentage = await contract.methods
      .lpRewardPercentage()
      .call();
    const maxLpRewardPercentage = await contract.methods
      .maxLpRewardPercentage()
      .call();

    const totalSupply = web3.utils.fromWei(totalSupplyRaw, 'ether');

    return {
      totalSupply,
      lastRebaseTimestamp: Number(lastRebaseTimestamp),
      rebaseFrequency: Number(rebaseFrequency),
      transfersWithFee: Boolean(transfersWithFee),
      transferFeeBasisPoints: Number(transferFeeBasisPoints),
      governorContract,
      treasury,
      lpRewardPercentage: Number(lpRewardPercentage),
      maxLpRewardPercentage: Number(maxLpRewardPercentage),
    };
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Failed to fetch COIN100 data';
    return rejectWithValue(msg);
  }
});

/**
 * Fetch All Data
 * This thunk fetches all relevant data sequentially.
 * It's optional and can be used to initialize the state after connecting the wallet.
 */
export const fetchAllData = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('web3/fetchAllData', async (_, { dispatch, rejectWithValue }) => {
  try {
    await dispatch(fetchICOData()).unwrap();
    await dispatch(fetchCOIN100Data()).unwrap();
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : 'Failed to fetch all data';
    return rejectWithValue(msg);
  }
});

// Slice
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
      state.icoData = null;
      state.coin100Data = null;
      state.lastRebase = null;
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

    // Fetch COIN100 Data
    builder.addCase(fetchCOIN100Data.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchCOIN100Data.fulfilled,
      (state, action: PayloadAction<COIN100Data>) => {
        state.loading = false;
        state.coin100Data = action.payload;
        state.lastRebase = action.payload.lastRebaseTimestamp; // Update lastRebase
      }
    );
    builder.addCase(fetchCOIN100Data.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to fetch COIN100 data';
    });

    // Fetch All Data
    builder.addCase(fetchAllData.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllData.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(fetchAllData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to fetch all data';
    });
  },
});

export const { disconnectWallet } = web3Slice.actions;

export default web3Slice.reducer;
