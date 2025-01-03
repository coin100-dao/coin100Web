import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  Box,
  Container,
  Grid,
  useTheme,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  fetchPublicSaleData,
  initializeContractData,
} from '../store/slices/publicSaleSlice';
import { connectWallet } from '../store/slices/walletSlice';
import { BuySection } from '../components/sale/BuySection';
import SaleInfo from '../components/sale/SaleInfo';
import Stats from '../components/sale/Stats';
import { AccountBalanceWallet } from '@mui/icons-material';
import MetaMaskPopup from '../components/wallet/MetaMaskPopup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet,
  faRightLeft,
  faCoins,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

const PublicSale: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);

  const { loading, error, isInitialized } = useSelector(
    (state: RootState) => state.publicSale
  );
  const { address: walletAddress, isConnected } = useSelector(
    (state: RootState) => state.wallet
  );

  useEffect(() => {
    const init = async () => {
      try {
        if (!isInitialized) {
          await dispatch(initializeContractData()).unwrap();
        }

        // After initialization, try to fetch data if wallet is connected
        if (isConnected && walletAddress) {
          dispatch(fetchPublicSaleData());
        }
      } catch (error) {
        console.error('Failed to initialize contract data:', error);
      }
    };
    init();
  }, [dispatch, isInitialized, walletAddress, isConnected]);

  useEffect(() => {
    if (isInitialized && isConnected && walletAddress) {
      dispatch(fetchPublicSaleData());

      // Set up interval
      const interval = setInterval(() => {
        dispatch(fetchPublicSaleData());
      }, 15000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [dispatch, walletAddress, isInitialized, isConnected]);

  const handleConnectClick = () => {
    setConnectDialogOpen(true);
  };

  const handleConnectSuccess = async () => {
    try {
      await dispatch(connectWallet()).unwrap();
      setConnectDialogOpen(false);
      dispatch(fetchPublicSaleData());
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 4, md: 6 },
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.paper} 50%, ${theme.palette.secondary.dark} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${theme.palette.background.paper}40 0%, ${theme.palette.background.default} 100%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box mb={6} textAlign="center">
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              position: 'relative',
              zIndex: 1,
              textShadow: `0 2px 10px ${theme.palette.primary.main}40`,
            }}
          >
            COIN100 Public Sale
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: theme.palette.text.primary }}
            gutterBottom
          >
            Your Gateway to the Top 100 Cryptocurrencies
          </Typography>

          {/* Contract Information */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 3,
              mt: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: 'background.paper',
                p: 1.5,
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: theme.palette.common.white,
                  bgcolor: theme.palette.primary.main,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                COIN100 Token Contract
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.8rem',
                    color: theme.palette.text.primary,
                    fontFamily: 'monospace',
                  }}
                >
                  0x3c5034f0b8e9ecb0aa13ef96adf9d97fb0107eec
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() =>
                    window.open(
                      'https://polygonscan.com/token/0x3c5034f0b8e9ecb0aa13ef96adf9d97fb0107eec',
                      '_blank'
                    )
                  }
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  View
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: 'background.paper',
                p: 1.5,
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: theme.palette.common.white,
                  bgcolor: theme.palette.secondary.main,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                Public Sale Contract
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.8rem',
                    color: theme.palette.text.primary,
                    fontFamily: 'monospace',
                  }}
                >
                  0xaf4fc2742cea373ec18f17a601e64a74aeebb0cc
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() =>
                    window.open(
                      'https://polygonscan.com/address/0xaf4fc2742cea373ec18f17a601e64a74aeebb0cc',
                      '_blank'
                    )
                  }
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  View
                </Button>
              </Box>
            </Box>
          </Box>

          {loading && <LinearProgress sx={{ mt: 2 }} />}
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>

        {!isConnected ? (
          <Card
            sx={{
              maxWidth: 600,
              mx: 'auto',
              textAlign: 'center',
              p: 4,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              boxShadow: theme.shadows[10],
            }}
          >
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Connect Your Wallet
              </Typography>
              <Typography color="textSecondary" paragraph>
                Please connect your wallet to participate in the COIN100 public
                sale.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleConnectClick}
                startIcon={<AccountBalanceWallet />}
                disabled={loading}
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Stats />
            </Grid>
            <Grid item xs={12} md={8}>
              <BuySection />
            </Grid>
            <Grid item xs={12} md={4}>
              <SaleInfo />
            </Grid>
          </Grid>
        )}

        {/* How to Buy Section */}
        <Box
          sx={{
            mt: 8,
            pt: 6,
            pb: 4,
            borderTop: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h3"
            textAlign="center"
            sx={{
              mb: 6,
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            🚀 How to Buy C100
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {[
              {
                icon: faWallet,
                title: 'Get Some POL',
                description:
                  'Purchase POL (ex-MATIC) from your favorite exchange like Binance or Coinbase',
                highlight:
                  'Pro tip: Make sure to withdraw to Polygon network! 💜',
              },
              {
                icon: faRightLeft,
                title: 'Swap to USDC',
                description:
                  'Use QuickSwap or Uniswap to convert your POL to USDC or USDC.e',
                highlight: 'Both USDC variants work! 🔄',
              },
              {
                icon: faCoins,
                title: 'Buy C100',
                description:
                  'Connect your wallet and use your USDC to buy C100 tokens',
                highlight: 'Welcome to the future of crypto indexing! ✨',
              },
            ].map((step, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    height: '100%',
                    p: 3,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Step Number */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -15,
                      left: -15,
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      boxShadow: 2,
                    }}
                  >
                    {index + 1}
                  </Box>

                  {/* Icon */}
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: `${theme.palette.primary.main}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={step.icon}
                      style={{
                        fontSize: '1.8rem',
                        color: theme.palette.primary.main,
                      }}
                    />
                  </Box>

                  {/* Content */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {step.title}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      color: theme.palette.text.secondary,
                      flexGrow: 1,
                    }}
                  >
                    {step.description}
                  </Typography>

                  {/* Highlight with arrow icon */}
                  <Box
                    sx={{
                      p: 1,
                      bgcolor: `${theme.palette.secondary.main}15`,
                      borderRadius: 1,
                      color: theme.palette.secondary.main,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowRight} size="sm" />
                    <Typography variant="body2">{step.highlight}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* MetaMask Popup */}
      <MetaMaskPopup
        open={connectDialogOpen}
        onClose={() => setConnectDialogOpen(false)}
        onSuccess={handleConnectSuccess}
      />
    </Box>
  );
};

export default PublicSale;
