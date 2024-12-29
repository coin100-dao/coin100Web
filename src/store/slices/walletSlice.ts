import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  executeContractCall,
  getWeb3Instance,
  RPC_ENDPOINTS,
  POLYGON_CHAIN_ID,
} from '../../utils/web3Utils';
import type { EthereumProvider } from '../../types/ethereum';
import { AbiItem } from 'web3-utils';

// Types
interface TokenBalance {
  address: string;
  symbol: string;
  balance: string;
  decimals: number;
}

interface WalletState {
  address: string;
  chainId: string;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  tokenBalances: { [address: string]: TokenBalance };
}

// Initial state
const initialState: WalletState = {
  address: '',
  chainId: '',
  isConnected: false,
  isConnecting: false,
  error: null,
  tokenBalances: {},
};

// Type Guard for MetaMask Errors
interface MetaMaskError {
  code: number;
  message: string;
}

function isMetaMaskError(error: unknown): error is MetaMaskError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as MetaMaskError).code === 'number' &&
    'message' in error &&
    typeof (error as MetaMaskError).message === 'string'
  );
}

// Helper function to validate ethereum provider
const validateEthereumProvider = (): EthereumProvider => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  return window.ethereum;
};

/**
 * Switch to Polygon Network
 */
export const switchToPolygonNetwork = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('wallet/switchToPolygonNetwork', async (_, { rejectWithValue }) => {
  try {
    console.log('Switching to Polygon network...');
    const ethereum = validateEthereumProvider();

    console.log('Target chainId:', POLYGON_CHAIN_ID);

    await executeContractCall(async () => {
      const result = await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_CHAIN_ID }],
      });
      return result;
    });
    console.log('Successfully switched to Polygon network');
  } catch (error) {
    console.log('Error switching network:', error);
    // If the chain isn't added, attempt to add it
    if (isMetaMaskError(error) && error.code === 4902) {
      try {
        const ethereum = validateEthereumProvider();
        console.log('Adding Polygon network...');
        await executeContractCall(async () => {
          const result = await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: POLYGON_CHAIN_ID,
                chainName: 'Polygon Mainnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: RPC_ENDPOINTS,
                blockExplorerUrls: ['https://polygonscan.com/'],
              },
            ],
          });
          return result;
        });
        console.log('Successfully added Polygon network');
      } catch (addError: unknown) {
        console.error('Error adding Polygon network:', addError);
        return rejectWithValue(
          isMetaMaskError(addError)
            ? addError.message
            : 'Failed to add Polygon network'
        );
      }
    } else {
      return rejectWithValue(
        isMetaMaskError(error)
          ? error.message
          : 'Failed to switch to Polygon network'
      );
    }
  }
});

/**
 * Connect Wallet
 */
export const connectWallet = createAsyncThunk<
  { address: string; chainId: string },
  void,
  { rejectValue: string }
>('wallet/connect', async (_, { dispatch, rejectWithValue }) => {
  try {
    console.log('Connecting wallet...');
    const ethereum = validateEthereumProvider();

    const accountsResult = await executeContractCall(async () => {
      const result = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      return result;
    });

    if (!Array.isArray(accountsResult) || accountsResult.length === 0) {
      throw new Error('No accounts found');
    }

    const accounts = accountsResult as string[];
    console.log('Connected account:', accounts[0]);

    const chainIdResult = await executeContractCall(async () => {
      const result = await ethereum.request({
        method: 'eth_chainId',
      });
      return result;
    });
    const chainId = chainIdResult as string;
    console.log('Current chainId:', chainId);

    if (chainId !== POLYGON_CHAIN_ID) {
      console.log('Wrong network, switching to Polygon...');
      await dispatch(switchToPolygonNetwork()).unwrap();
    }

    // Initialize Web3 instance after successful connection
    getWeb3Instance();

    return { address: accounts[0], chainId: POLYGON_CHAIN_ID };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return rejectWithValue(
      isMetaMaskError(error) ? error.message : 'Failed to connect wallet'
    );
  }
});

// Helper function to fetch token balance
const fetchTokenBalance = async (
  web3: ReturnType<typeof getWeb3Instance>,
  tokenAddress: string,
  walletAddress: string,
  decimals: number
): Promise<string> => {
  try {
    console.log('Fetching balance for:', {
      tokenAddress,
      walletAddress,
      decimals,
    });

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

    const balance = (await executeContractCall(() =>
      tokenContract.methods.balanceOf(walletAddress).call()
    )) as string;

    console.log('Raw balance:', balance);

    // Convert based on token decimals
    const divisor = BigInt(10) ** BigInt(decimals);
    const balanceBigInt = BigInt(balance);
    const formattedBalance = (
      (balanceBigInt * BigInt(1000)) /
      divisor /
      BigInt(1000)
    ).toString();

    console.log('Formatted balance:', {
      rawBalance: balance,
      decimals,
      formattedBalance,
    });

    return formattedBalance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return '0';
  }
};

// Fetch token balances
export const fetchTokenBalances = createAsyncThunk(
  'wallet/fetchTokenBalances',
  async (
    tokens: { address: string; symbol: string; decimals: number }[],
    { getState }
  ) => {
    try {
      const web3 = getWeb3Instance();
      const state = getState() as { wallet: WalletState };
      const { address: walletAddress } = state.wallet;

      if (!walletAddress) {
        throw new Error('No wallet connected');
      }

      console.log('Fetching balances for tokens:', tokens);

      const balances = await Promise.all(
        tokens.map(async (token) => {
          const balance = await fetchTokenBalance(
            web3,
            token.address,
            walletAddress,
            token.decimals
          );

          return {
            address: token.address,
            symbol: token.symbol,
            balance,
            decimals: token.decimals,
          };
        })
      );

      console.log('Fetched balances:', balances);

      // Convert array to object for easier lookup
      const balanceMap = balances.reduce(
        (acc, token) => {
          acc[token.address] = token;
          return acc;
        },
        {} as { [address: string]: TokenBalance }
      );

      return balanceMap;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      throw error;
    }
  }
);

// Wallet Slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    disconnectWallet: (state) => {
      state.address = '';
      state.chainId = '';
      state.isConnected = false;
      state.error = null;
      state.tokenBalances = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.address = action.payload.address;
        state.chainId = action.payload.chainId;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.isConnected = false;
        state.error = action.payload ?? 'Failed to connect wallet';
      })
      .addCase(switchToPolygonNetwork.pending, (state) => {
        state.error = null;
      })
      .addCase(switchToPolygonNetwork.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to switch network';
      })
      // Fetch Token Balances
      .addCase(fetchTokenBalances.fulfilled, (state, action) => {
        state.tokenBalances = action.payload;
      })
      .addCase(fetchTokenBalances.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch token balances';
      });
  },
});

export const { disconnectWallet } = walletSlice.actions;
export default walletSlice.reducer;
