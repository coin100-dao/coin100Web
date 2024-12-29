import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Link,
  Divider,
} from '@mui/material';
import { fetchTransferEvents } from '../../store/slices/coin100ActivitySlice';
import { ArrowForward, SwapHoriz } from '@mui/icons-material';
import Web3 from 'web3';
import { TransferEvent } from '../../store/slices/coin100ActivitySlice';

const ActivityLog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { transfers, loading, error, hasMore, oldestLoadedBlock } = useSelector(
    (state: RootState) => {
      return state.coin100Activity;
    }
  );
  const { isConnected } = useSelector((state: RootState) => {
    return state.wallet;
  });

  useEffect(() => {
    if (isConnected) {
      dispatch(fetchTransferEvents({}));
    }
  }, [dispatch, isConnected]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      dispatch(fetchTransferEvents({ fromBlock: oldestLoadedBlock }));
    }
  };

  const formatAmount = (amount: string): string => {
    try {
      const amountInEther = Web3.utils.fromWei(amount, 'ether');
      return Number(amountInEther).toFixed(2);
    } catch (error) {
      console.error('Error formatting amount:', error, amount);
      return '0.00';
    }
  };

  const shortenAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="textSecondary" variant="body2">
          Connect your wallet to view transaction history
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Activity Log
      </Typography>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
        <List sx={{ width: '100%' }} dense>
          {transfers.map((transfer: TransferEvent, index: number) => {
            return (
              <React.Fragment key={transfer.transactionHash}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    flexDirection: 'column',
                    gap: 0.5,
                    py: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      gap: 1,
                    }}
                  >
                    <SwapHoriz color="action" sx={{ fontSize: 20 }} />
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          {formatAmount(transfer.returnValues.value)} C100
                        </Typography>
                      }
                      secondary={
                        <Box
                          component="span"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            component="span"
                          >
                            From: {shortenAddress(transfer.returnValues.from)}
                          </Typography>
                          <ArrowForward
                            sx={{ fontSize: 10, color: 'text.secondary' }}
                          />
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            component="span"
                          >
                            To: {shortenAddress(transfer.returnValues.to)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Link
                      href={`https://polygonscan.com/tx/${transfer.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: 'primary.main',
                        typography: 'caption',
                      }}
                    >
                      View
                      <ArrowForward sx={{ ml: 0.5 }} fontSize="small" />
                    </Link>
                  </Box>
                </ListItem>
                {index < transfers.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            );
          })}
        </List>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <CircularProgress size={20} />
          </Box>
        )}

        {hasMore && !loading && transfers.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Button
              onClick={handleLoadMore}
              variant="outlined"
              size="small"
              disabled={loading}
            >
              Load More
            </Button>
          </Box>
        )}

        {!loading && transfers.length === 0 && (
          <Typography
            color="textSecondary"
            align="center"
            variant="body2"
            sx={{ my: 1 }}
          >
            No transactions found.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ActivityLog;
