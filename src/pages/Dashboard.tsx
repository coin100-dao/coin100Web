// src/components/Dashboard.tsx

import React from 'react';
import { Tabs, Tab, Box, useTheme, useMediaQuery } from '@mui/material';
import Market from '../components/Market';
import Coin100 from '../components/Coin100';

const Dashboard: React.FC = () => {
  const [value, setValue] = React.useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant={isMobile ? 'scrollable' : 'fullWidth'}
        scrollButtons="auto"
        aria-label="dashboard tabs"
      >
        <Tab label="Market" />
        <Tab label="COIN100" />
      </Tabs>

      {value === 0 && (
        <Box sx={{ p: 2 }}>
          <Market />
        </Box>
      )}
      {value === 1 && (
        <Box sx={{ p: 2 }}>
          <Coin100 />
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
