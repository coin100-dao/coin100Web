import React from 'react';
import { Box, Container, IconButton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/system';
import TwitterIcon from '@mui/icons-material/Twitter';
import ChatIcon from '@mui/icons-material/Chat';
import RedditIcon from '@mui/icons-material/Reddit';
import EmailIcon from '@mui/icons-material/Email';

const StyledFooter = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
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
              <IconButton
                href="https://x.com/Coin100token"
                target="_blank"
                color="primary"
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                href="https://discord.com/channels/1312498183485784236/1312498184500674693"
                target="_blank"
                color="primary"
              >
                <ChatIcon />
              </IconButton>
              <IconButton
                href="https://www.reddit.com/r/Coin100"
                target="_blank"
                color="primary"
              >
                <RedditIcon />
              </IconButton>
              <IconButton href="mailto:support@coin100.link" color="primary">
                <EmailIcon />
              </IconButton>
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
