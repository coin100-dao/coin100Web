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

// RPC endpoints with fallbacks, ordered by reliability
export const RPC_ENDPOINTS = [
  'https://polygon-rpc.com',
  'https://rpc-mainnet.matic.network',
  'https://matic-mainnet.chainstacklabs.com',
  'https://rpc-mainnet.maticvigil.com',
  'https://rpc-mainnet.matic.quiknode.pro',
  'https://polygon-mainnet.public.blastapi.io',
  'https://poly-rpc.gateway.pokt.network',
];

interface RpcState {
  currentRpcIndex: number;
  consecutiveFailures: number;
  lastSuccessTime: number;
  healthyEndpoints: Set<number>;
  endpointLatencies: Map<number, number>;
}

const rpcState: RpcState = {
  currentRpcIndex: 0,
  consecutiveFailures: 0,
  lastSuccessTime: Date.now(),
  healthyEndpoints: new Set([0, 1, 2, 3, 4, 5, 6]), // Initially all are considered healthy
  endpointLatencies: new Map(),
};

const MAX_FAILURES = 2;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const MAX_LATENCY = 5000; // 5 seconds
const MIN_HEALTHY_ENDPOINTS = 2;

// Health check function
const checkRpcHealth = async (
  rpcUrl: string,
  index: number
): Promise<boolean> => {
  try {
    const startTime = Date.now();
    const web3 = new Web3(rpcUrl);

    // Check both block number and network ID
    const [blockNumber, networkId] = await Promise.all([
      web3.eth.getBlockNumber(),
      web3.eth.net.getId(),
    ]);

    const latency = Date.now() - startTime;

    // Verify we're on Polygon mainnet (chainId: 137)
    if (Number(networkId) !== 137) {
      console.warn(`RPC ${rpcUrl} returned wrong network ID: ${networkId}`);
      return false;
    }

    // Verify block number is recent (within last 2 blocks)
    const otherRpcs = Array.from(rpcState.healthyEndpoints)
      .filter((i) => i !== index)
      .map((i) => RPC_ENDPOINTS[i]);

    const blockNumbers = await Promise.all(
      otherRpcs.map(async (url) =>
        Number(await new Web3(url).eth.getBlockNumber())
      )
    );

    const currentBlockNumber = Number(blockNumber);
    const maxBlockNumber = Math.max(...blockNumbers, currentBlockNumber);
    if (maxBlockNumber - currentBlockNumber > 2) {
      console.warn(
        `RPC ${rpcUrl} is behind by ${maxBlockNumber - currentBlockNumber} blocks`
      );
      return false;
    }

    rpcState.endpointLatencies.set(index, latency);
    return latency < MAX_LATENCY;
  } catch (error) {
    console.warn(`RPC health check failed for ${rpcUrl}:`, error);
    return false;
  }
};

// Periodic health checks
setInterval(async () => {
  console.log('Running periodic RPC health checks...');
  const healthChecks = RPC_ENDPOINTS.map((url, index) =>
    checkRpcHealth(url, index)
  );
  const results = await Promise.all(healthChecks);

  rpcState.healthyEndpoints.clear();
  results.forEach((healthy, index) => {
    if (healthy) {
      rpcState.healthyEndpoints.add(index);
    }
  });

  // If current RPC is unhealthy, switch to the fastest healthy one
  if (!rpcState.healthyEndpoints.has(rpcState.currentRpcIndex)) {
    const fastestEndpoint = Array.from(rpcState.healthyEndpoints).sort(
      (a, b) =>
        (rpcState.endpointLatencies.get(a) || Infinity) -
        (rpcState.endpointLatencies.get(b) || Infinity)
    )[0];

    if (fastestEndpoint !== undefined) {
      rpcState.currentRpcIndex = fastestEndpoint;
      console.log(
        'Switched to faster RPC endpoint:',
        RPC_ENDPOINTS[fastestEndpoint]
      );
    }
  }
}, HEALTH_CHECK_INTERVAL);

