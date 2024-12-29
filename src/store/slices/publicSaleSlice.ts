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
    console.log('Converting to token decimals:', { amount, decimals });
    // Convert to base unit (e.g., cents for USDC)
    const baseAmount = Math.floor(Number(amount) * Math.pow(10, decimals));
    const result = baseAmount.toString();
    console.log('Conversion result:', result);
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
      console.log('Initializing contract data...');
      const addresses = await fetchContractAddresses();

      tokenAddress = addresses.c100TokenAddress;
      publicSaleAddress = addresses.publicSaleAddress;

      console.log('Fetched addresses:', { tokenAddress, publicSaleAddress });

      const [c100Abi, publicSaleAbi] = await Promise.all([
        fetchContractABI('c100'),
        fetchContractABI('public-sale'),
      ]);

      coin100ContractAbi = c100Abi;
      coin100PublicSaleContractAbi = publicSaleAbi;

      console.log('Fetched ABIs:', {
        tokenAbiLength: c100Abi.length,
        saleAbiLength: publicSaleAbi.length,
      });

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
      console.log('Fetching public sale data...');
      const web3 = getWeb3Instance();

      const contract = new web3.eth.Contract(
        coin100PublicSaleContractAbi,
        validateContractAddress(publicSaleAddress, 'Public Sale Contract')
      );
      const tokenContract = new web3.eth.Contract(
        coin100ContractAbi,
        validateContractAddress(tokenAddress, 'Token Contract')
      );

      console.log('Fetching contract state...');
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

      console.log('Contract state:', {
        startTime,
        endTime,
        finalized,
        contractBalance,
        totalSupply,
        treasury,
        isPaused,
      });

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
      console.log('Starting fetchAllowedTokens...');
      const web3 = getWeb3Instance();
      const contract = new web3.eth.Contract(
        coin100PublicSaleContractAbi,
        validateContractAddress(publicSaleAddress, 'Public Sale Contract')
      );

      const state = getState() as { wallet: { address: string } };
      const { address: walletAddress } = state.wallet;
      console.log('Fetching allowed tokens for wallet:', walletAddress);

      // Get all allowed tokens in one call
      const allowedTokens = (await executeContractCall(() =>
        contract.methods.getAllowedTokens().call()
      )) as AllowedToken[];

      console.log('Raw allowed tokens from contract:', allowedTokens);

      const tokens: USDCToken[] = await Promise.all(
        allowedTokens.map(async (token) => {
          // Token data is already available in the response
          const tokenAddress = token.token;
          const name = token.name;
          const symbol = token.symbol;
          const decimals = Number(token.decimals);
          const rate = token.rate;

          console.log('Token details:', {
            address: tokenAddress,
            name,
            symbol,
            decimals,
            rate,
          });

          let balance = '0';
          if (walletAddress) {
            const tokenContract = new web3.eth.Contract(
              [
                {
                  constant: true,
                  inputs: [{ name: '_owner', type: 'address' }],
                  name: 'balanceOf',
                  outputs: [{ name: 'balance', type: 'uint256' }],
                  type: 'function',
                },
              ] as AbiItem[],
              tokenAddress
            );

            balance = (await executeContractCall(() =>
              tokenContract.methods.balanceOf(walletAddress).call()
            )) as string;

            // Convert balance to decimal format based on token decimals
            balance = (Number(balance) / Math.pow(10, decimals)).toString();
            console.log('Fetched balance for token:', {
              token: symbol,
              balance,
              decimals,
            });
          }

          // Convert rate to decimal format based on token decimals
          const rateInDecimal = (
            Number(rate) / Math.pow(10, decimals)
          ).toString();
          console.log('Converted rate:', {
            token: symbol,
            rawRate: rate,
            decimals,
            rateInDecimal,
          });

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

      console.log('Final processed tokens:', tokens);
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

      console.log('Checking allowance for:', {
        tokenAddress: selectedToken.address,
        amount: usdcAmount,
        decimals: selectedToken.decimals,
        walletAddress,
      });

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
      console.log('Amount in smallest unit:', amountInSmallestUnit);

      const allowance = (await tokenContract.methods
        .allowance(walletAddress, publicSaleAddress)
        .call()) as string;

      console.log('Current allowance:', allowance);

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
        .approve(publicSaleAddress, amountInSmallestUnit)
        .send({ from: walletAddress });

      // Wait for the transaction to be mined
      const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
      if (!receipt || !receipt.status) {
        throw new Error('Approval transaction failed');
      }

      return { transactionHash: tx.transactionHash };
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

      console.log('Buying tokens with:', {
        tokenAddress: selectedToken.address,
        amount: usdcAmount,
        decimals: selectedToken.decimals,
        walletAddress,
      });

      const contract = new web3.eth.Contract(
        coin100PublicSaleContractAbi,
        validateContractAddress(publicSaleAddress, 'Public Sale Contract')
      );

      // Check if sale is active
      const [
        startTime,
        endTime,
        isPaused,
        lastPurchaseTime,
        userPurchases,
        maxUserCap,
      ] = await Promise.all([
        executeContractCall(() =>
          contract.methods.startTime().call()
        ) as Promise<string>,
        executeContractCall(() =>
          contract.methods.endTime().call()
        ) as Promise<string>,
        executeContractCall(() =>
          contract.methods.paused().call()
        ) as Promise<boolean>,
        executeContractCall(() =>
          contract.methods.lastPurchaseTime(walletAddress).call()
        ) as Promise<string>,
        executeContractCall(() =>
          contract.methods.userPurchases(walletAddress).call()
        ) as Promise<string>,
        executeContractCall(() =>
          contract.methods.maxUserCap().call()
        ) as Promise<string>,
      ]);

      const now = Math.floor(Date.now() / 1000);
      if (now < Number(startTime) || now > Number(endTime)) {
        throw new Error('Sale is not active');
      }

      if (isPaused) {
        throw new Error('Sale is paused');
      }

      // Check purchase delay (5 minutes by default)
      const purchaseDelay = (await executeContractCall(() =>
        contract.methods.purchaseDelay().call()
      )) as string;

      if (now < Number(lastPurchaseTime) + Number(purchaseDelay)) {
        throw new Error(
          `Please wait ${Math.ceil((Number(lastPurchaseTime) + Number(purchaseDelay) - now) / 60)} minutes before next purchase`
        );
      }

      // Convert amount to smallest unit
      const amountInSmallestUnit = toTokenDecimals(
        usdcAmount,
        selectedToken.decimals
      );
      console.log('Amount in smallest unit:', amountInSmallestUnit);

      // Calculate C100 amount
      const c100Amount =
        (BigInt(amountInSmallestUnit) * BigInt(1e18)) /
        BigInt(selectedToken.rate || '0');

      // Check max user cap
      if (BigInt(userPurchases) + c100Amount > BigInt(maxUserCap)) {
        throw new Error('Purchase would exceed maximum allowed amount');
      }

      console.log('Calling buyWithToken with:', {
        tokenAddress: selectedToken.address,
        amount: amountInSmallestUnit,
      });

      // Estimate gas first
      const gas = await contract.methods
        .buyWithToken(selectedToken.address, amountInSmallestUnit)
        .estimateGas({ from: walletAddress });

      // Add 20% buffer to gas estimate
      const gasLimit = Math.floor(Number(gas) * 1.2).toString();

      // Send transaction with proper gas settings
      const tx = await contract.methods
        .buyWithToken(selectedToken.address, amountInSmallestUnit)
        .send({
          from: walletAddress,
          gas: gasLimit,
        });

      console.log('Purchase transaction:', tx);

      // Wait for transaction confirmation
      const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
      if (!receipt || !receipt.status) {
        throw new Error('Transaction failed');
      }

      // Refresh data after successful purchase
      await Promise.all([
        dispatch(fetchPublicSaleData()),
        dispatch(fetchAllowedTokens()),
      ]);

      return { transactionHash: tx.transactionHash };
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
      });
  },
});

export const { resetPublicSaleState, resetPurchaseState } =
  publicSaleSlice.actions;
export default publicSaleSlice.reducer;
