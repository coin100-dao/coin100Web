import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchTransferEvents } from '../../store/slices/coin100ActivitySlice';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  CircularProgress,
  Link,
  useTheme,
  Alert,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import {
  SwapHoriz,
  CallMade,
  CallReceived,
  OpenInNew,
} from '@mui/icons-material';

const ActivityLog: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { transfers, loading, error } = useSelector(
    (state: RootState) => state.coin100Activity
  );

  useEffect(() => {
    dispatch(fetchTransferEvents());
    const interval = setInterval(() => {
      dispatch(fetchTransferEvents());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.background.paper}90 0%, ${theme.palette.background.paper}60 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        '& .MuiCardContent-root': {
          p: 0,
        },
      }}
    >
      <CardContent>
        {loading && (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress size={24} thickness={4} />
          </Box>
        )}
        {error && (
          <Alert
            severity="error"
            sx={{
              m: 2,
              borderRadius: 1,
            }}
          >
            {error}
          </Alert>
        )}
        {!loading && transfers.length === 0 ? (
          <Alert
            severity="info"
            sx={{
              m: 2,
              borderRadius: 1,
            }}
          >
            No transactions found.
          </Alert>
        ) : (
          <List
            sx={{
              maxHeight: 400,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.divider,
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: theme.palette.action.hover,
              },
            }}
          >
            {transfers.map((transfer, index) => (
              <ListItem
                key={`${transfer.transactionHash}-${index}`}
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '&:last-child': { borderBottom: 'none' },
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: `${theme.palette.action.hover}40`,
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  width="100%"
                >
                  <Box
                    sx={{
                      minWidth: 140,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <SwapHoriz
                      sx={{
                        color: theme.palette.primary.main,
                        backgroundColor: `${theme.palette.primary.main}20`,
                        p: 0.5,
                        borderRadius: 1,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontFamily: 'monospace',
                      }}
                    >
                      {transfer.amount} C100
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      flex: 1,
                      backgroundColor: `${theme.palette.background.paper}60`,
                      borderRadius: 1,
                      py: 0.5,
                      px: 1,
                    }}
                  >
                    <Tooltip title="From Address">
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <CallMade
                          sx={{
                            fontSize: 14,
                            color: theme.palette.success.main,
                          }}
                        />
                        <Link
                          href={`https://polygonscan.com/address/${transfer.from}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: theme.palette.text.secondary,
                            textDecoration: 'none',
                            fontFamily: 'monospace',
                            '&:hover': {
                              color: theme.palette.primary.main,
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          {formatAddress(transfer.from)}
                        </Link>
                      </Box>
                    </Tooltip>

                    <Box
                      sx={{
                        mx: 1,
                        color: theme.palette.text.disabled,
                        fontSize: '1.2rem',
                      }}
                    >
                      →
                    </Box>

                    <Tooltip title="To Address">
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <CallReceived
                          sx={{ fontSize: 14, color: theme.palette.error.main }}
                        />
                        <Link
                          href={`https://polygonscan.com/address/${transfer.to}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: theme.palette.text.secondary,
                            textDecoration: 'none',
                            fontFamily: 'monospace',
                            '&:hover': {
                              color: theme.palette.primary.main,
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          {formatAddress(transfer.to)}
                        </Link>
                      </Box>
                    </Tooltip>
                  </Stack>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{
                      ml: 'auto',
                      minWidth: 180,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontStyle: 'italic',
                      }}
                    >
                      {formatDistanceToNow(transfer.timestamp * 1000, {
                        addSuffix: true,
                      })}
                    </Typography>
                    <Tooltip title="View on PolygonScan">
                      <IconButton
                        component={Link}
                        href={`https://polygonscan.com/tx/${transfer.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{
                          color: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: `${theme.palette.primary.main}20`,
                          },
                        }}
                      >
                        <OpenInNew sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
