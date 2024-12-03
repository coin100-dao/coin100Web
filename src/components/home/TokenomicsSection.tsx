import React from 'react';
import { Box, Typography, Grid, Paper, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import { PieChart } from '@mui/x-charts';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  background:
    theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(0,0,0,0.02)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const TokenomicsSection: React.FC = () => {
  const theme = useTheme();

  const distributionData = [
    {
      id: 0,
      value: 90,
      label: 'Public Sale + Treasury',
      color: theme.palette.primary.main,
    },
    {
      id: 1,
      value: 5,
      label: 'Developer Allocation',
      color: theme.palette.secondary.main,
    },
    {
      id: 2,
      value: 5,
      label: 'Rewards Pool',
      color: theme.palette.success.main,
    },
  ];

  const feeData = [
    {
      id: 0,
      value: 1.2,
      label: 'Developer Fee',
      color: theme.palette.warning.main,
    },
    { id: 1, value: 1.2, label: 'Burn Fee', color: theme.palette.error.main },
    { id: 2, value: 0.6, label: 'Reward Fee', color: theme.palette.info.main },
  ];

  return (
    <Box sx={{ py: 12, px: 4 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Tokenomics
      </Typography>
      <Typography
        variant="h6"
        align="center"
        sx={{ mb: 8, color: 'text.secondary' }}
      >
        Transparent and sustainable token economics
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h5" gutterBottom>
              Token Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <PieChart
                series={[
                  {
                    data: distributionData,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30 },
                  },
                ]}
                height={300}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" align="center">
              Total Supply: 1,000,000,000 C100
            </Typography>
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h5" gutterBottom>
              Transaction Fees
            </Typography>
            <Box sx={{ height: 300 }}>
              <PieChart
                series={[
                  {
                    data: feeData,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30 },
                  },
                ]}
                height={300}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" align="center">
              Total Fee: 3% per transaction
            </Typography>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TokenomicsSection;
