import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  Divider,
  Grid,
} from '@mui/material';
import {
  Security,
  AccountBalance,
  Speed,
  AutoGraph,
} from '@mui/icons-material';

const ProjectInfo: React.FC = () => {
  const theme = useTheme();

  const features = [
    {
      icon: (
        <Security sx={{ fontSize: 24, color: theme.palette.primary.main }} />
      ),
      title: 'Secure',
      description: 'Audited smart contracts',
    },
    {
      icon: <Speed sx={{ fontSize: 24, color: theme.palette.primary.main }} />,
      title: 'Fast',
      description: 'Low-cost transactions',
    },
    {
      icon: (
        <AccountBalance
          sx={{ fontSize: 24, color: theme.palette.primary.main }}
        />
      ),
      title: 'Tokenomics',
      description: 'Deflationary model',
    },
    {
      icon: (
        <AutoGraph sx={{ fontSize: 24, color: theme.palette.primary.main }} />
      ),
      title: 'Growth',
      description: 'Automatic liquidity',
    },
  ];

  return (
    <Card
      sx={{
        background: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              About COIN100
            </Typography>
            <Typography variant="body2">
              COIN100 is a revolutionary DeFi protocol built on Polygon,
              designed to provide sustainable yield through innovative
              tokenomics and cutting-edge technology.
            </Typography>
          </Box>

          <Divider />

          <Grid container spacing={2}>
            {features.map((feature, index) => (
              <Grid item xs={6} key={index}>
                <Box display="flex" alignItems="flex-start" gap={1}>
                  {feature.icon}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {feature.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProjectInfo;
