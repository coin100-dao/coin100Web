import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import coin100ContractAbi from '../../data/coin100-contract-abi.json';
import coin100PublicSaleContractAbi from '../../data/coin100-public-sale-contract-abi.json';

// Constants
// const POLYGON_CHAIN_ID = '0x89'; // 137 in hex
// const POLYGON_RPC_URL = 'https://polygon-mainnet.infura.io';

// Contract addresses from environment variables
const tokenAddress = import.meta.env.VITE_REACT_C100_CONTRACT_ADDRESS;
const publicSaleAddress = import.meta.env
  .VITE_REACT_PUBLIC_SALE_CONTRACT_ADDRESS;

// Types
interface ICOState {
  loading: boolean;
  error: string | null;
  icoStartTime: number;
  icoEndTime: number;
  polRate: string;
  isFinalized: boolean;
  totalSold: string;
  remainingTokens: string;
  isIcoActive: boolean;
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

// Initial state
const initialState: ICOState = {
  loading: false,
  error: null,
  icoStartTime: 0,
  icoEndTime: 0,
  polRate: '0',
  isFinalized: false,
  totalSold: '0',
  remainingTokens: '0',
  isIcoActive: false,
};

// Thunks
export const fetchICOData = createAsyncThunk('ico/fetchICOData', async () => {
  const web3 = getWeb3Instance();
  const contract = new web3.eth.Contract(
    coin100PublicSaleContractAbi as AbiItem[],
    validateContractAddress(publicSaleAddress, 'Public Sale Contract')
  );
  const tokenContract = new web3.eth.Contract(
    coin100ContractAbi as AbiItem[],
    validateContractAddress(tokenAddress, 'Token Contract')
  );

  const [polRate, startTime, endTime, finalized, contractBalance, totalSupply] =
    await Promise.all([
      contract.methods.polRate().call() as Promise<string>,
      contract.methods.startTime().call() as Promise<string>,
      contract.methods.endTime().call() as Promise<string>,
      contract.methods.finalized().call() as Promise<boolean>,
      tokenContract.methods
        .balanceOf(publicSaleAddress)
        .call() as Promise<string>,
      tokenContract.methods.totalSupply().call() as Promise<string>,
    ]);

  const now = Math.floor(Date.now() / 1000);
  const remainingTokens = web3.utils.fromWei(contractBalance, 'ether');
  const totalSoldBigInt = BigInt(totalSupply) - BigInt(contractBalance);
  const totalSold = web3.utils.fromWei(totalSoldBigInt.toString(), 'ether');

  return {
    polRate: web3.utils.fromWei(polRate, 'ether'),
    icoStartTime: Number(startTime),
    icoEndTime: Number(endTime),
    isFinalized: finalized,
    remainingTokens,
    totalSold,
    isIcoActive:
      now >= Number(startTime) && now <= Number(endTime) && !finalized,
  };
});

export const buyTokensWithPOL = createAsyncThunk(
  'ico/buyTokensWithPOL',
  async (amount: string, { dispatch }) => {
    const web3 = getWeb3Instance();
    const accounts = await web3.eth.getAccounts();

    if (accounts.length === 0) {
      throw new Error('No accounts connected');
    }

    const contract = new web3.eth.Contract(
      coin100PublicSaleContractAbi as AbiItem[],
      validateContractAddress(publicSaleAddress, 'Public Sale Contract')
    );

    await contract.methods.buyWithPOL().send({
      from: accounts[0],
      value: web3.utils.toWei(amount, 'ether'),
    });

    // Refresh ICO data after purchase
    await dispatch(fetchICOData());
  }
);

const icoSlice = createSlice({
  name: 'ico',
  initialState,
  reducers: {
    resetIcoState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch ICO Data
      .addCase(fetchICOData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchICOData.fulfilled, (state, action) => {
        state.loading = false;
        state.polRate = action.payload.polRate;
        state.icoStartTime = action.payload.icoStartTime;
        state.icoEndTime = action.payload.icoEndTime;
        state.isFinalized = action.payload.isFinalized;
        state.totalSold = action.payload.totalSold;
        state.remainingTokens = action.payload.remainingTokens;
        state.isIcoActive = action.payload.isIcoActive;
      })
      .addCase(fetchICOData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch ICO data';
      })

      // Buy Tokens
      .addCase(buyTokensWithPOL.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyTokensWithPOL.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(buyTokensWithPOL.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to buy tokens';
      });
  },
});

export const { resetIcoState } = icoSlice.actions;
export default icoSlice.reducer;
