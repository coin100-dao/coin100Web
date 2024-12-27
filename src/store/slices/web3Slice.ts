// web3Slice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import {
  fetchContractABI,
  fetchContractAddresses,
} from '../../services/github';

// Initialize contract data
let tokenAddress: string = '';
let publicSaleAddress: string = '';
let coin100ContractAbi: AbiItem[] = [];
let coin100PublicSaleContractAbi: AbiItem[] = [];

// Function to initialize contract data
export const initializeContractData = createAsyncThunk<
  { tokenAddress: string; publicSaleAddress: string },
  void,
  { rejectValue: string }
>('web3/initializeContractData', async (_, { rejectWithValue }) => {
  try {
    // Fetch contract addresses
    const addresses = await fetchContractAddresses();
    tokenAddress = addresses.c100TokenAddress;
    publicSaleAddress = addresses.publicSaleAddress;

    // Fetch contract ABIs
    const [c100Abi, publicSaleAbi] = await Promise.all([
      fetchContractABI('c100'),
      fetchContractABI('public-sale'),
    ]);

    coin100ContractAbi = c100Abi;
    coin100PublicSaleContractAbi = publicSaleAbi;

    return { tokenAddress, publicSaleAddress };
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : 'Failed to initialize contract data'
    );
  }
});

// Helper function to validate contract address
const validateContractAddress = (
  address: string | undefined,
  name: string
): string => {
  if (!address) {
    throw new Error(
      `${name} not configured. Please check your environment variables.`
    );
  }
  return address;
};

// Ethereum Provider Interface
interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(eventName: string, callback: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    ethereum: EthereumProvider;
  }
}

// Data Interfaces
interface ICOData {
  polRate: string; // Changed to string to ensure serializability
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
  walletAddress: string;
  balance: string;
  icoStartTime: number;
  icoEndTime: number;
  polRate: string;
  isFinalized: boolean;
  totalSold: string;
  remainingTokens: string;
  treasury: string;
  isIcoActive: boolean;
  loading: boolean;
  error: string | null;
  totalSupply: string;
  lastRebaseTimestamp: number;
  rebaseFrequency: number;
  transfersWithFee: boolean;
  transferFeeBasisPoints: number;
  governorContract: string;
  lpRewardPercentage: number;
  maxLpRewardPercentage: number;
  isInitialized: boolean;
}

