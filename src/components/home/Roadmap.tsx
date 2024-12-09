import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { styled } from '@mui/system';
import LaunchIcon from '@mui/icons-material/Launch';
import GroupsIcon from '@mui/icons-material/Groups';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SecurityIcon from '@mui/icons-material/Security';

const GlassPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const StyledTimelineDot = styled(TimelineDot)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  boxShadow: 'none',
}));

const roadmapItems = [
  {
    icon: <LaunchIcon />,
    title: 'Phase 1: Launch',
    items: [
      'Smart Contract Development',
      'Security Audits',
      'Initial Community Building',
      'ICO Launch',
    ],
  },
  {
    icon: <GroupsIcon />,
    title: 'Phase 2: Growth',
    items: [
      'Exchange Listings',
      'Marketing Campaigns',
      'Community Expansion',
      'Partnership Development',
    ],
  },
  {
    icon: <AutoGraphIcon />,
    title: 'Phase 3: Evolution',
    items: [
      'Oracle Integration',
      'Automated Rebase System',
      'Enhanced Market Analytics',
      'Additional Trading Pairs',
    ],
  },
  {
    icon: <SecurityIcon />,
    title: 'Phase 4: Maturity',
    items: [
      'Governance Implementation',
      'Community DAO',
      'Advanced Security Features',
      'Cross-chain Integration',
    ],
  },
];

const Roadmap = () => {
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
            Roadmap
          </Typography>
          <Typography
            variant="h5"
            sx={{ opacity: 0.8, maxWidth: '800px', mx: 'auto' }}
          >
            Our journey to revolutionize crypto index investing
          </Typography>
        </Box>

        <Timeline position="alternate">
          {roadmapItems.map((item, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <StyledTimelineDot>{item.icon}</StyledTimelineDot>
                {index < roadmapItems.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <GlassPaper>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {item.title}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {item.items.map((listItem, listIndex) => (
                      <Typography
                        key={listIndex}
                        component="li"
                        variant="body1"
                        sx={{
                          mb: 1,
                          opacity: 0.8,
                          '&::marker': {
                            color: (theme) => theme.palette.primary.main,
                          },
                        }}
                      >
                        {listItem}
                      </Typography>
                    ))}
                  </Box>
                </GlassPaper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Container>
    </Box>
  );
};

export default Roadmap;
