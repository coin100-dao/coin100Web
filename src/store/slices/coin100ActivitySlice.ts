import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { executeContractCall, getWeb3Instance } from '../../utils/web3Utils';
import { fetchContractAddresses } from '../../services/github';
import type { AbiParameter } from 'web3';

// Constants
const BLOCKS_TO_FETCH = 50000; // Look back 50k blocks by default

// Types
export interface TransferEvent {
  returnValues: {
    from: string;
    to: string;
    value: string;
  };
  transactionHash: string;
  blockNumber: number;
  event: string;
  signature: string;
  address: string;
}

interface Web3Log {
  address: string;
  data: string;
  topics: string[];
  blockNumber: bigint;
  transactionHash: string;
  logIndex: bigint;
  blockHash: string;
  transactionIndex: bigint;
  removed: boolean;
}

interface ActivityState {
  loading: boolean;
  error: string | null;
  transfers: TransferEvent[];
  lastBlock: number;
  oldestLoadedBlock: number;
  hasMore: boolean;
}

// Initial state
const initialState: ActivityState = {
  loading: false,
  error: null,
  transfers: [],
  lastBlock: 0,
  oldestLoadedBlock: 0,
  hasMore: true,
};

// Helper function to calculate block range
const calculateBlockRange = async (
  web3: ReturnType<typeof getWeb3Instance>,
  lastLoadedBlock: number
) => {
  const currentBlockBigInt = await web3.eth.getBlockNumber();
  const currentBlock = Number(currentBlockBigInt);

  if (lastLoadedBlock === 0) {
    // First load - fetch last BLOCKS_TO_FETCH blocks
    const fromBlock = Math.max(currentBlock - BLOCKS_TO_FETCH, 0);
    return {
      fromBlock,
      toBlock: currentBlock,
      hasMore: fromBlock > 0,
    };
  }

  // Subsequent loads - fetch from last loaded block
  return {
    fromBlock: Math.max(lastLoadedBlock - BLOCKS_TO_FETCH, 0),
    toBlock: lastLoadedBlock,
    hasMore: lastLoadedBlock > BLOCKS_TO_FETCH,
  };
};

interface TransferEventsResult {
  events: TransferEvent[];
  lastBlock: number;
  oldestLoadedBlock: number;
  hasMore: boolean;
}

// Fetch transfer events
export const fetchTransferEvents = createAsyncThunk<
  TransferEventsResult,
  { fromBlock?: number; toBlock?: number } | undefined,
  { state: { coin100Activity: ActivityState } }
>('activity/fetchTransferEvents', async (params = {}, { getState }) => {
  try {
    const web3 = getWeb3Instance();

    // Get addresses from GitHub
    const addresses = await fetchContractAddresses();
    const tokenAddress = addresses.c100TokenAddress;

    if (!tokenAddress) {
      throw new Error('Token address not configured');
    }

    // Get the last block from state
    const state = getState();
    const { lastBlock } = state.coin100Activity;

    // Calculate block range if not provided
    const blockRange =
      params.fromBlock !== undefined && params.toBlock !== undefined
        ? {
            fromBlock: params.fromBlock,
            toBlock: params.toBlock,
            hasMore: false,
          }
        : await calculateBlockRange(web3, lastBlock);

    const transferEventSignature = web3.utils.sha3(
      'Transfer(address,address,uint256)'
    );

    if (!transferEventSignature) {
      throw new Error('Failed to generate transfer event signature');
    }

    const logs = (await executeContractCall(() =>
      web3.eth.getPastLogs({
        address: tokenAddress,
        topics: [transferEventSignature],
        fromBlock: blockRange.fromBlock,
        toBlock: blockRange.toBlock,
      })
    )) as Web3Log[];

    const events = logs.map((log) => {
      const decodedLog = web3.eth.abi.decodeLog(
        [
          { type: 'address', name: 'from', indexed: true },
          { type: 'address', name: 'to', indexed: true },
          { type: 'uint256', name: 'value' },
        ] as AbiParameter[],
        log.data,
        log.topics.slice(1)
      );

      // Convert BigInt value to string
      const value =
        typeof decodedLog.value === 'bigint'
          ? decodedLog.value.toString()
          : decodedLog.value;

      return {
        returnValues: {
          from: decodedLog.from,
          to: decodedLog.to,
          value,
        },
        transactionHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
        event: 'Transfer',
        signature: transferEventSignature,
        address: log.address,
      } as TransferEvent;
    });

    // Sort events by block number in descending order
    events.sort((a, b) => b.blockNumber - a.blockNumber);

    return {
      events,
      lastBlock: blockRange.toBlock,
      oldestLoadedBlock: blockRange.fromBlock,
      hasMore: blockRange.hasMore,
    };
  } catch (error) {
    console.error('Error in fetchTransferEvents:', error);
    throw error;
  }
});

// Activity Slice
const coin100ActivitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    resetActivityState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransferEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransferEvents.fulfilled, (state, action) => {
        state.loading = false;
        // Remove duplicates when adding new events
        const uniqueEvents = [
          ...state.transfers,
          ...action.payload.events,
        ].reduce((acc, current) => {
          const exists = acc.find(
            (item) => item.transactionHash === current.transactionHash
          );
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, [] as TransferEvent[]);

        // Sort by block number in descending order
        state.transfers = uniqueEvents.sort(
          (a, b) => b.blockNumber - a.blockNumber
        );
        state.lastBlock = action.payload.lastBlock;
        state.oldestLoadedBlock = action.payload.oldestLoadedBlock;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchTransferEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transfer events';
      });
  },
});

export const { resetActivityState } = coin100ActivitySlice.actions;
export default coin100ActivitySlice.reducer;
