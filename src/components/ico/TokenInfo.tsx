import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  useTheme,
  Tooltip,
} from '@mui/material';
import { Token, Schedule, SwapHoriz, Percent } from '@mui/icons-material';

const TokenInfo: React.FC = () => {
  const theme = useTheme();
  const {
    totalSupply,
    rebaseFrequency,
    transferFeeBasisPoints,
    lpRewardPercentage,
  } = useSelector((state: RootState) => state.web3);

  const InfoItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    tooltip?: string;
  }> = ({ icon, label, value, tooltip }) => {
    const content = (
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        {icon}
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {value}
          </Typography>
        </Box>
      </Box>
    );

    return tooltip ? (
      <Tooltip title={tooltip} arrow placement="top">
        {content}
      </Tooltip>
    ) : (
      content
    );
  };

  if (!totalSupply) return null;

  return (
    <Card
      sx={{
        background: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Token Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <InfoItem
              icon={<Token color="primary" />}
              label="Total Supply"
              value={Number(totalSupply).toLocaleString()}
              tooltip="Current total supply of COIN100 tokens"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem
              icon={<Schedule color="primary" />}
              label="Rebase Frequency"
              value={`${rebaseFrequency / 3600} hours`}
              tooltip="How often the token supply is adjusted"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem
              icon={<SwapHoriz color="primary" />}
              label="Transfer Fee"
              value={`${transferFeeBasisPoints / 100}%`}
              tooltip="Fee applied to token transfers"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InfoItem
              icon={<Percent color="primary" />}
              label="LP Reward"
              value={`${lpRewardPercentage}%`}
              tooltip="Percentage of fees distributed to liquidity providers"
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Smart Contract Details
          </Typography>
          <Typography
            variant="body2"
            sx={{
              wordBreak: 'break-all',
              color: theme.palette.text.secondary,
              '& span': { color: theme.palette.primary.main },
            }}
          >
            Governor: <span>{/* governorContract */}</span>
          </Typography>
          <Typography
            variant="body2"
            sx={{
              wordBreak: 'break-all',
              color: theme.palette.text.secondary,
              '& span': { color: theme.palette.primary.main },
            }}
          >
            Treasury: <span>{/* treasury */}</span>
          </Typography>
        </Box>

        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Key Features
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Automatic Rebase Mechanism
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • LP Rewards Distribution
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Governance-controlled Parameters
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TokenInfo;
