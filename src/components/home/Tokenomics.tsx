import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/system';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const GlassPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  height: '100%',
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

const Tokenomics = () => {
  return (
    <Box
      sx={{
        py: 10,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
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
            Tokenomics
          </Typography>
          <Typography
            variant="h5"
            sx={{ opacity: 0.8, maxWidth: '800px', mx: 'auto' }}
          >
            Understanding the economic model behind COIN100
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <GlassPaper>
              <IconWrapper>
                <PieChartIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Token Distribution
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • 97% Public Sale (ICO)
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 2 }}>
                  Fair distribution model with majority allocated to public sale
                </Typography>
              </Box>
            </GlassPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <GlassPaper>
              <IconWrapper>
                <TimelineIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Rebase Mechanism
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Global supply adjustments
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Proportional balance changes
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 2 }}>
                  Automatic adjustments to reflect market cap changes
                </Typography>
              </Box>
            </GlassPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <GlassPaper>
              <IconWrapper>
                <TrendingUpIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Market Dynamics
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Price stability mechanism
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Market cap tracking
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 2 }}>
                  Designed for long-term market alignment
                </Typography>
              </Box>
            </GlassPaper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Rebase Formula
          </Typography>
          <Paper
            sx={{
              p: 3,
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 600,
                color: (theme) => theme.palette.primary.main,
              }}
            >
              New Supply = Old Supply × (M_new / M_old)
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Tokenomics;
