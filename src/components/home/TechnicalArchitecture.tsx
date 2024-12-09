import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/system';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TokenIcon from '@mui/icons-material/Token';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';

const GlassPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  height: '100%',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  '& svg': {
    fontSize: '24px',
    color: theme.palette.common.white,
  },
}));

const TechnicalArchitecture = () => {
  return (
    <Box
      sx={{
        py: 10,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: (theme) =>
                `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Technical Architecture
          </Typography>
          <Typography
            variant="h5"
            sx={{ opacity: 0.8, maxWidth: '800px', mx: 'auto' }}
          >
            Built with security, scalability, and efficiency in mind
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <GlassPaper>
              <IconWrapper>
                <AccountTreeIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Polygon Network
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, opacity: 0.8 }}>
                Built on Polygon for:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  Low transaction fees
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  High throughput capacity
                </Typography>
                <Typography component="li" variant="body1">
                  Fast confirmation times
                </Typography>
              </Box>
            </GlassPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <GlassPaper>
              <IconWrapper>
                <TokenIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                C100 Token Contract
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, opacity: 0.8 }}>
                Core features include:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  ERC20 compliance
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  Rebase functionality
                </Typography>
                <Typography component="li" variant="body1">
                  Ownership controls
                </Typography>
              </Box>
            </GlassPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <GlassPaper>
              <IconWrapper>
                <StorageIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Scaling Solution
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, opacity: 0.8 }}>
                Efficient data handling:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  GonsPerFragment scaling
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  Optimized storage
                </Typography>
                <Typography component="li" variant="body1">
                  Gas-efficient operations
                </Typography>
              </Box>
            </GlassPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <GlassPaper>
              <IconWrapper>
                <SecurityIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Security Features
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, opacity: 0.8 }}>
                Multiple security layers:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  Reentrancy guards
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                  Pause mechanisms
                </Typography>
                <Typography component="li" variant="body1">
                  Access controls
                </Typography>
              </Box>
            </GlassPaper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default TechnicalArchitecture;