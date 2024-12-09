import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
  InputAdornment,
  Paper,
  Fade,
  Grid,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import faqData from '../../data/faq.json';

const FAQ: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedAccordion, setExpandedAccordion] = useState<number | false>(
    false
  );

  const handleAccordionChange =
    (id: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordion(isExpanded ? id : false);
    };

  const filteredCategories = useMemo(() => {
    return faqData.categories
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (q) =>
            q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter(
        (category) =>
          selectedCategory === 'all' || category.id === selectedCategory
      )
      .filter((category) => category.questions.length > 0);
  }, [searchQuery, selectedCategory]);

  const totalQuestions = useMemo(() => {
    return filteredCategories.reduce(
      (acc, category) => acc + category.questions.length,
      0
    );
  }, [filteredCategories]);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h2"
          component={motion.h2}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            fontWeight: 800,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Frequently Asked Questions
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          component={motion.p}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          sx={{ mb: 4 }}
        >
          Everything you need to know about COIN100
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  '&:hover': {
                    boxShadow: theme.shadows[2],
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<CategoryIcon />}
                label="All Categories"
                onClick={() => setSelectedCategory('all')}
                color={selectedCategory === 'all' ? 'primary' : 'default'}
                variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
              />
              {faqData.categories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  onClick={() => setSelectedCategory(category.id)}
                  color={
                    selectedCategory === category.id ? 'primary' : 'default'
                  }
                  variant={
                    selectedCategory === category.id ? 'filled' : 'outlined'
                  }
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      <Typography
        color="text.secondary"
        sx={{ mb: 3 }}
        component={motion.p}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {totalQuestions} {totalQuestions === 1 ? 'result' : 'results'} found
      </Typography>

      {/* FAQ Accordions */}
      <AnimatePresence>
        {filteredCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                }}
              >
                {category.name}
              </Typography>
              {category.questions.map((item) => (
                <Accordion
                  key={item.id}
                  expanded={expandedAccordion === item.id}
                  onChange={handleAccordionChange(item.id)}
                  sx={{
                    mb: 1,
                    background: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(8px)',
                    borderRadius: '8px !important',
                    '&:before': { display: 'none' },
                    boxShadow: theme.shadows[1],
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[3],
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      '& .MuiAccordionSummary-content': {
                        py: 1,
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 500,
                        color:
                          expandedAccordion === item.id
                            ? theme.palette.primary.main
                            : 'text.primary',
                      }}
                    >
                      {item.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Fade in={expandedAccordion === item.id}>
                      <Typography
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.7,
                          '& strong': {
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          },
                        }}
                      >
                        {item.answer}
                      </Typography>
                    </Fade>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* No Results Message */}
      {totalQuestions === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No questions found matching your search
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search terms or category filter
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default FAQ;
