import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Web3 from 'web3';
import { fetchContractAddresses } from '../../services/github';

// Constants
const POLYGON_RPC = 'https://polygon-rpc.com'; // Public Polygon RPC
const BLOCKS_TO_FETCH = 50000; // Look back further
const BATCH_SIZE = 10; // Process 10 events at a time
const BATCH_DELAY = 300; // 300ms delay between batches

// Cache for block timestamps
const blockTimestampCache = new Map<number, number>();

// Helper function to get block timestamp with caching
const getBlockTimestamp = async (
  web3: Web3,
  blockNumber: number
): Promise<number> => {
  if (blockTimestampCache.has(blockNumber)) {
    return blockTimestampCache.get(blockNumber)!;
  }
  const block = await web3.eth.getBlock(blockNumber);
  const timestamp = Number(block?.timestamp || 0);
  blockTimestampCache.set(blockNumber, timestamp);
  return timestamp;
};

// Helper function to process in batches
const processBatch = async <T, R>(
  items: T[],
  batchSize: number,
  processor: (items: T[]) => Promise<R[]>
): Promise<R[]> => {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    try {
      const batchResults = await processor(batch);
      results.push(...batchResults);
      if (i + batchSize < items.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
      }
    } catch (error) {
      console.error('Error processing batch:', error);
      // Continue with next batch instead of failing completely
    }
  }
  return results;
};

// Types for Web3 events
interface TransferEvent {
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

interface DecodedTransferLog {
  from: string;
  to: string;
  value: string;
}

interface Web3TransactionLog {
  blockNumber: bigint;
  data: string;
  topics: string[];
  transactionHash: string;
}

interface ActivityState {
  loading: boolean;
  error: string | null;
  transfers: TransferEvent[];
  lastBlock: string;
  oldestLoadedBlock: string;
  hasMore: boolean;
}

interface FetchTransfersResult {
  transfers: TransferEvent[];
  lastBlock: string;
  oldestLoadedBlock: string;
  hasMore: boolean;
}

const initialState: ActivityState = {
  loading: false,
  error: null,
  transfers: [],
  lastBlock: '0',
  oldestLoadedBlock: '0',
  hasMore: true,
};

// Fetch transfer events
export const fetchTransferEvents = createAsyncThunk<FetchTransfersResult, void>(
  'coin100Activity/fetchTransfers',
  async (_, { getState }) => {
    try {
      const web3 = new Web3(POLYGON_RPC);
      const addresses = await fetchContractAddresses();

      const currentBlock = await web3.eth.getBlockNumber();
      const state = getState() as { coin100Activity: ActivityState };

      // Calculate block range
      const fromBlock =
        state.coin100Activity.lastBlock === '0'
          ? Math.max(Number(currentBlock) - BLOCKS_TO_FETCH, 0).toString()
          : state.coin100Activity.lastBlock;

      // Check if contract exists
      const code = await web3.eth.getCode(addresses.c100TokenAddress);

      if (code === '0x') {
        throw new Error('Contract not found at the specified address');
      }

      // Generate Transfer event signature
      const transferEventSignature = web3.utils.sha3(
        'Transfer(address,address,uint256)'
      );
      if (!transferEventSignature) {
        throw new Error('Failed to generate transfer event signature');
      }

      const rawLogs = await web3.eth.getPastLogs({
        address: addresses.c100TokenAddress,
        fromBlock: Number(fromBlock),
        toBlock: 'latest',
        topics: [transferEventSignature],
      });

      // Process events in batches
      const transfers = await processBatch(
        rawLogs,
        BATCH_SIZE,
        async (batchLogs) => {
          const batchTransfers: TransferEvent[] = await Promise.all(
            batchLogs.map(async (rawLog) => {
              const log = rawLog as unknown as Web3TransactionLog;
              const blockNumber = Number(log.blockNumber);
              const timestamp = await getBlockTimestamp(web3, blockNumber);

              const decodedLog = web3.eth.abi.decodeLog(
                [
                  { type: 'address', name: 'from', indexed: true },
                  { type: 'address', name: 'to', indexed: true },
                  { type: 'uint256', name: 'value' },
                ],
                log.data,
                log.topics.slice(1)
              ) as unknown as DecodedTransferLog;

              return {
                from: decodedLog.from,
                to: decodedLog.to,
                amount: web3.utils.fromWei(decodedLog.value, 'ether'),
                timestamp,
                transactionHash: log.transactionHash,
                blockNumber,
              };
            })
          );
          return batchTransfers;
        }
      );

      const oldestBlock =
        transfers.length > 0
          ? Math.min(...transfers.map((t) => t.blockNumber))
          : Number(fromBlock);

      return {
        transfers,
        lastBlock: currentBlock.toString(),
        oldestLoadedBlock: oldestBlock.toString(),
        hasMore: oldestBlock > 0,
      };
    } catch (error) {
      console.error('Error fetching transfer events:', error);
      throw error;
    }
  }
);

const coin100ActivitySlice = createSlice({
  name: 'coin100Activity',
  initialState,
  reducers: {
    clearTransfers: (state) => {
      state.transfers = [];
      state.lastBlock = '0';
      state.oldestLoadedBlock = '0';
      state.hasMore = true;
      blockTimestampCache.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransferEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTransferEvents.fulfilled,
        (state, action: PayloadAction<FetchTransfersResult>) => {
          state.loading = false;
          // Remove duplicates based on transactionHash
          const uniqueTransfers = [
            ...state.transfers,
            ...action.payload.transfers,
          ].reduce((acc, current) => {
            const x = acc.find(
              (item) => item.transactionHash === current.transactionHash
            );
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, [] as TransferEvent[]);

          state.transfers = uniqueTransfers.sort(
            (a, b) => b.timestamp - a.timestamp
          );
          state.lastBlock = action.payload.lastBlock;
          state.oldestLoadedBlock = action.payload.oldestLoadedBlock;
          state.hasMore = action.payload.hasMore;
        }
      )
      .addCase(fetchTransferEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transfer events';
      });
  },
});

export const { clearTransfers } = coin100ActivitySlice.actions;
export default coin100ActivitySlice.reducer;
