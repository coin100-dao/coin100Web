// src/components/Whitepaper.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  Paper,
  Button,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const WHITEPAPER_URL =
  'https://raw.githubusercontent.com/coin100-dao/.github/main/profile/README.md';

const Whitepaper: React.FC = () => {
  const theme = useTheme();
  const [markdown, setMarkdown] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWhitepaper = async () => {
      try {
        const response = await fetch(WHITEPAPER_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch whitepaper');
        }
        const text = await response.text();
        setMarkdown(text);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load whitepaper'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWhitepaper();
  }, []);

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'COIN100_Whitepaper.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5">Loading whitepaper...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 4, md: 6 },
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.paper} 50%, ${theme.palette.secondary.dark} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: `linear-gradient(135deg, ${theme.palette.background.paper}80 0%, ${theme.palette.background.paper}40 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.primary.dark}40`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<FontAwesomeIcon icon={faDownload} />}
              onClick={handleDownload}
              sx={{ mb: 2 }}
            >
              Download Whitepaper
            </Button>
          </Box>
          <Box
            sx={{
              '& img': { maxWidth: '100%', height: 'auto' },
              '& a': { color: theme.palette.primary.main },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                color: theme.palette.primary.main,
                mt: 3,
                mb: 2,
              },
              '& p': { mb: 2 },
              '& ul, & ol': { mb: 2, pl: 3 },
              '& code': {
                backgroundColor: theme.palette.background.paper,
                padding: '2px 4px',
                borderRadius: '4px',
                fontFamily: 'monospace',
              },
            }}
          >
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Whitepaper;
