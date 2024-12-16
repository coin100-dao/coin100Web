import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  People,
  LocalAtm,
} from '@mui/icons-material';

const Stats: React.FC = () => {
  const theme = useTheme();
  const { totalSold, remainingTokens } = useSelector(
    (state: RootState) => state.ico
  );

  const totalSupply = parseFloat(totalSold) + parseFloat(remainingTokens);
  const participationRate = (
    (parseFloat(totalSold) / totalSupply) *
    100
  ).toFixed(2);

  const statsData = [
    {
      icon: <TrendingUp />,
      title: 'Total Supply',
      value: `${totalSupply.toLocaleString()} C100`,
      color: theme.palette.primary.main,
    },
    {
      icon: <AccountBalance />,
      title: 'Tokens Sold',
      value: `${parseFloat(totalSold).toLocaleString()} C100`,
      color: theme.palette.success.main,
    },
    {
      icon: <LocalAtm />,
      title: 'Remaining Tokens',
      value: `${parseFloat(remainingTokens).toLocaleString()} C100`,
      color: theme.palette.warning.main,
    },
    {
      icon: <People />,
      title: 'Participation Rate',
      value: `${participationRate}%`,
      color: theme.palette.info.main,
    },
  ];

  return (
    <Card
      sx={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Sale Statistics
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {statsData.map((stat, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
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
                    bgcolor: `${stat.color}22`,
                    color: stat.color,
                    mr: 2,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {stat.title}
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
