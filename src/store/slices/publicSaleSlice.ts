import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import {
  fetchContractABI,
  fetchContractAddresses,
  ContractAddresses,
} from '../../services/github';

// Constants
const POLYGON_RPC = 'https://polygon-rpc.com';

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
  rate?: string; // Rate for token/C100 conversion
}

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
  allowedTokens: USDCToken[];
  selectedToken: USDCToken | null;
  purchaseState: {
    isApproving: boolean;
    isBuying: boolean;
    approvalError: string | null;
    purchaseError: string | null;
    approvalHash: string;
    purchaseHash: string;
  };
}

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
  allowedTokens: [],
  selectedToken: null,
  purchaseState: {
    isApproving: false,
    isBuying: false,
    approvalError: null,
    purchaseError: null,
    approvalHash: '',
    purchaseHash: '',
  },
};

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
  // For contract reads, use the public RPC
  if (!window.ethereum) {
    return new Web3(POLYGON_RPC);
  }
  // For transactions, use the connected wallet
  return new Web3(window.ethereum);
};

// Helper function to get token balance
const fetchTokenBalance = async (
  web3: Web3,
  tokenAddress: string,
  walletAddress: string,
  decimals: number
): Promise<string> => {
  const tokenContract = new web3.eth.Contract(
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

  const balance = (await tokenContract.methods
    .balanceOf(walletAddress)
    .call()) as string;

  // Convert based on token decimals
  const divisor = BigInt(10) ** BigInt(decimals);
  return (BigInt(balance) / divisor).toString();
};

// Contract types
interface ContractAllowedToken {
  token: string;
  rate: string;
  symbol: string;
  name: string;
  decimals: string;
}

// Initialize contract data
export const initializeContractData = createAsyncThunk<
  ContractAddresses,
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

    // Verify contracts exist
    const web3 = new Web3(POLYGON_RPC);
    const tokenCode = await web3.eth.getCode(addresses.c100TokenAddress);
    const saleCode = await web3.eth.getCode(addresses.publicSaleAddress);

    if (tokenCode === '0x' || saleCode === '0x') {
      throw new Error(
        'One or more contracts not found at the specified addresses'
      );
    }

    return addresses;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : 'Failed to initialize contract data'
    );
  }
});

