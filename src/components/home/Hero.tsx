import React from 'react';
import { Box, Container, Typography, Button, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import darkLogo from '../../assets/c100-high-resolution-dark-logo-transparent.svg';
import lightLogo from '../../assets/c100-high-resolution-light-logo-transparent.svg';

const GradientText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(2),
}));

const Hero = () => {
  const theme = useTheme();
  const logo = theme.palette.mode === 'dark' ? darkLogo : lightLogo;

  return (
    <Box
      sx={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <GradientText
              variant="h1"
              sx={{ fontWeight: 800, fontSize: { xs: '2.5rem', md: '3.5rem' } }}
            >
              COIN100 (C100)
            </GradientText>
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                opacity: 0.9,
                fontWeight: 500,
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              The Future of Crypto Index Investing
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.8 }}>
              Track the top 100 cryptocurrencies with a single token.
              Simplified. Decentralized. Future-proof.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  borderRadius: '28px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  background: (theme) =>
                    `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                Join ICO
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: '28px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                }}
              >
                Learn More
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={logo}
              alt="COIN100 Logo"
              style={{
                maxWidth: '100%',
                height: 'auto',
                filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.15))',
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
