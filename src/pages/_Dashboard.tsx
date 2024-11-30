// src/pages/Dashboard.tsx
import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  createLinkToken,
  exchangePublicToken,
  fetchPlaidAccounts,
  clearPlaidError,
} from '../store/slices/plaidSlice';
import { usePlaidLink } from 'react-plaid-link';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const { accounts, linkToken, connecting, fetching, error } = useAppSelector(
    (state) => state.plaid
  );
  const userInfo = useAppSelector((state) => state.auth.user);

  // Fetch Plaid accounts and create Link token on component mount
  useEffect(() => {
    if (token) {
      dispatch(createLinkToken());
      dispatch(fetchPlaidAccounts());
    }
  }, [token, dispatch]);

  // Handler for when Plaid Link successfully obtains a public token
  const onSuccess = async (public_token: string) => {
    try {
      await dispatch(
        exchangePublicToken({ publicToken: public_token })
      ).unwrap();
      // Fetch updated accounts after successful token exchange
      dispatch(fetchPlaidAccounts());
    } catch (err) {
      console.error('Error exchanging public token:', err);
    }
  };

  // Initialize Plaid Link using the usePlaidLink hook
  const { open, ready } = usePlaidLink({
    token: linkToken || '',
    onSuccess,
    onExit: (err) => {
      if (err) {
        console.error('Plaid Link Error:', err);
      }
      // Optionally handle user exiting the Link flow
      // For example, you can show a notification or log the event
    },
    // Optionally, add additional configurations here
  });

  // Handle Connect Bank Account button click
  const handleConnectBankAccount = () => {
    open();
  };

  // Handle clearing errors
  const handleClearError = () => {
    dispatch(clearPlaidError());
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" gutterBottom>
        Welcome, {userInfo?.name || 'User'}!
      </Typography>
      <Typography variant="body2" gutterBottom>
        Email: {userInfo?.email}
      </Typography>

      {/* Connect Bank Account Button */}
      <Box mt={4} mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConnectBankAccount}
          disabled={!ready || connecting}
        >
          {connecting ? 'Connecting...' : 'Connect Bank Account'}
        </Button>
      </Box>

      {/* Loading State for Fetching Accounts */}
      {fetching && (
        <Box display="flex" justifyContent="center" alignItems="center" my={4}>
          <CircularProgress />
          <Typography ml={2}>Loading bank accounts...</Typography>
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Box my={2}>
          <Alert severity="error" onClose={handleClearError}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Connected Bank Accounts Table */}
      {!fetching && accounts.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Connected Bank Accounts
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="bank accounts table">
              <TableHead>
                <TableRow>
                  <TableCell>Account Name</TableCell>
                  <TableCell>Account Type</TableCell>
                  <TableCell>Available Balance</TableCell>
                  <TableCell>Current Balance</TableCell>
                  <TableCell>Currency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.account_id}>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>{account.type}</TableCell>
                    <TableCell>
                      {account.balances.available !== null
                        ? `$${account.balances.available.toFixed(2)}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {account.balances.current !== null
                        ? `$${account.balances.current.toFixed(2)}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {account.balances.iso_currency_code || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* No Connected Accounts Message */}
      {!fetching && accounts.length === 0 && (
        <Box mt={4}>
          <Typography>No bank accounts connected yet.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
