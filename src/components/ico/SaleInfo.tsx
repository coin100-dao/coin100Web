import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  useTheme,
  Chip,
} from '@mui/material';
import {
  AccessTime,
  LocalOffer,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { format } from 'date-fns';

const SaleInfo: React.FC = () => {
  const theme = useTheme();
  const { polRate, isIcoActive, isFinalized, icoStartTime, icoEndTime } =
    useSelector((state: RootState) => state.ico);

  const InfoItem = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ mr: 2, color: theme.palette.primary.main }}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="textSecondary">
          {label}
        </Typography>
        <Typography variant="body1">{value}</Typography>
      </Box>
    </Box>
  );

  return (
    <Card
      sx={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h5">Sale Information</Typography>
          <Chip
            label={isIcoActive ? 'Active' : 'Inactive'}
            color={isIcoActive ? 'success' : 'error'}
            icon={isIcoActive ? <CheckCircle /> : <Cancel />}
            sx={{ borderRadius: 2 }}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <InfoItem
              icon={<LocalOffer />}
              label="Token Rate"
              value={`1 MATIC = ${polRate} C100`}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InfoItem
              icon={<AccessTime />}
              label="Start Time"
              value={format(new Date(icoStartTime * 1000), 'PPpp')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InfoItem
              icon={<AccessTime />}
              label="End Time"
              value={format(new Date(icoEndTime * 1000), 'PPpp')}
            />
          </Grid>
        </Grid>

        <Box
          sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 0, 0, 0.1)', borderRadius: 2 }}
        >
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Sale Status
          </Typography>
          <Typography variant="body1">
            {isFinalized
              ? '🎉 Sale has been finalized'
              : isIcoActive
                ? '🚀 Sale is currently active'
                : '⏳ Sale is not active'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SaleInfo;
