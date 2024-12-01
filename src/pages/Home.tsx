// src/pages/Home.tsx
import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';

const Home: React.FC = () => {
  return (
    <Container>
      <Typography variant="h2" align="center" gutterBottom>
        Welcome to COIN100
      </Typography>
      <Typography variant="h5" align="center" paragraph>
        Discover the future of cryptocurrency management with COIN100.
      </Typography>
      <Grid container spacing={4}>
        <Grid size={4}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Feature 1
            </Typography>
            <Typography>Detailed explanation of feature 1.</Typography>
          </Paper>
        </Grid>
        <Grid size={4}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Feature 2
            </Typography>
            <Typography>Detailed explanation of feature 2.</Typography>
          </Paper>
        </Grid>
        <Grid size={4}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Feature 3
            </Typography>
            <Typography>Detailed explanation of feature 3.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
