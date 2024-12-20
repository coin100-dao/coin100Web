// src/components/home/Roadmap.tsx

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

const roadmapPhases = [
  {
    icon: <LaunchIcon />,
    title: 'Phase 1: Launch',
    items: [
      'Smart Contract Development',
      'Core Token Contract Implementation',
      'Public Sale Contract Development',
      'Security Features Integration',
      'Multiple Independent Security Audits',
      'Bug Bounty Program Initiation',
      'Community Code Reviews',
      'Initial Community Building',
      'Social Media Presence Establishment',
      'Community Channels Setup',
      'Educational Content Creation',
      'Public Sale Launch',
      'ICO Initiation',
      'Liquidity Pool Creation',
      'Initial Market Making',
    ],
  },
  {
    icon: <GroupsIcon />,
    title: 'Phase 2: Growth',
    items: [
      'Exchange Listings on Major Platforms',
      'DEX Integrations',
      'CEX Partnerships Formation',
      'Market Maker Relationships Development',
      'Comprehensive Marketing Campaigns',
      'Brand Awareness Initiatives',
      'Influencer Collaborations',
      'Educational Webinars and Workshops',
      'Community Expansion Strategies',
      'Ambassador Program Launch',
      'Regional Community Groups Formation',
      'Content Creator Network Establishment',
      'Strategic Partnership Development',
      'Integration Partnerships with Other Protocols',
      'Cross-Protocol Collaborations',
    ],
  },
  {
    icon: <AutoGraphIcon />,
    title: 'Phase 3: Evolution',
    items: [
      'Governance Integration',
      'Deploy Governor Contract and Timelock Controller',
      'Enable Community Voting on Proposals',
      'Automated Rebase System Implementation',
      'Automated Rebase Triggers via Oracles',
      'Introduction of Fail-Safe Mechanisms',
      'Enhanced Market Analytics Development',
      'Real-Time Tracking Dashboard Launch',
      'Performance Metrics Monitoring',
      'Market Insight Tools Deployment',
      'Additional Trading Pairs Introduction',
      'New Liquidity Pools Creation',
      'Cross-Chain Bridges Establishment',
      'Synthetic Asset Integration',
    ],
  },
  {
    icon: <SecurityIcon />,
    title: 'Phase 4: Maturity',
    items: [
      'Full Decentralization Achieved',
      'Complete Transition to Community Governance',
      'Multi-Signature Treasury Management',
      'Advanced Security Features Implementation',
      'Multi-Sig Implementations for Enhanced Security',
      'Emergency Response System Deployment',
      'Enhanced Audit Coverage Expansion',
      'Comprehensive Cross-Chain Integration',
      'Layer 2 Solutions Implementation',
      'Multiple Blockchain Support Expansion',
      'Unified Liquidity Management Systems',
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
        {/* Header */}
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
            Our journey towards a decentralized future
          </Typography>
        </Box>

        {/* Timeline */}
        <Timeline position="alternate">
          {roadmapPhases.map((phase, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <StyledTimelineDot>{phase.icon}</StyledTimelineDot>
                {index < roadmapPhases.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <GlassPaper>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {phase.title}
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {phase.items.map((listItem, listIndex) => (
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
