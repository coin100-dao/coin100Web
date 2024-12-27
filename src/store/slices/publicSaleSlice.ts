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

interface USDCToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
}

// Available USDC tokens
export const USDC_TOKENS: USDCToken[] = [
  {
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    name: 'USD Coin (PoS)',
    symbol: 'USDC',
    decimals: 6,
    balance: '0',
  },
  {
    address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    balance: '0',
  },
];

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
  walletAddress: string;
  usdcTokens: USDCToken[];
  selectedUsdcToken: USDCToken;
  purchaseState: {
    isApproving: boolean;
    isBuying: boolean;
    approvalError: string | null;
    purchaseError: string | null;
    approvalHash: string;
    purchaseHash: string;
  };
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

// Helper function to get USDC balance
const fetchUsdcBalance = async (
  web3: Web3,
  tokenAddress: string,
  walletAddress: string
): Promise<string> => {
  const usdcContract = new web3.eth.Contract(
    [
      {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function',
      },
    ],
    tokenAddress
  );

  const balance = (await usdcContract.methods
    .balanceOf(walletAddress)
    .call()) as string;
  return web3.utils.fromWei(balance, 'mwei'); // USDC has 6 decimals
};

// Calculate C100 amount from USDC amount
export const calculateC100Amount = (usdcAmount: string): string => {
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
  walletAddress: '',
  usdcTokens: USDC_TOKENS,
  selectedUsdcToken: USDC_TOKENS[0],
  purchaseState: {
    isApproving: false,
    isBuying: false,
    approvalError: null,
    purchaseError: null,
    approvalHash: '',
    purchaseHash: '',
  },
};

// Connect wallet function
export const connectWallet = createAsyncThunk(
  'publicSale/connectWallet',
  async () => {
    const web3 = getWeb3Instance();
    const accounts = await web3.eth.requestAccounts();

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const walletAddress = accounts[0];

    // Fetch balances for all USDC tokens
    const balancePromises = USDC_TOKENS.map((token) =>
      fetchUsdcBalance(web3, token.address, walletAddress)
    );

    const balances = await Promise.all(balancePromises);

    // Update tokens with balances
    const updatedTokens = USDC_TOKENS.map((token, index) => ({
      ...token,
      balance: balances[index],
    }));

    // Find the token with the highest balance to set as default
    const defaultToken = updatedTokens.reduce((prev, current) =>
      Number(current.balance) > Number(prev.balance) ? current : prev
    );

    return {
      walletAddress,
      usdcTokens: updatedTokens,
      selectedUsdcToken: defaultToken,
    };
  }
);

// Initialize contract data
export const initializeContractData = createAsyncThunk<
  { tokenAddress: string; publicSaleAddress: string },
  void,
  { rejectValue: string }
