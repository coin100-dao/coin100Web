import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  LinearProgress,
  Grid,
} from '@mui/material';
import { TrendingUp, AccountBalance, LocalOffer } from '@mui/icons-material';

const Stats: React.FC = () => {
  const theme = useTheme();
  const { totalSold, remainingTokens } = useSelector(
    (state: RootState) => state.publicSale
  );

  const totalSupply = parseFloat(totalSold) + parseFloat(remainingTokens);
  const progress = (parseFloat(totalSold) / totalSupply) * 100;

  const stats = [
    {
      icon: <TrendingUp />,
      label: 'Total Tokens Sold',
      value: `${Number(totalSold).toLocaleString()} C100`,
      color: theme.palette.primary.main,
    },
    {
      icon: <AccountBalance />,
      label: 'Remaining Tokens',
      value: `${Number(remainingTokens).toLocaleString()} C100`,
      color: theme.palette.secondary.main,
    },
    {
      icon: <LocalOffer />,
      label: 'Token Price',
      value: '0.001 USDC',
      color: theme.palette.success.main,
    },
  ];

  return (
    <Card
      elevation={3}
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.background.paper}80 0%, ${theme.palette.background.paper}40 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.palette.primary.dark}40`,
      }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Sale Progress
        </Typography>

        <Box sx={{ mb: 4 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 24,
              borderRadius: 2,
              mb: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              },
            }}
          />
          <Typography
            variant="body2"
            color="textSecondary"
            align="right"
          >{`${progress.toFixed(2)}%`}</Typography>
        </Box>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: `${stat.color}10`,
                  border: `1px solid ${stat.color}40`,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: `${stat.color}20`,
                    color: stat.color,
                    mr: 2,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h6">{stat.value}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Stats;