export const getWeb3Instance = (): Web3 => {
  // For transactions, use the connected wallet
  if (window.ethereum) {
    console.log('Using wallet provider for transactions');
    return new Web3(window.ethereum);
  }

  // For contract reads, use the public RPC with fallback
  const rpcUrl = RPC_ENDPOINTS[rpcState.currentRpcIndex];
  console.log('Using public RPC for read operations:', rpcUrl);
  return new Web3(rpcUrl);
};

interface RpcError extends Error {
  message: string;
  code?: number;
}

const isTransactionError = (error: RpcError): boolean => {
  const errorMessage = error.message.toLowerCase();
  return (
    errorMessage.includes('transaction failed') ||
    errorMessage.includes('transaction underpriced') ||
    errorMessage.includes('nonce too low') ||
    errorMessage.includes('replacement transaction underpriced') ||
    errorMessage.includes('already known') ||
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('gas required exceeds allowance') ||
    errorMessage.includes('execution reverted') ||
    error.code === -32000 || // nonce too low
    error.code === -32003 || // transaction underpriced
    error.code === -32603 // internal error (often gas related)
  );
};

export const handleRpcError = async (error: RpcError): Promise<Web3> => {
  console.error('RPC error:', error);

  // If it's a transaction-specific error, don't switch RPC
  if (isTransactionError(error)) {
    throw error;
  }

  // Check if it's a connection or timeout error
  const isConnectionError =
    error.message.includes('429') ||
    error.message.includes('Too Many Requests') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('Invalid JSON') ||
    error.message.includes('timeout') ||
    error.message.includes('connection') ||
    error.code === 429;

  if (isConnectionError) {
    rpcState.consecutiveFailures++;

    // Remove current RPC from healthy endpoints
    rpcState.healthyEndpoints.delete(rpcState.currentRpcIndex);

    // If we've had too many failures, try the next healthy RPC
    if (rpcState.consecutiveFailures >= MAX_FAILURES) {
      const healthyEndpoints = Array.from(rpcState.healthyEndpoints);

      if (healthyEndpoints.length >= MIN_HEALTHY_ENDPOINTS) {
        // Sort by latency and pick the fastest healthy endpoint
        const fastestEndpoint = healthyEndpoints.sort(
          (a, b) =>
            (rpcState.endpointLatencies.get(a) || Infinity) -
            (rpcState.endpointLatencies.get(b) || Infinity)
        )[0];

        rpcState.currentRpcIndex = fastestEndpoint;
        rpcState.consecutiveFailures = 0;
        console.log(
          'Switching to faster RPC endpoint:',
          RPC_ENDPOINTS[fastestEndpoint]
        );
      } else {
        // If we don't have enough healthy endpoints, trigger immediate health check
        console.log(
          'Not enough healthy endpoints, running immediate health check...'
        );
        const healthChecks = RPC_ENDPOINTS.map((url, index) =>
          checkRpcHealth(url, index)
        );
        await Promise.all(healthChecks);

        // Try again with updated health information
        return handleRpcError(error);
      }
    }

    return getWeb3Instance();
  }

  // If it's not a connection error, rethrow
  throw error;
};

export const executeContractCall = async <T>(
  call: () => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < maxRetries) {
    try {
      const result = await call();
      rpcState.consecutiveFailures = 0;
      rpcState.lastSuccessTime = Date.now();
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${retries + 1} failed:`, error);

      // If it's a transaction error, don't retry
      if (isTransactionError(error as RpcError)) {
        throw error;
      }

      retries++;

      if (retries === maxRetries) {
        console.error(`Max retries (${maxRetries}) exceeded:`, error);
        throw error;
      }

      // Get new Web3 instance with potentially different RPC
      await handleRpcError(error as RpcError);

      // Exponential backoff with jitter
      const baseDelay = Math.pow(2, retries) * 1000;
      const jitter = Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, baseDelay + jitter));
    }
  }

  throw lastError || new Error('Max retries exceeded');
};
