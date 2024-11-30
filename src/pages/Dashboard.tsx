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
  connectBankAccount,
  fetchFincityAccounts,
  fetchFincityTransactions,
  clearFincityError,
} from '../store/slices/fincitySlice';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const { accounts, transactions, loading, error } = useAppSelector(
    (state) => state.fincity
  );
  const userInfo = useAppSelector((state) => state.auth.user);

  // Fetch Fincity accounts on component mount
  useEffect(() => {
    if (token) {
      dispatch(fetchFincityAccounts());
    }
  }, [token, dispatch]);

  // Handler for Connect Bank Account button click
  const handleConnectBankAccount = async () => {
    try {
      console.log('Attempting to connect bank account...');
      const resultAction = await dispatch(connectBankAccount()).unwrap();
      const { redirectUrl } = resultAction;
      console.log('Redirect URL received:', redirectUrl);
      // Redirect the user to Fincity's connection URL
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('Error connecting bank account:', err);
    }
  };

  // Handler for clearing errors
  const handleClearError = () => {
    dispatch(clearFincityError());
  };

  // Handler to fetch transactions for a specific account
  const handleFetchTransactions = (accountId: string) => {
    dispatch(fetchFincityTransactions(accountId));
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
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Bank Account'}
        </Button>
      </Box>

      {/* Loading State for Fetching Accounts */}
      {loading && (
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
      {!loading && accounts.length > 0 && (
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
                  <TableCell>Connection Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{account.accountName}</TableCell>
                    <TableCell>{account.accountType}</TableCell>
                    <TableCell>{account.connectionStatus}</TableCell>
                    <TableCell>
                      {new Date(account.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {account.connectionStatus === 'connected' && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            handleFetchTransactions(account.fincityAccountId)
                          }
                        >
                          View Transactions
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Transactions Section */}
          {accounts.map(
            (account) =>
              transactions[account.fincityAccountId] && (
                <Box key={account.fincityAccountId} mt={4}>
                  <Typography variant="h6" gutterBottom>
                    Transactions for {account.accountName}
                  </Typography>
                  {transactions[account.fincityAccountId].length > 0 ? (
                    <TableContainer component={Paper}>
                      <Table aria-label="transactions table">
                        <TableHead>
                          <TableRow>
                            <TableCell>Transaction ID</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Currency</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {transactions[account.fincityAccountId].map((txn) => (
                            <TableRow key={txn.id}>
                              <TableCell>{txn.fincityTransactionId}</TableCell>
                              <TableCell>${txn.amount.toFixed(2)}</TableCell>
                              <TableCell>{txn.currency}</TableCell>
                              <TableCell>{txn.description || 'N/A'}</TableCell>
                              <TableCell>
                                {new Date(
                                  txn.transactionDate
                                ).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography>No transactions available.</Typography>
                  )}
                </Box>
              )
          )}
        </Box>
      )}

      {/* No Connected Accounts Message */}
      {!loading && accounts.length === 0 && (
        <Box mt={4}>
          <Typography>No bank accounts connected yet.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
