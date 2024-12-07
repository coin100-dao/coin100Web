import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Paper,
} from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { CoinData } from '../../services/api';

interface CoinListProps {
  onCoinSelect: (coin: CoinData) => void;
  selectedCoin?: CoinData | null;
}

const CoinList: React.FC<CoinListProps> = ({ onCoinSelect, selectedCoin }) => {
  const { allCoins } = useAppSelector((state) => state.coin100);

  return (
    <Paper elevation={3} sx={{ height: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Coins</Typography>
      </Box>
      <List
        sx={{
          overflow: 'auto',
          height: 'calc(100% - 60px)',
          '&::-webkit-scrollbar': {
            width: '0.4em',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
          },
        }}
      >
        {allCoins.map((coin) => (
          <ListItem key={coin.id} disablePadding>
            <ListItemButton
              selected={selectedCoin?.id === coin.id}
              onClick={() => onCoinSelect(coin)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <img
                  src={coin.image}
                  alt={coin.name}
                  style={{ width: 24, height: 24 }}
                />
              </ListItemIcon>
              <ListItemText
                primary={coin.symbol.toUpperCase()}
                secondary={
                  <Typography variant="body2" color="textSecondary">
                    ${coin.current_price.toLocaleString()}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default CoinList;
