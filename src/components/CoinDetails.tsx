// src/components/CoinDetails.tsx

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  useTheme,
  Link,
} from '@mui/material';
import { Language, Twitter } from '@mui/icons-material';

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
      price_change_percentage_24h: number;
      price_change_percentage_7d: number;
      price_change_percentage_30d: number;
    };
    links?: {
      homepage?: string[];
      twitter_screen_name?: string;
    };
  };
}

const CoinDetails: React.FC<Props> = ({ coin }) => {
  const theme = useTheme();

  const PriceChangeChip = ({
    period,
    value,
  }: {
    period: string;
    value: number;
  }) => (
    <Chip
      label={`${period}: ${value.toFixed(2)}%`}
      color={value >= 0 ? 'success' : 'error'}
      sx={{ mr: 1, mb: 1 }}
    />
  );

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <img
            src={coin.image.large}
            alt={coin.name}
            style={{
              width: 64,
              height: 64,
              marginRight: theme.spacing(2),
              filter:
                theme.palette.mode === 'dark' ? 'brightness(0.8)' : 'none',
            }}
          />
          <Box>
            <Typography variant="h4">
              {coin.name} ({coin.symbol.toUpperCase()})
            </Typography>
            <Box sx={{ mt: 1 }}>
              {coin.links?.homepage?.[0] && (
                <Link
                  href={coin.links.homepage[0]}
                  target="_blank"
                  sx={{ mr: 2 }}
                >
                  <Language />
                </Link>
              )}
              {coin.links?.twitter_screen_name && (
                <Link
                  href={`https://twitter.com/${coin.links.twitter_screen_name}`}
                  target="_blank"
                >
                  <Twitter />
                </Link>
              )}
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              variant="outlined"
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                height: '100%',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Price Information
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  ${coin.market_data.current_price.usd.toLocaleString()}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <PriceChangeChip
                    period="24h"
                    value={coin.market_data.price_change_percentage_24h}
                  />
                  <PriceChangeChip
                    period="7d"
                    value={coin.market_data.price_change_percentage_7d}
                  />
                  <PriceChangeChip
                    period="30d"
                    value={coin.market_data.price_change_percentage_30d}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              variant="outlined"
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                height: '100%',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Market Cap
                </Typography>
                <Typography variant="h4" color="secondary">
                  ${(coin.market_data.market_cap.usd / 1e9).toFixed(2)}B
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card
              variant="outlined"
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  About {coin.name}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  {coin.description.en
                    ? coin.description.en.split('. ').slice(0, 3).join('. ') +
                      '.'
                    : 'No description available.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CoinDetails;
