import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';

interface SaleInfoProps {
  polRate: string;
  isActive: boolean;
  isFinalized: boolean;
  startTime: number;
  endTime: number;
}

const SaleInfo: React.FC<SaleInfoProps> = ({
  polRate,
  isActive,
  isFinalized,
  startTime,
  endTime,
}) => {
  const theme = useTheme();
  const getStatusChip = () => {
    if (isFinalized) {
      return <Chip label="Finalized" color="error" />;
    }
    if (isActive) {
      return <Chip label="Active" color="success" />;
    }
    if (Date.now() < startTime * 1000) {
      return <Chip label="Not Started" color="warning" />;
    }
    return <Chip label="Ended" color="error" />;
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        background: theme.palette.background.paper,
        borderRadius: 2,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Sale Information</Typography>
        {getStatusChip()}
      </Box>

      <Divider sx={{ my: 2 }} />

      <List disablePadding>
        <ListItem>
          <ListItemText
            primary="Exchange Rate"
            secondary={`1 POL = ${polRate} C100`}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Start Date"
            secondary={format(startTime * 1000, 'PPpp')}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="End Date"
            secondary={format(endTime * 1000, 'PPpp')}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Token Distribution"
            secondary="97% Public Sale, 3% Development & Liquidity"
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Token Utility"
            secondary="Index fund tracking top 100 cryptocurrencies"
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Rebase Mechanism"
            secondary="Automatic supply adjustment to track market cap index"
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Liquidity Provider Rewards"
            secondary="10% of transaction fees"
          />
        </ListItem>
      </List>

      {!isFinalized && (
        <Box mt={2}>
          <Typography variant="body2" color="textSecondary">
            * Unsold tokens will be burned after sale ends
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default SaleInfo;
