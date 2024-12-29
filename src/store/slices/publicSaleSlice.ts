import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AbiItem } from 'web3-utils';
import {
  fetchContractABI,
  fetchContractAddresses,
  ContractAddresses,
} from '../../services/github';
import { executeContractCall, getWeb3Instance } from '../../utils/web3Utils';

// Initialize contract data
let tokenAddress: string = '';
let publicSaleAddress: string = '';
let coin100ContractAbi: AbiItem[] = [];
let coin100PublicSaleContractAbi: AbiItem[] = [];

// Types
export interface USDCToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  rate?: string; // Rate for token/C100 conversion
}

// Contract types
interface AllowedToken {
  token: string;
  rate: string;
  symbol: string;
  name: string;
  decimals: string;
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
  allowedTokens: USDCToken[];
  selectedToken: USDCToken | null;
  vestingSchedules: VestingSchedule[];
  purchaseState: {
    isApproving: boolean;
    isBuying: boolean;
    approvalError: string | null;
    purchaseError: string | null;
    approvalHash: string;
    purchaseHash: string;
  };
}

interface VestingSchedule {
  amount: string;
  releaseTime: number;
  isClaimable: boolean;
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
  allowedTokens: [],
  selectedToken: null,
  vestingSchedules: [],
  purchaseState: {
    isApproving: false,
    isBuying: false,
    approvalError: null,
    purchaseError: null,
    approvalHash: '',
    purchaseHash: '',
  },
};

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

// Helper function to convert to smallest unit
const toTokenDecimals = (amount: string, decimals: number): string => {
  try {
    // Convert to base unit (e.g., cents for USDC)
    const baseAmount = Math.floor(Number(amount) * Math.pow(10, decimals));
    const result = baseAmount.toString();

    return result;
  } catch (error) {
    console.error('Error converting to token decimals:', error);
    return '0';
  }
};

// Initialize contract data
export const initializeContractData = createAsyncThunk<
  ContractAddresses,
  void,
  { rejectValue: string }
>(
  'publicSale/initializeContractData',
  async (_, { dispatch, rejectWithValue }) => {
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
      const web3 = getWeb3Instance();
      const [tokenCode, saleCode] = await Promise.all([
        executeContractCall(() => web3.eth.getCode(addresses.c100TokenAddress)),
        executeContractCall(() =>
          web3.eth.getCode(addresses.publicSaleAddress)
        ),
      ]);

      if (tokenCode === '0x' || saleCode === '0x') {
        throw new Error(
          'One or more contracts not found at the specified addresses'
        );
      }

      // After initialization, fetch initial data
      await Promise.all([
        dispatch(fetchPublicSaleData()),
        dispatch(fetchAllowedTokens()),
      ]);

      return addresses;
    } catch (error) {
      console.error('Error initializing contract data:', error);
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to initialize contract data'
      );
    }
  }
);