>('publicSale/initializeContractData', async (_, { rejectWithValue }) => {
  try {
    const addresses = await fetchContractAddresses();
    tokenAddress = addresses.c100TokenAddress;
    publicSaleAddress = addresses.publicSaleAddress;

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

interface PublicSaleData {
  startTime: number;
  endTime: number;
  isFinalized: boolean;
  remainingTokens: string;
  totalSold: string;
  isSaleActive: boolean;
  treasuryAddress: string;
  isPaused: boolean;
}

// Fetch public sale data
export const fetchPublicSaleData = createAsyncThunk<PublicSaleData>(
  'publicSale/fetchData',
  async () => {
    const web3 = getWeb3Instance();
    const contract = new web3.eth.Contract(
      coin100PublicSaleContractAbi,
      validateContractAddress(publicSaleAddress, 'Public Sale Contract')
    );
    const tokenContract = new web3.eth.Contract(
      coin100ContractAbi,
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

// Add new action to check USDC allowance
export const checkUsdcAllowance = createAsyncThunk(
  'publicSale/checkAllowance',
  async ({ usdcAmount }: { usdcAmount: string }, { getState }) => {
    const web3 = getWeb3Instance();
    const state = getState() as { publicSale: PublicSaleState };
    const { selectedUsdcToken, walletAddress } = state.publicSale;

    if (!walletAddress) {
      throw new Error('No wallet connected');
    }

    const usdcContract = new web3.eth.Contract(
      [
        {
          constant: true,
          inputs: [
            { name: '_owner', type: 'address' },
            { name: '_spender', type: 'address' },
          ],
          name: 'allowance',
          outputs: [{ name: '', type: 'uint256' }],
          type: 'function',
        },
      ],
      selectedUsdcToken.address
    );

    const usdcAmountWei = web3.utils.toWei(usdcAmount, 'mwei');
    const allowance = (await usdcContract.methods
      .allowance(walletAddress, publicSaleAddress)
      .call()) as string;

    return {
      hasAllowance: BigInt(allowance) >= BigInt(usdcAmountWei),
      requiredAmount: usdcAmountWei,
    };
  }
);

// Split approve and buy into separate actions
export const approveUsdcSpending = createAsyncThunk(
  'publicSale/approveSpending',
  async ({ usdcAmount }: { usdcAmount: string }, { getState }) => {
    const web3 = getWeb3Instance();
    const state = getState() as { publicSale: PublicSaleState };
    const { selectedUsdcToken, walletAddress } = state.publicSale;

    if (!walletAddress) {
      throw new Error('No wallet connected');
    }

    const usdcAmountWei = web3.utils.toWei(usdcAmount, 'mwei');
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
      selectedUsdcToken.address
    );

    const tx = await usdcContract.methods
      .approve(publicSaleAddress, usdcAmountWei)
      .send({ from: walletAddress });

    return { transactionHash: tx.transactionHash };
  }
);

export const buyC100Tokens = createAsyncThunk(
  'publicSale/buyTokens',
  async ({ usdcAmount }: { usdcAmount: string }, { dispatch, getState }) => {
    const web3 = getWeb3Instance();
    const state = getState() as { publicSale: PublicSaleState };
    const { walletAddress } = state.publicSale;

    if (!walletAddress) {
      throw new Error('No wallet connected');
    }

    const contract = new web3.eth.Contract(
      coin100PublicSaleContractAbi,
      validateContractAddress(publicSaleAddress, 'Public Sale Contract')
    );

    const usdcAmountWei = web3.utils.toWei(usdcAmount, 'mwei');
    const tx = await contract.methods
      .buyTokens(usdcAmountWei)
      .send({ from: walletAddress });

    // Refresh sale data after successful purchase
    await dispatch(fetchPublicSaleData());

    return { transactionHash: tx.transactionHash };
  }
);

// Select USDC token
export const selectUsdcToken = createAsyncThunk(
  'publicSale/selectUsdcToken',
  async (tokenAddress: string, { getState }) => {
    const state = getState() as { publicSale: PublicSaleState };
    const selectedToken = state.publicSale.usdcTokens.find(
      (token) => token.address === tokenAddress
    );
    if (!selectedToken) {
      throw new Error('Invalid USDC token selected');
    }
    return selectedToken;
  }
);

const publicSaleSlice = createSlice({
  name: 'publicSale',
  initialState,
  reducers: {
    resetPublicSaleState: () => initialState,
    resetPurchaseState: (state) => {
      state.purchaseState = initialState.purchaseState;
    },
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

      // Connect Wallet
      .addCase(connectWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.walletAddress = action.payload.walletAddress;
        state.usdcTokens = action.payload.usdcTokens;
        state.selectedUsdcToken = action.payload.selectedUsdcToken;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to connect wallet';
      })

      // Select USDC Token
      .addCase(selectUsdcToken.fulfilled, (state, action) => {
        state.selectedUsdcToken = action.payload;
      })

      // Approve USDC Spending
      .addCase(approveUsdcSpending.pending, (state) => {
        state.purchaseState.isApproving = true;
        state.purchaseState.approvalError = null;
      })
      .addCase(approveUsdcSpending.fulfilled, (state, action) => {
        state.purchaseState.isApproving = false;
        state.purchaseState.approvalHash = action.payload.transactionHash;
      })
      .addCase(approveUsdcSpending.rejected, (state, action) => {
        state.purchaseState.isApproving = false;
        state.purchaseState.approvalError =
          action.error.message || 'Failed to approve USDC spending';
      })

      // Buy C100 Tokens
      .addCase(buyC100Tokens.pending, (state) => {
        state.purchaseState.isBuying = true;
        state.purchaseState.purchaseError = null;
      })
      .addCase(buyC100Tokens.fulfilled, (state, action) => {
        state.purchaseState.isBuying = false;
        state.purchaseState.purchaseHash = action.payload.transactionHash;
      })
      .addCase(buyC100Tokens.rejected, (state, action) => {
        state.purchaseState.isBuying = false;
        state.purchaseState.purchaseError =
          action.error.message || 'Failed to buy C100 tokens';
      });
  },
});

export const { resetPublicSaleState, resetPurchaseState } =
  publicSaleSlice.actions;
export default publicSaleSlice.reducer;
