import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import TimerIcon from '@mui/icons-material/Timer';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import GroupIcon from '@mui/icons-material/Group';

const GlassPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  '& svg': {
    fontSize: '24px',
    color: theme.palette.common.white,
  },
}));

const ICO = () => {
  const navigate = useNavigate();
  // This would come from your web3 integration
  const progress = 65;

  const handleParticipateClick = () => {
    navigate('/ico');
  };

  return (
    <Box
      sx={{
        py: 10,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: (theme) =>
                `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Initial Coin Offering
          </Typography>
          <Typography
            variant="h5"
            sx={{ opacity: 0.8, maxWidth: '800px', mx: 'auto' }}
          >
            Be part of the future of crypto index investing
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <GlassPaper>
              <IconWrapper>
                <TimerIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                ICO Timeline
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Start Date: January 1, 2025
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Duration: 12 months
                </Typography>
                <Typography variant="body1">
                  • Unsold tokens will be burned
                </Typography>
              </Box>
            </GlassPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <GlassPaper>
              <IconWrapper>
                <LocalOfferIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Token Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Token: COIN100 (C100)
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Network: Polygon
                </Typography>
                <Typography variant="body1">
                  • Accept: POL(MATIC), USDC
                </Typography>
              </Box>
            </GlassPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <GlassPaper>
              <IconWrapper>
                <GroupIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Participation
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Min: No Minimum
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Max: No limit
                </Typography>
                <Typography variant="body1">• KYC: Not required</Typography>
              </Box>
            </GlassPaper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6 }}>
          <GlassPaper>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                ICO Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: (theme) =>
                      `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  },
                }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 3,
              }}
            >
              <Typography variant="body1">Raised: {progress}%</Typography>
              <Typography variant="body1">Target: 100%</Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              onClick={handleParticipateClick}
              sx={{
                borderRadius: '28px',
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                background: (theme) =>
                  `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                alignSelf: 'center',
              }}
            >
              Participate in ICO
            </Button>
          </GlassPaper>
        </Box>
      </Container>
    </Box>
  );
};

export default ICO;
