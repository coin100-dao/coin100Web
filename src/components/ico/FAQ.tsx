import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
import { ExpandMore, QuestionAnswer } from '@mui/icons-material';
import faqData from '../../data/faq.json';

const FAQ: React.FC = () => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(0);

  const handleCategoryChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setSelectedCategory(newValue);
  };

  // Filter FAQ categories relevant to ICO
  const relevantCategories = ['basics', 'ico', 'tokenomics'];
  const filteredFAQ = faqData.categories.filter((category) =>
    relevantCategories.includes(category.id)
  );

  return (
    <Card
      sx={{
        background: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <QuestionAnswer color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Frequently Asked Questions
          </Typography>
        </Box>

        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 3,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'medium',
            },
          }}
        >
          {filteredFAQ.map((category) => (
            <Tab key={category.id} label={category.name} />
          ))}
        </Tabs>

        <Box>
          {filteredFAQ[selectedCategory]?.questions.map((faq) => (
            <Accordion
              key={faq.id}
              sx={{
                '&:not(:last-child)': { mb: 1 },
                background: 'transparent',
                '&:before': { display: 'none' },
                boxShadow: 'none',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  background: theme.palette.action.hover,
                  borderRadius: 1,
                  '&.Mui-expanded': {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  },
                }}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  background: theme.palette.action.hover,
                  borderBottomLeftRadius: 1,
                  borderBottomRightRadius: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FAQ;
