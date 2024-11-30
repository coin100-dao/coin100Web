// src/pages/About.tsx
import React from 'react';
import { Container, Typography } from '@mui/material';

const About: React.FC = () => {
  return (
    <Container>
      <Typography variant="h2" align="center" gutterBottom>
        About This Project
      </Typography>
      <Typography variant="body1">
        This is an example full-stack application using Node.js, Express, Prisma, React, and Material-UI.
      </Typography>
    </Container>
  );
};

export default About;