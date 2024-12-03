import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/system';
import PolygonLogo from '../../assets/polygon-matic-logo.svg';

const NetworkCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  background:
    theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(0,0,0,0.02)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'radial-gradient(circle at center, rgba(130,71,229,0.1) 0%, rgba(130,71,229,0) 70%)',
    zIndex: 0,
  },
}));

const NetworkSection: React.FC = () => {
  return (
    <Box sx={{ py: 12, px: 4 }}>
      <NetworkCard>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <img
            src={PolygonLogo}
            alt="Polygon Network"
            style={{
              width: '120px',
              height: 'auto',
              marginBottom: '24px',
            }}
          />
          <Typography variant="h3" gutterBottom>
            Built on Polygon
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              maxWidth: '800px',
              mx: 'auto',
              color: 'text.secondary',
            }}
          >
            Experience lightning-fast transactions and minimal fees
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 4,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography variant="h4" color="primary" gutterBottom>
                &lt; $0.01
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Average Transaction Fee
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="primary" gutterBottom>
                2.65s
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Block Time
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="primary" gutterBottom>
                7000+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                dApps Deployed
              </Typography>
            </Box>
          </Box>
        </Box>
      </NetworkCard>
    </Box>
  );
};

export default NetworkSection;
