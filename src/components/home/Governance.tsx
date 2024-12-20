// src/components/home/Governance.tsx

import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/system';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const GlassPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  height: '100%',
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

const Governance = () => {
  return (
    <Box
      sx={{
        py: 10,
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
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
            Governance
          </Typography>
          <Typography
            variant="h5"
            sx={{ opacity: 0.8, maxWidth: '800px', mx: 'auto' }}
          >
            Community-driven decision making for sustainable growth
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <GlassPaper>
              <IconWrapper>
                <HowToVoteIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Voting Power
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Token-based voting rights
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Proportional representation
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Transparent voting process
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Every token holder has a say in the project&apos;s future
              </Typography>
            </GlassPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <GlassPaper>
              <IconWrapper>
                <GroupsIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Community Involvement
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Proposal submissions
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Discussion forums
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Regular community calls
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Active participation in project development
              </Typography>
            </GlassPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <GlassPaper>
              <IconWrapper>
                <AccountBalanceIcon />
              </IconWrapper>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                DAO Structure
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Decentralized governance
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Smart contract automation
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Treasury management
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • LP reward allocation control
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  • Community incentive programs
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Future transition to full DAO governance
              </Typography>
            </GlassPaper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6 }}>
          <GlassPaper>
            <Typography
              variant="h5"
              sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}
            >
              Governance Timeline
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 1, color: (theme) => theme.palette.primary.main }}
                >
                  Phase 1: Initial Ownership
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  Project team manages core functions with community input
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 1, color: (theme) => theme.palette.primary.main }}
                >
                  Phase 2: Transition
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  Gradual transfer of control to governance contract
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 1, color: (theme) => theme.palette.primary.main }}
                >
                  Phase 3: Full DAO
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  Complete transition to community governance
                </Typography>
              </Box>
            </Box>
          </GlassPaper>
        </Box>
      </Container>
    </Box>
  );
};

export default Governance;
