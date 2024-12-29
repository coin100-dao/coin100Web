import Web3 from 'web3';

// Define Ethereum provider interface
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      on: (event: string, callback: (params?: unknown) => void) => void;
      removeListener: (
        event: string,
        callback: (params?: unknown) => void
      ) => void;
      isMetaMask?: boolean;
    };
  }
}

// Network constants
export const POLYGON_CHAIN_ID = '0x89'; // Polygon Mainnet Chain ID

// RPC endpoints with fallbacks
export const RPC_ENDPOINTS = [
  'https://polygon-rpc.com',
  'https://rpc-mainnet.matic.network',
  'https://matic-mainnet.chainstacklabs.com',
  'https://rpc-mainnet.maticvigil.com',
  'https://rpc-mainnet.matic.quiknode.pro',
];

let currentRpcIndex = 0;
let consecutiveFailures = 0;
const MAX_FAILURES = 3;

export const getWeb3Instance = (): Web3 => {
  // For transactions, use the connected wallet
  if (window.ethereum) {
    console.log('Using wallet provider for transactions');
    return new Web3(window.ethereum);
  }

  // For contract reads, use the public RPC with fallback
  console.log(
    'Using public RPC for read operations:',
    RPC_ENDPOINTS[currentRpcIndex]
  );
  return new Web3(RPC_ENDPOINTS[currentRpcIndex]);
};

interface RpcError extends Error {
  message: string;
  code?: number;
}

export const handleRpcError = async (error: RpcError): Promise<Web3> => {
  console.error('RPC error:', error);

  // Check if it's a rate limit or connection error
  if (
    error.message.includes('429') ||
    error.message.includes('Too Many Requests') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('Invalid JSON') ||
    error.code === 429
  ) {
    consecutiveFailures++;

    // If we've had too many failures on this RPC, try the next one
    if (consecutiveFailures >= MAX_FAILURES) {
      currentRpcIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length;
      consecutiveFailures = 0;
      console.log(
        'Switching to next RPC endpoint:',
        RPC_ENDPOINTS[currentRpcIndex]
      );
    }

    // Return a new Web3 instance with the current RPC
    return new Web3(RPC_ENDPOINTS[currentRpcIndex]);
  }

  // If it's not a rate limit error, rethrow
  throw error;
};

export const executeContractCall = async <T>(
  call: () => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const result = await call();
      consecutiveFailures = 0; // Reset failure count on success
      return result;
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        throw error;
      }

      // Get new Web3 instance with potentially different RPC
      await handleRpcError(error as RpcError);

      // Wait before retry with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, retries) * 1000)
      );
    }
  }

  throw new Error('Max retries exceeded');
};
