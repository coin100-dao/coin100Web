import React from 'react';
import { Box, Container, IconButton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/system';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXTwitter,
  faDiscord,
  faReddit,
} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const StyledFooter = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
}));

const StyledIconButton = styled(IconButton)(({}) => ({
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  '& svg': {
    fontSize: '1.5rem',
  },
}));

const Footer = () => {
  return (
    <StyledFooter>
      <Container maxWidth="lg">
        <Grid
          container
          spacing={3}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <a
                href="https://x.com/Coin100token"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <StyledIconButton color="primary" aria-label="Follow us on X">
                  <FontAwesomeIcon icon={faXTwitter} />
                </StyledIconButton>
              </a>
              <a
                href="https://discord.com/channels/1312498183485784236/1312498184500674693"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <StyledIconButton color="primary" aria-label="Join our Discord">
                  <FontAwesomeIcon icon={faDiscord} />
                </StyledIconButton>
              </a>
              <a
                href="https://www.reddit.com/r/Coin100"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <StyledIconButton
                  color="primary"
                  aria-label="Join our Reddit community"
                >
                  <FontAwesomeIcon icon={faReddit} />
                </StyledIconButton>
              </a>
              <a
                href="mailto:mayor@coin100.link"
                style={{ textDecoration: 'none' }}
              >
                <StyledIconButton color="primary" aria-label="Email us">
                  <FontAwesomeIcon icon={faEnvelope} />
                </StyledIconButton>
              </a>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              &copy; 2024 COIN100. All rights reserved.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