// Initial State
const initialState: Web3State = {
  walletAddress: '',
  balance: '0',
  icoStartTime: 0,
  icoEndTime: 0,
  polRate: '0',
  isFinalized: false,
  totalSold: '0',
  remainingTokens: '0',
  treasury: '',
  isIcoActive: false,
  loading: false,
  error: null,
  totalSupply: '0',
  lastRebaseTimestamp: 0,
  rebaseFrequency: 0,
  transfersWithFee: false,
  transferFeeBasisPoints: 0,
  governorContract: '',
  lpRewardPercentage: 0,
  maxLpRewardPercentage: 0,
  isInitialized: false,
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
    const contract = new web3.eth.Contract(
      tokenABI,
      validateContractAddress(tokenAddress, 'COIN100 Token Contract Address')
    );

    // Explicitly assert the return type as string
    const balance: string = (await contract.methods
      .balanceOf(walletAddress)
      .call()) as string;

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
    const contract = new web3.eth.Contract(
      publicSaleABI,
      validateContractAddress(
        publicSaleAddress,
        'C100PublicSale Contract Address'
      )
    );
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
    const contract = new web3.eth.Contract(
      publicSaleABI,
      validateContractAddress(
        publicSaleAddress,
        'C100PublicSale Contract Address'
      )
    );

    // Fetch data from the sale contract
    // Explicitly assert the return types
    const polRateRaw = (await contract.methods.polRate().call()) as string;
    const polRate = polRateRaw || '0';

    const startTimeRaw = (await contract.methods.startTime().call()) as string;
    const startTime = parseInt(startTimeRaw) || 0;

    const endTimeRaw = (await contract.methods.endTime().call()) as string;
    const endTime = parseInt(endTimeRaw) || 0;

    const finalizedRaw = (await contract.methods.finalized().call()) as boolean;
    const finalized = finalizedRaw;

    const pausedRaw = (await contract.methods.paused().call()) as boolean;
    const paused = pausedRaw;

    // Fetch c100 token address and balance
    const c100TokenAddress: string = (await contract.methods
      .c100Token()
      .call()) as string;

    // Validate c100TokenAddress
    if (
      !c100TokenAddress ||
      c100TokenAddress === '0x0000000000000000000000000000000000000000'
    ) {
      throw new Error('Invalid C100 Token Address');
    }

    // Create token contract instance and get its balance
    const tokenContract = new web3.eth.Contract(tokenABI, c100TokenAddress);
    const c100BalanceRaw: string = (await tokenContract.methods
      .balanceOf(
        validateContractAddress(
          publicSaleAddress,
          'C100PublicSale Contract Address'
        )
      )
      .call()) as string;
    const c100Balance = web3.utils.fromWei(c100BalanceRaw, 'ether');

    // Fetch additional contract data
    const governorContract: string = (await contract.methods
      .govContract()
      .call()) as string;
    const treasury: string = (await contract.methods
      .treasury()
      .call()) as string;

    return {
      polRate,
      startTime,
      endTime,
      finalized,
      paused,
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
    const contract = new web3.eth.Contract(
      tokenABI,
      validateContractAddress(tokenAddress, 'COIN100 Token Contract Address')
    );

    // Explicitly assert the return types
    const totalSupplyRaw: string = (await contract.methods
      .totalSupply()
      .call()) as string;
    const totalSupply = web3.utils.fromWei(totalSupplyRaw, 'ether');

    const lastRebaseTimestampRaw = (await contract.methods
      .lastRebase()
      .call()) as string;
    const lastRebaseTimestamp = Number(lastRebaseTimestampRaw) || 0;

    const rebaseFrequencyRaw = (await contract.methods
      .rebaseFrequency()
      .call()) as string;
    const rebaseFrequency = Number(rebaseFrequencyRaw) || 0;

    const transfersWithFeeRaw = (await contract.methods
      .transfersWithFee()
      .call()) as boolean;
    const transfersWithFee = transfersWithFeeRaw;

    const transferFeeBasisPointsRaw = (await contract.methods
      .transferFeeBasisPoints()
      .call()) as string;
    const transferFeeBasisPoints = Number(transferFeeBasisPointsRaw) || 0;

    const governorContract: string = (await contract.methods
      .govContract()
      .call()) as string;
    const treasury: string = (await contract.methods
      .treasury()
      .call()) as string;

    const lpRewardPercentageRaw = (await contract.methods
      .lpRewardPercentage()
      .call()) as string;
    const lpRewardPercentage = Number(lpRewardPercentageRaw) || 0;

    const maxLpRewardPercentageRaw = (await contract.methods
      .maxLpRewardPercentage()
      .call()) as string;
    const maxLpRewardPercentage = Number(maxLpRewardPercentageRaw) || 0;

    return {
      totalSupply,
      lastRebaseTimestamp,
      rebaseFrequency,
      transfersWithFee,
      transferFeeBasisPoints,
      governorContract,
      treasury,
      lpRewardPercentage,
      maxLpRewardPercentage,
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
  {
    icoStartTime: number;
    icoEndTime: number;
    polRate: string;
    isFinalized: boolean;
    treasury: string;
    totalSold: string;
    remainingTokens: string;
    isIcoActive: boolean;
  },
  void,
  { rejectValue: string }
>('web3/fetchAllData', async (_, { rejectWithValue }) => {
  try {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask');
    }
    const web3 = new Web3(window.ethereum);
    const contract = await getPublicSaleContract();
    const c100Contract = await getC100Contract();

    // Fetch each piece of data separately to ensure correct typing
    const startTimeRaw = (await contract.methods.startTime().call()) as string;
    const startTime = parseInt(startTimeRaw) || 0;

    const endTimeRaw = (await contract.methods.endTime().call()) as string;
    const endTime = parseInt(endTimeRaw) || 0;

    const polRateRaw = (await contract.methods.polRate().call()) as string;
    const polRate = polRateRaw || '0';

    const finalizedRaw = (await contract.methods.finalized().call()) as boolean;
    const finalized = finalizedRaw;

    const treasuryRaw = (await contract.methods.treasury().call()) as string;
    const treasury = treasuryRaw || '0';

    const contractBalanceRaw = (await c100Contract.methods
      .balanceOf(
        validateContractAddress(
          publicSaleAddress,
          'C100PublicSale Contract Address'
        )
      )
      .call()) as string;
    const remainingTokensEther = web3.utils.fromWei(
      contractBalanceRaw,
      'ether'
    );

    const totalSupplyRaw: string = (await c100Contract.methods
      .totalSupply()
      .call()) as string;
    const totalSupply = totalSupplyRaw || '0';

    const now = Math.floor(Date.now() / 1000);

    // Convert Wei values to Ether where needed
    const totalSoldEther = (
      BigInt(totalSupply) - BigInt(contractBalanceRaw)
    ).toString();
    const totalSoldInEther = web3.utils.fromWei(totalSoldEther, 'ether');

    return {
      icoStartTime: startTime,
      icoEndTime: endTime,
      polRate,
      isFinalized: finalized,
      treasury,
      totalSold: totalSoldInEther,
      remainingTokens: remainingTokensEther,
      isIcoActive: now >= startTime && now <= endTime && !finalized,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    const msg =
      error instanceof Error ? error.message : 'Failed to fetch all data';
    return rejectWithValue(msg);
  }
});

// Helper functions to get contract instances
async function getPublicSaleContract() {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask');
  }
  const web3 = new Web3(window.ethereum);
  return new web3.eth.Contract(
    publicSaleABI as AbiItem[],
    validateContractAddress(
      publicSaleAddress,
      'C100PublicSale Contract Address'
    )
  );
}

async function getC100Contract() {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask');
  }
  const web3 = new Web3(window.ethereum);
  return new web3.eth.Contract(
    tokenABI as AbiItem[],
    validateContractAddress(tokenAddress, 'COIN100 Token Contract Address')
  );
}

// Slice
const web3Slice = createSlice({
  name: 'web3',
  initialState,
  reducers: {
    disconnectWallet(state) {
      state.walletAddress = '';
      state.balance = '0';
      state.icoStartTime = 0;
      state.icoEndTime = 0;
      state.polRate = '0';
      state.isFinalized = false;
      state.totalSold = '0';
      state.remainingTokens = '0';
      state.treasury = '';
      state.isIcoActive = false;
      state.error = null;
      state.loading = false;
      state.totalSupply = '0';
      state.lastRebaseTimestamp = 0;
      state.rebaseFrequency = 0;
      state.transfersWithFee = false;
      state.transferFeeBasisPoints = 0;
      state.governorContract = '';
      state.lpRewardPercentage = 0;
      state.maxLpRewardPercentage = 0;
      state.isInitialized = false;
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
      state.balance = action.payload;
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
        state.icoStartTime = action.payload.startTime;
        state.icoEndTime = action.payload.endTime;
        state.polRate = action.payload.polRate;
        state.isFinalized = action.payload.finalized;
        state.treasury = action.payload.treasury;
        // You can add more fields from ICOData if needed
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
        state.totalSupply = action.payload.totalSupply;
        state.lastRebaseTimestamp = action.payload.lastRebaseTimestamp;
        state.rebaseFrequency = action.payload.rebaseFrequency;
        state.transfersWithFee = action.payload.transfersWithFee;
        state.transferFeeBasisPoints = action.payload.transferFeeBasisPoints;
        state.governorContract = action.payload.governorContract;
        state.treasury = action.payload.treasury;
        state.lpRewardPercentage = action.payload.lpRewardPercentage;
        state.maxLpRewardPercentage = action.payload.maxLpRewardPercentage;
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
    builder.addCase(fetchAllData.fulfilled, (state, action) => {
      state.loading = false;
      state.icoStartTime = action.payload.icoStartTime;
      state.icoEndTime = action.payload.icoEndTime;
      state.polRate = action.payload.polRate;
      state.isFinalized = action.payload.isFinalized;
      state.treasury = action.payload.treasury;
      state.totalSold = action.payload.totalSold;
      state.remainingTokens = action.payload.remainingTokens;
      state.isIcoActive = action.payload.isIcoActive;
    });
    builder.addCase(fetchAllData.rejected, (state, action) => {
      state.loading = false;
      state.error =
        typeof action.payload === 'string'
          ? action.payload
          : 'Failed to fetch all data';
    });

    // Initialize contract data
    builder.addCase(initializeContractData.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(initializeContractData.fulfilled, (state) => {
      state.loading = false;
      state.isInitialized = true;
    });
    builder.addCase(initializeContractData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'Failed to initialize contract data';
    });
  },
});

export const { disconnectWallet } = web3Slice.actions;

export default web3Slice.reducer;
