import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Link,
  useTheme,
  Divider,
} from '@mui/material';
import { fetchTransferEvents } from '../../store/slices/coin100ActivitySlice';
import { ArrowForward, SwapHoriz } from '@mui/icons-material';
import Web3 from 'web3';
import { TransferEvent } from '../../store/slices/coin100ActivitySlice';

const ActivityLog: React.FC = () => {
  const theme = useTheme();
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
      <Card
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: theme.shadows[10],
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Activity Log
          </Typography>
          <Typography color="textSecondary">
            Connect your wallet to view transaction history
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        boxShadow: theme.shadows[10],
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Activity Log
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <List sx={{ width: '100%' }}>
          {transfers.map((transfer: TransferEvent, index: number) => {
            return (
              <React.Fragment key={transfer.transactionHash}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    flexDirection: 'column',
                    gap: 1,
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
                    <SwapHoriz color="action" />
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
                            gap: 1,
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
                            sx={{ fontSize: 12, color: 'text.secondary' }}
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
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {hasMore && !loading && transfers.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
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
          <Typography color="textSecondary" align="center" sx={{ my: 2 }}>
            No transactions found.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