// Fetch public sale data
export const fetchPublicSaleData = createAsyncThunk<PublicSaleData>(
  'publicSale/fetchData',
  async () => {
    try {
      const web3 = new Web3(POLYGON_RPC);

      const contract = new web3.eth.Contract(
        coin100PublicSaleContractAbi,
        validateContractAddress(publicSaleAddress, 'Public Sale Contract')
      );
      const tokenContract = new web3.eth.Contract(
        coin100ContractAbi,
        validateContractAddress(tokenAddress, 'Token Contract')
      );

      const [
        startTimeStr,
        endTimeStr,
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
      const startTime = Number(startTimeStr);
      const endTime = Number(endTimeStr);

      // Convert token amounts from wei to ether, handling the decimals correctly
      const remainingTokens = web3.utils.fromWei(contractBalance, 'ether');
      const totalSupplyEther = web3.utils.fromWei(totalSupply, 'ether');
      const totalSold = (
        Number(totalSupplyEther) - Number(remainingTokens)
      ).toString();

      // Check if sale is active - sale is active if:
      // 1. Current time is after start time
      // 2. Current time is before end time
      // 3. Sale is not finalized
      // 4. Sale is not paused
      const isSaleActive =
        now >= startTime && now <= endTime && !finalized && !isPaused;

      const result: PublicSaleData = {
        startTime,
        endTime,
        isFinalized: finalized,
        remainingTokens,
        totalSold,
        isSaleActive,
        treasuryAddress: treasury,
        isPaused,
      };

      return result;
    } catch (error) {
      console.error('Error fetching public sale data:', error);
      throw error;
    }
  }
);

// Fetch allowed tokens from contract
export const fetchAllowedTokens = createAsyncThunk(
  'publicSale/fetchAllowedTokens',
  async (_, { getState }) => {
    try {
      const web3 = new Web3(POLYGON_RPC);
      const contract = new web3.eth.Contract(
        coin100PublicSaleContractAbi,
        validateContractAddress(publicSaleAddress, 'Public Sale Contract')
      );

      const state = getState() as { publicSale: PublicSaleState };
      const { walletAddress } = state.publicSale;
      const allowedTokens = (await contract.methods
        .getAllowedTokens()
        .call()) as ContractAllowedToken[];

      const tokens: USDCToken[] = await Promise.all(
        allowedTokens.map(async (token: ContractAllowedToken) => {
          let balance = '0';
          if (walletAddress) {
            balance = await fetchTokenBalance(
              web3,
              token.token,
              walletAddress,
              Number(token.decimals)
            );
          }

          // Convert rate to decimal format (rate is in wei)
          const rateInEther = web3.utils.fromWei(token.rate, 'ether');

          return {
            address: token.token,
            name: token.name,
            symbol: token.symbol,
            decimals: Number(token.decimals),
            balance,
            rate: rateInEther,
          };
        })
      );

      return tokens;
    } catch (error) {
      console.error('Error in fetchAllowedTokens:', error);
      throw error;
    }
  }
);

// Calculate C100 amount from token amount
export const calculateC100Amount = (
  tokenAmount: string,
  rate: string
): string => {
  // The rate is price per 1 C100 (e.g., 0.001 USDC.e per C100)
  // So to get C100 amount: tokenAmount / rate
  if (Number(rate) === 0) return '0';
  const c100Amount = (Number(tokenAmount) / Number(rate)).toString();
  console.log('Calculating C100 amount:', {
    tokenAmount,
    rate,
    c100Amount,
  });
  return c100Amount;
};

// Connect wallet function
export const connectWallet = createAsyncThunk(
  'publicSale/connectWallet',
  async (_, { dispatch }) => {
    const web3 = getWeb3Instance();
    const accounts = await web3.eth.requestAccounts();

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const walletAddress = accounts[0];

    await dispatch(fetchAllowedTokens());

    return { walletAddress };
  }
);

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

// Add new action to check USDC allowance
export const checkUsdcAllowance = createAsyncThunk(
  'publicSale/checkAllowance',
  async ({ usdcAmount }: { usdcAmount: string }, { getState }) => {
    const web3 = getWeb3Instance();
    const state = getState() as { publicSale: PublicSaleState };
    const { selectedToken, walletAddress } = state.publicSale;

    if (!walletAddress) {
      throw new Error('No wallet connected');
    }

    if (!selectedToken) {
      throw new Error('No token selected');
    }

    const tokenContract = new web3.eth.Contract(
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
      selectedToken.address
    );

    const divisor = BigInt(10) ** BigInt(selectedToken.decimals);
    const amountInSmallestUnit =
      (BigInt(Math.floor(Number(usdcAmount) * 1e6)) * divisor) / BigInt(1e6);

    const allowance = (await tokenContract.methods
      .allowance(walletAddress, publicSaleAddress)
      .call()) as string;

    return {
      hasAllowance: BigInt(allowance) >= amountInSmallestUnit,
      requiredAmount: amountInSmallestUnit.toString(),
    };
  }
);

// Split approve and buy into separate actions
export const approveUsdcSpending = createAsyncThunk(
  'publicSale/approveSpending',
  async ({ usdcAmount }: { usdcAmount: string }, { getState }) => {
    const web3 = getWeb3Instance();
    const state = getState() as { publicSale: PublicSaleState };
    const { selectedToken, walletAddress } = state.publicSale;

    if (!walletAddress) {
      throw new Error('No wallet connected');
    }

    if (!selectedToken) {
      throw new Error('No token selected');
    }

    const divisor = BigInt(10) ** BigInt(selectedToken.decimals);
    const amountInSmallestUnit =
      (BigInt(Math.floor(Number(usdcAmount) * 1e6)) * divisor) / BigInt(1e6);

    const tokenContract = new web3.eth.Contract(
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
      selectedToken.address
    );

    const tx = await tokenContract.methods
      .approve(publicSaleAddress, amountInSmallestUnit.toString())
      .send({ from: walletAddress });

    return { transactionHash: tx.transactionHash };
  }
);

export const buyC100Tokens = createAsyncThunk(
  'publicSale/buyTokens',
  async ({ usdcAmount }: { usdcAmount: string }, { dispatch, getState }) => {
    const web3 = getWeb3Instance();
    const state = getState() as { publicSale: PublicSaleState };
    const { selectedToken, walletAddress } = state.publicSale;

    if (!walletAddress) {
      throw new Error('No wallet connected');
    }

    if (!selectedToken) {
      throw new Error('No token selected');
    }

    const contract = new web3.eth.Contract(
      coin100PublicSaleContractAbi,
      validateContractAddress(publicSaleAddress, 'Public Sale Contract')
    );

    const divisor = BigInt(10) ** BigInt(selectedToken.decimals);
    const amountInSmallestUnit =
      (BigInt(Math.floor(Number(usdcAmount) * 1e6)) * divisor) / BigInt(1e6);

    const tx = await contract.methods
      .buyTokens(selectedToken.address, amountInSmallestUnit.toString())
      .send({ from: walletAddress });

    // Refresh sale data after successful purchase
    await dispatch(fetchPublicSaleData());

    return { transactionHash: tx.transactionHash };
  }
);

// Select token
export const selectToken = createAsyncThunk(
  'publicSale/selectToken',
  async (tokenAddress: string, { getState }) => {
    const state = getState() as { publicSale: PublicSaleState };
    const selectedToken = state.publicSale.allowedTokens.find(
      (token) => token.address === tokenAddress
    );
    if (!selectedToken) {
      throw new Error('Invalid token selected');
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

      // Fetch Allowed Tokens
      .addCase(fetchAllowedTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllowedTokens.fulfilled, (state, action) => {
        state.loading = false;
        state.allowedTokens = action.payload;
        if (action.payload.length > 0 && !state.selectedToken) {
          state.selectedToken = action.payload[0];
        }
      })
      .addCase(fetchAllowedTokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch allowed tokens';
      })

      // Connect Wallet
      .addCase(connectWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.walletAddress = action.payload.walletAddress;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to connect wallet';
      })

      // Select Token
      .addCase(selectToken.fulfilled, (state, action) => {
        state.selectedToken = action.payload;
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
        state.remainingTokens = action.payload.remainingTokens;
        state.totalSold = action.payload.totalSold;
        state.isSaleActive = action.payload.isSaleActive;
        state.treasuryAddress = action.payload.treasuryAddress;
        state.isPaused = action.payload.isPaused;
      })
      .addCase(fetchPublicSaleData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to fetch public sale data';
      });
  },
});

export const { resetPublicSaleState, resetPurchaseState } =
  publicSaleSlice.actions;
export default publicSaleSlice.reducer;
