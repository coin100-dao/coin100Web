import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';
import Grid from '@mui/material/Grid';
import TimerIcon from '@mui/icons-material/Timer';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import GroupIcon from '@mui/icons-material/Group';

const GlassPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
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

const ICOHero = () => {
  return (
    <Box
      sx={{
        py: 2,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 11 }}>
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
            Initial Coin Offering
          </Typography>
          <Typography
            variant="h5"
            sx={{ opacity: 0.8, maxWidth: '800px', mx: 'auto' }}
          >
            Be part of the future of crypto index investing
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <GlassPaper>
              <IconWrapper>
                <TimerIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                ICO Timeline
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Start Date: January 1, 2025
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Duration: 12 months
                </Typography>
                <Typography variant="body1">
                  • Unsold tokens will be burned
                </Typography>
              </Box>
            </GlassPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <GlassPaper>
              <IconWrapper>
                <LocalOfferIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Token Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Token: COIN100 (C100)
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Network: Polygon
                </Typography>
                <Typography variant="body1">• Accept: USDC</Typography>
              </Box>
            </GlassPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <GlassPaper>
              <IconWrapper>
                <GroupIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Participation
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Min: No Minimum
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Max: No limit
                </Typography>
                <Typography variant="body1">• KYC: Not required</Typography>
              </Box>
            </GlassPaper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ICOHero;