// Fetch public sale data
export const fetchPublicSaleData = createAsyncThunk<PublicSaleData>(
  'publicSale/fetchData',
  async () => {
    try {
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
        startTimeStr,
        endTimeStr,
        finalized,
        contractBalance,
        totalSupply,
        treasury,
        isPaused,
      ] = await Promise.all([
        executeContractCall(() =>
          contract.methods.startTime().call()
        ) as Promise<string>,
        executeContractCall(() =>
          contract.methods.endTime().call()
        ) as Promise<string>,
        executeContractCall(() =>
          contract.methods.finalized().call()
        ) as Promise<boolean>,
        executeContractCall(() =>
          tokenContract.methods.balanceOf(publicSaleAddress).call()
        ) as Promise<string>,
        executeContractCall(() =>
          tokenContract.methods.totalSupply().call()
        ) as Promise<string>,
        executeContractCall(() =>
          contract.methods.treasury().call()
        ) as Promise<string>,
        executeContractCall(() =>
          contract.methods.paused().call()
        ) as Promise<boolean>,
      ]);

      const now = Math.floor(Date.now() / 1000);
      const startTime = Number(startTimeStr);
      const endTime = Number(endTimeStr);

      // Convert token amounts from wei to ether
      const remainingTokens = web3.utils.fromWei(contractBalance, 'ether');
      const totalSupplyEther = web3.utils.fromWei(totalSupply, 'ether');
      const totalSold = (
        Number(totalSupplyEther) - Number(remainingTokens)
      ).toString();

      // Check if sale is active
      const isSaleActive =
        now >= startTime && now <= endTime && !finalized && !isPaused;

      return {
        startTime,
        endTime,
        isFinalized: finalized,
        remainingTokens,
        totalSold,
        isSaleActive,
        treasuryAddress: treasury,
        isPaused,
      };
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
      const web3 = getWeb3Instance();
      const contract = new web3.eth.Contract(
        coin100PublicSaleContractAbi,
        validateContractAddress(publicSaleAddress, 'Public Sale Contract')
      );

      const state = getState() as { wallet: { address: string } };
      const { address: walletAddress } = state.wallet;

      // Get all allowed tokens in one call
      const allowedTokens = (await executeContractCall(() =>
        contract.methods.getAllowedTokens().call()
      )) as AllowedToken[];

      const tokens: USDCToken[] = await Promise.all(
        allowedTokens.map(async (token) => {
          // Token data is already available in the response
          const tokenAddress = token.token;
          const name = token.name;
          const symbol = token.symbol;
          const decimals = Number(token.decimals);
          const rate = token.rate;

          let balance = '0';
          if (walletAddress) {
            try {
              const tokenContract = new web3.eth.Contract(
                [ERC20_ABI.balanceOf] as AbiItem[],
                tokenAddress
              );

              balance = (await executeContractCall(() =>
                tokenContract.methods.balanceOf(walletAddress).call()
              )) as string;

              // Convert balance to decimal format based on token decimals
              balance = (Number(balance) / Math.pow(10, decimals)).toString();
            } catch (error) {
              console.warn(
                `Failed to fetch balance for token ${symbol}:`,
                error
              );
              // Continue with zero balance
            }
          }

          // Convert rate to decimal format based on token decimals
          // The rate from contract is in the format: 1e15 (0.001 * 1e18)
          // We need to convert it to 0.001 by dividing by 1e18
          const rateInDecimal = (Number(rate) / Math.pow(10, 18)).toString();

          return {
            address: tokenAddress,
            name,
            symbol,
            decimals,
            balance,
            rate: rateInDecimal,
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
  // The rate is price per 1 C100 (e.g., 0.001 USDC per C100)
  // So to get C100 amount: tokenAmount / rate
  if (Number(rate) === 0) return '0';

  // For example:
  // If user inputs 1 USDC and rate is 0.001 USDC per C100
  // Then they should receive 1/0.001 = 1000 C100 tokens
  const c100Amount = (Number(tokenAmount) / Number(rate)).toString();

  // Format the number to avoid scientific notation and round to 6 decimal places
  const formattedAmount = Number(c100Amount).toLocaleString('fullwide', {
    useGrouping: false,
    maximumFractionDigits: 6,
  });

  return formattedAmount;
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

    // After wallet connection, fetch both public sale data and allowed tokens
    await Promise.all([
      dispatch(fetchPublicSaleData()),
      dispatch(fetchAllowedTokens()),
    ]);

    return {};
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

// Check USDC allowance
export const checkUsdcAllowance = createAsyncThunk(
  'publicSale/checkAllowance',
  async ({ usdcAmount }: { usdcAmount: string }, { getState }) => {
    try {
      const web3 = getWeb3Instance();
      const state = getState() as {
        publicSale: PublicSaleState;
        wallet: { address: string };
      };
      const { selectedToken } = state.publicSale;
      const { address: walletAddress } = state.wallet;

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

      // Convert amount to smallest unit
      const amountInSmallestUnit = toTokenDecimals(
        usdcAmount,
        selectedToken.decimals
      );

      const allowance = (await tokenContract.methods
        .allowance(walletAddress, publicSaleAddress)
        .call()) as string;

      return {
        hasAllowance: BigInt(allowance) >= BigInt(amountInSmallestUnit),
        requiredAmount: amountInSmallestUnit,
      };
    } catch (error) {
      console.error('Error checking allowance:', error);
      throw error;
    }
  }
);

// Standard ERC20 interfaces
const ERC20_ABI = {
  approve: {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  allowance: {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  balanceOf: {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
} as const;

// Approve USDC spending
export const approveUsdcSpending = createAsyncThunk(
  'publicSale/approveSpending',
  async ({ usdcAmount }: { usdcAmount: string }, { getState }) => {
    try {
      const web3 = await getWeb3Instance();
      const state = getState() as {
        publicSale: PublicSaleState;
        wallet: { address: string };
      };
      const { selectedToken } = state.publicSale;
      const { address: walletAddress } = state.wallet;

      if (!walletAddress) {
        throw new Error('No wallet connected');
      }

      if (!selectedToken) {
        throw new Error('No token selected');
      }

      const amountInSmallestUnit = toTokenDecimals(
        usdcAmount,
        selectedToken.decimals
      );

      // Create contract instance with standard ERC20 ABI
      const tokenContract = new web3.eth.Contract(
        [ERC20_ABI.approve] as AbiItem[],
        selectedToken.address
      );

      // Get current gas price
      const gasPrice = await web3.eth.getGasPrice();

      // First, reset allowance to 0
      const resetTx = await tokenContract.methods
        .approve(publicSaleAddress, '0')
        .send({
          from: walletAddress,
          gasPrice: Math.floor(Number(gasPrice) * 1.1).toString(),
        });

      // Wait for the reset transaction to be mined
      await web3.eth.getTransactionReceipt(resetTx.transactionHash);

      // Estimate gas for approval
      const estimatedGas = await tokenContract.methods
        .approve(publicSaleAddress, amountInSmallestUnit)
        .estimateGas({ from: walletAddress });

      // Add 20% buffer to gas estimate
      const gasLimit = Math.floor(Number(estimatedGas) * 1.2).toString();

      // Send approval transaction
      const tx = await tokenContract.methods
        .approve(publicSaleAddress, amountInSmallestUnit)
        .send({
          from: walletAddress,
          gas: gasLimit,
          gasPrice: Math.floor(Number(gasPrice) * 1.1).toString(), // 10% above current gas price
        });

      // Wait for confirmation with timeout
      let receipt = null;
      const maxAttempts = 30;
      let attempts = 0;

      while (!receipt && attempts < maxAttempts) {
        try {
          receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
          if (receipt) {
            if (!receipt.status) {
              throw new Error('Approval transaction failed');
            }
            break;
          }
        } catch (error) {
          console.warn('Error checking receipt:', error);
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      }

      if (!receipt) {
        throw new Error(
          'Transaction not confirmed. Please check your wallet or try again.'
        );
      }

      return {
        transactionHash: tx.transactionHash,
        allowance: amountInSmallestUnit,
      };
    } catch (error) {
      console.error('Error approving spending:', error);
      throw error;
    }
  }
);

// Buy C100 tokens
export const buyC100Tokens = createAsyncThunk(
  'publicSale/buyTokens',
  async ({ usdcAmount }: { usdcAmount: string }, { dispatch, getState }) => {
    try {
      const web3 = getWeb3Instance();
      const state = getState() as {
        publicSale: PublicSaleState;
        wallet: { address: string };
      };
      const { selectedToken } = state.publicSale;
      const { address: walletAddress } = state.wallet;

      if (!walletAddress) {
        throw new Error('No wallet connected');
      }

      if (!selectedToken) {
        throw new Error('No token selected');
      }

      // Convert amount to smallest unit
      const amountInSmallestUnit = toTokenDecimals(
        usdcAmount,
        selectedToken.decimals
      );

      // Check allowance before purchase
      const tokenContract = new web3.eth.Contract(
        [ERC20_ABI.allowance] as AbiItem[],
        selectedToken.address
      );

      const allowance = (await tokenContract.methods
        .allowance(walletAddress, publicSaleAddress)
        .call()) as string;

      if (BigInt(allowance) < BigInt(amountInSmallestUnit)) {
        throw new Error(
          'Insufficient allowance. Please approve token spending first.'
        );
      }

      const contract = new web3.eth.Contract(
        coin100PublicSaleContractAbi,
        validateContractAddress(publicSaleAddress, 'Public Sale Contract')
      );

      // Get current gas price
      const gasPrice = await web3.eth.getGasPrice();

      // Estimate gas for purchase
      const estimatedGas = await contract.methods
        .buyWithToken(selectedToken.address, amountInSmallestUnit)
        .estimateGas({ from: walletAddress });

      // Add 20% buffer to gas estimate
      const gasLimit = Math.floor(Number(estimatedGas) * 1.2).toString();

      // Send purchase transaction
      const tx = await contract.methods
        .buyWithToken(selectedToken.address, amountInSmallestUnit)
        .send({
          from: walletAddress,
          gas: gasLimit,
          gasPrice: Math.floor(Number(gasPrice) * 1.1).toString(), // 10% above current gas price
        });

      // Wait for confirmation with timeout
      let receipt = null;
      const maxAttempts = 30;
      let attempts = 0;

      while (!receipt && attempts < maxAttempts) {
        try {
          receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
          if (receipt) {
            if (!receipt.status) {
              throw new Error('Purchase transaction failed');
            }
            break;
          }
        } catch (error) {
          console.warn('Error checking receipt:', error);
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      }

      if (!receipt) {
        throw new Error(
          'Transaction not confirmed. Please check your wallet or try again.'
        );
      }

      // Get C100 token contract
      const c100Contract = new web3.eth.Contract(
        coin100ContractAbi,
        validateContractAddress(tokenAddress, 'Token Contract')
      );

      // Check C100 balance before refresh
      const c100Balance = (await c100Contract.methods
        .balanceOf(walletAddress)
        .call()) as string;
      const c100BalanceInEther = web3.utils.fromWei(c100Balance, 'ether');

      // Refresh data after successful purchase
      await Promise.all([
        dispatch(fetchPublicSaleData()),
        dispatch(fetchAllowedTokens()),
      ]);

      return {
        transactionHash: tx.transactionHash,
        c100Balance: c100BalanceInEther,
      };
    } catch (error) {
      console.error('Error buying tokens:', error);
      throw error;
    }
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

// Check vesting schedule
export const checkVestingSchedule = createAsyncThunk(
  'publicSale/checkVesting',
  async (_, { getState }) => {
    try {
      const web3 = getWeb3Instance();
      const state = getState() as {
        wallet: { address: string };
      };
      const { address: walletAddress } = state.wallet;

      if (!walletAddress) {
        throw new Error('No wallet connected');
      }

      const contract = new web3.eth.Contract(
        coin100PublicSaleContractAbi,
        validateContractAddress(publicSaleAddress, 'Public Sale Contract')
      );

      // Get the vesting schedule directly
      const schedule = (await contract.methods
        .vestings(walletAddress, 0)
        .call()) as {
        amount: string;
        releaseTime: string;
      };

      const vestingSchedules: VestingSchedule[] = [];

      if (schedule && schedule.amount !== '0') {
        vestingSchedules.push({
          amount: web3.utils.fromWei(schedule.amount, 'ether'),
          releaseTime: Number(schedule.releaseTime),
          isClaimable: Date.now() / 1000 >= Number(schedule.releaseTime),
        });
      }

      return vestingSchedules;
    } catch (error) {
      console.error('Error checking vesting schedule:', error);
      throw error;
    }
  }
);

// Claim vested tokens
export const claimVestedTokens = createAsyncThunk(
  'publicSale/claimTokens',
  async (_, { getState, dispatch }) => {
    try {
      const web3 = getWeb3Instance();
      const state = getState() as {
        wallet: { address: string };
      };
      const { address: walletAddress } = state.wallet;

      if (!walletAddress) {
        throw new Error('No wallet connected');
      }

      const contract = new web3.eth.Contract(
        coin100PublicSaleContractAbi,
        validateContractAddress(publicSaleAddress, 'Public Sale Contract')
      );

      // Get current gas price
      const gasPrice = await web3.eth.getGasPrice();

      // Estimate gas for claim
      const estimatedGas = await contract.methods
        .claimTokens()
        .estimateGas({ from: walletAddress });

      // Add 20% buffer to gas estimate
      const gasLimit = Math.floor(Number(estimatedGas) * 1.2).toString();

      // Send claim transaction
      const tx = await contract.methods.claimTokens().send({
        from: walletAddress,
        gas: gasLimit,
        gasPrice: Math.floor(Number(gasPrice) * 1.1).toString(), // 10% above current gas price
      });

      // Wait for confirmation with timeout
      let receipt = null;
      const maxAttempts = 30;
      let attempts = 0;

      while (!receipt && attempts < maxAttempts) {
        try {
          receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
          if (receipt) {
            if (!receipt.status) {
              throw new Error('Claim transaction failed');
            }
            break;
          }
        } catch (error) {
          console.warn('Error checking receipt:', error);
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      }

      if (!receipt) {
        throw new Error(
          'Transaction not confirmed. Please check your wallet or try again.'
        );
      }

      // Refresh data after successful claim
      await Promise.all([
        dispatch(fetchPublicSaleData()),
        dispatch(fetchAllowedTokens()),
      ]);

      return { transactionHash: tx.transactionHash };
    } catch (error) {
      console.error('Error claiming tokens:', error);
      throw error;
    }
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
      .addCase(connectWallet.fulfilled, (state) => {
        state.loading = false;
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
      })

      // Check Vesting Schedule
      .addCase(checkVestingSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkVestingSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.vestingSchedules = action.payload;
      })
      .addCase(checkVestingSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to check vesting schedule';
      })

      // Claim Vested Tokens
      .addCase(claimVestedTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(claimVestedTokens.fulfilled, (state) => {
        state.loading = false;
        state.vestingSchedules = []; // Clear vesting schedules after claim
      })
      .addCase(claimVestedTokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to claim vested tokens';
      });
  },
});

export const { resetPublicSaleState, resetPurchaseState } =
  publicSaleSlice.actions;
export default publicSaleSlice.reducer;
