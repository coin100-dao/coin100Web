import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';
import { useAppDispatch } from '../../store/hooks';
import { connectWallet } from '../../store/slices/web3Slice';

const HeroContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
    animation: 'pulse 4s ease-in-out infinite',
  },
  '@keyframes pulse': {
    '0%': { opacity: 0.5 },
    '50%': { opacity: 1 },
    '100%': { opacity: 0.5 },
  },
}));

const GlowingText = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  textShadow: '0 0 20px rgba(255,255,255,0.5)',
  fontWeight: 700,
  marginBottom: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '28px',
  padding: '12px 32px',
  fontSize: '1.1rem',
  textTransform: 'none',
  background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.2)',
  color: theme.palette.primary.contrastText,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    background: 'rgba(255,255,255,0.2)',
    transform: 'scale(1.05)',
  },
}));

const HeroSection: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <HeroContainer>
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: '800px',
          px: 3,
        }}
      >
        <GlowingText variant="h1" gutterBottom>
          COIN100
        </GlowingText>
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 300,
          }}
        >
          The First Decentralized Cryptocurrency Index Fund
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mb: 6,
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          Gain exposure to the top 100 cryptocurrencies through a single token
        </Typography>
        <StyledButton onClick={() => dispatch(connectWallet())} size="large">
          Connect Wallet
        </StyledButton>
      </Box>
    </HeroContainer>
  );
};

export default HeroSection;
