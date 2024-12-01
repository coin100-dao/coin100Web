// src/components/CoinDetails.tsx

import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

interface Props {
  coin: {
    id: string;
    symbol: string;
    name: string;
    description: { en: string };
    image: { large: string };
    market_data: {
      current_price: { usd: number };
      market_cap: { usd: number };
    };
  };
}

const CoinDetails: React.FC<Props> = ({ coin }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <img src={coin.image.large} alt={coin.name} width={50} height={50} />
        <Typography variant="h4" sx={{ ml: 2 }}>
          {coin.name} ({coin.symbol.toUpperCase()})
        </Typography>
      </Box>
      <Typography variant="h6">
        Current Price: ${coin.market_data.current_price.usd.toLocaleString()}
      </Typography>
      <Typography variant="h6">
        Market Cap: ${coin.market_data.market_cap.usd.toLocaleString()}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="body1">
        {coin.description.en
          ? coin.description.en.split('. ')[0] + '.'
          : 'No description available.'}
      </Typography>
      {/* Placeholder for Chart */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Price Chart (Coming Soon)</Typography>
        <Box
          sx={{
            width: '100%',
            height: 300,
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography>Chart Placeholder</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CoinDetails;
