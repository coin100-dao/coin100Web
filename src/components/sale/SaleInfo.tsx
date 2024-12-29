import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Grid,
  Chip,
} from '@mui/material';
import { AccessTime, CheckCircle, Error, Pause } from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';

const SaleInfo: React.FC = () => {
  const theme = useTheme();
  const { startTime, endTime, isFinalized, isSaleActive, isPaused } =
    useSelector((state: RootState) => state.publicSale);

  const now = Math.floor(Date.now() / 1000);
  const saleNotStarted = now < startTime;
  const saleEnded = now > endTime;

  const getStatusChip = () => {
    if (isFinalized) {
      return (
        <Chip
          icon={<CheckCircle />}
          label="Sale Finalized"
          color="error"
          variant="outlined"
        />
      );
    }
    if (isPaused) {
      return (
        <Chip
          icon={<Pause />}
          label="Sale Paused"
          color="warning"
          variant="outlined"
        />
      );
    }
    if (saleNotStarted) {
      return (
        <Chip
          icon={<AccessTime />}
          label="Sale Not Started"
          color="warning"
          variant="outlined"
        />
      );
    }
    if (saleEnded) {
      return (
        <Chip
          icon={<Error />}
          label="Sale Ended"
          color="error"
          variant="outlined"
        />
      );
    }
    if (isSaleActive) {
      return (
        <Chip
          icon={<CheckCircle />}
          label="Sale Active"
          color="success"
          variant="outlined"
        />
      );
    }
    return (
      <Chip
        icon={<Error />}
        label="Sale Inactive"
        color="error"
        variant="outlined"
      />
    );
  };

  const formatDate = (timestamp: number) => {
    return format(timestamp * 1000, 'PPpp');
  };

  const getTimeInfo = () => {
    if (saleNotStarted) {
      return `Sale starts ${formatDistanceToNow(startTime * 1000, {
        addSuffix: true,
      })}`;
    }
    if (isSaleActive) {
      return `Sale ends ${formatDistanceToNow(endTime * 1000, {
        addSuffix: true,
      })}`;
    }
    if (saleEnded) {
      return 'Sale has ended';
    }
    return '';
  };

  return (
    <Card
      elevation={3}
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${theme.palette.background.paper}80 0%, ${theme.palette.background.paper}40 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.palette.primary.dark}40`,
      }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Sale Information
        </Typography>

        <Box
          sx={{
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {getStatusChip()}
          <Typography
            variant="body2"
            color={isSaleActive ? 'success.main' : 'text.secondary'}
          >
            {getTimeInfo()}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">
              Start Time
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(startTime)}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">
              End Time
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(endTime)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SaleInfo;
