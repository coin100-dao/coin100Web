import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
>('publicSale/initializeContractData', async (_, { rejectWithValue }) => {
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

// Types
interface PublicSaleState {
  loading: boolean;
  error: string | null;
  startTime: number;
  endTime: number;
  isFinalized: boolean;
  totalSold: string;
  remainingTokens: string;
  isSaleActive: boolean;
  isInitialized: boolean;
  isPaused: boolean;
  treasuryAddress: string;
}

// Helper functions
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

const getWeb3Instance = (): Web3 => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  return new Web3(window.ethereum);
};

// Calculate C100 amount from USDC amount
export const calculateC100Amount = (usdcAmount: string): string => {
  // Convert the USDC amount to the equivalent C100 amount (1 USDC = 1000 C100)
  const c100Amount = (Number(usdcAmount) * 1000).toString();
  return c100Amount;
};

// Initial state
const initialState: PublicSaleState = {
  loading: false,
  error: null,
  startTime: 0,
  endTime: 0,
  isFinalized: false,
  totalSold: '0',
  remainingTokens: '0',
  isSaleActive: false,
  isInitialized: false,
  isPaused: false,
  treasuryAddress: '',
};

// Thunks
export const fetchPublicSaleData = createAsyncThunk(
  'publicSale/fetchData',
  async () => {
    const web3 = getWeb3Instance();
    const contract = new web3.eth.Contract(
      coin100PublicSaleContractAbi as AbiItem[],
      validateContractAddress(publicSaleAddress, 'Public Sale Contract')
    );
    const tokenContract = new web3.eth.Contract(
      coin100ContractAbi as AbiItem[],
      validateContractAddress(tokenAddress, 'Token Contract')
    );

    const [
      startTime,
      endTime,
      finalized,
      contractBalance,
      totalSupply,
      treasury,
      isPaused,
    ] = await Promise.all([
      contract.methods.startTime().call() as Promise<string>,
      contract.methods.endTime().call() as Promise<string>,
      contract.methods.finalized().call() as Promise<boolean>,
      tokenContract.methods
        .balanceOf(publicSaleAddress)
        .call() as Promise<string>,
      tokenContract.methods.totalSupply().call() as Promise<string>,
      contract.methods.treasury().call() as Promise<string>,
      contract.methods.paused().call() as Promise<boolean>,
    ]);

    const now = Math.floor(Date.now() / 1000);
    const remainingTokens = web3.utils.fromWei(contractBalance, 'ether');
    const totalSoldBigInt = BigInt(totalSupply) - BigInt(contractBalance);
    const totalSold = web3.utils.fromWei(totalSoldBigInt.toString(), 'ether');

    return {
      startTime: Number(startTime),
      endTime: Number(endTime),
      isFinalized: finalized,
      remainingTokens,
      totalSold,
      isSaleActive:
        now >= Number(startTime) &&
        now <= Number(endTime) &&
        !finalized &&
        !isPaused,
      treasuryAddress: treasury,
      isPaused,
    };
  }
);

export const buyTokensWithUSDC = createAsyncThunk(
  'publicSale/buyWithUSDC',
  async (usdcAmount: string, { dispatch }) => {
    const web3 = getWeb3Instance();
    const accounts = await web3.eth.getAccounts();

    if (accounts.length === 0) {
      throw new Error('No accounts connected');
    }

    const contract = new web3.eth.Contract(
      coin100PublicSaleContractAbi as AbiItem[],
      validateContractAddress(publicSaleAddress, 'Public Sale Contract')
    );

    // Convert USDC amount to wei (USDC has 6 decimals)
    const usdcAmountWei = web3.utils.toWei(usdcAmount, 'mwei');

    // First approve USDC spending
    const usdcContract = new web3.eth.Contract(
      [
        {
          constant: false,
          inputs: [
            { name: '_spender', type: 'address' },
            { name: '_value', type: 'uint256' },
          ],
          name: 'approve',
          outputs: [{ name: '', type: 'bool' }],
          payable: false,
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      process.env.REACT_APP_USDC_ADDRESS
    );

    await usdcContract.methods
      .approve(publicSaleAddress, usdcAmountWei)
      .send({ from: accounts[0] });

    // Then buy tokens
    await contract.methods.buyTokens(usdcAmountWei).send({ from: accounts[0] });

    // Refresh sale data after purchase
    await dispatch(fetchPublicSaleData());
  }
);

const publicSaleSlice = createSlice({
  name: 'publicSale',
  initialState,
  reducers: {
    resetPublicSaleState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Initialize Contract Data
      .addCase(initializeContractData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeContractData.fulfilled, (state) => {
        state.loading = false;
        state.isInitialized = true;
      })
      .addCase(initializeContractData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to initialize contract data';
      })

      // Fetch Public Sale Data
      .addCase(fetchPublicSaleData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicSaleData.fulfilled, (state, action) => {
        state.loading = false;
        state.startTime = action.payload.startTime;
        state.endTime = action.payload.endTime;
        state.isFinalized = action.payload.isFinalized;
        state.totalSold = action.payload.totalSold;
        state.remainingTokens = action.payload.remainingTokens;
        state.isSaleActive = action.payload.isSaleActive;
        state.treasuryAddress = action.payload.treasuryAddress;
        state.isPaused = action.payload.isPaused;
      })
      .addCase(fetchPublicSaleData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sale data';
      })

      // Buy Tokens
      .addCase(buyTokensWithUSDC.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyTokensWithUSDC.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(buyTokensWithUSDC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to buy tokens';
      });
  },
});

export const { resetPublicSaleState } = publicSaleSlice.actions;
export default publicSaleSlice.reducer;
