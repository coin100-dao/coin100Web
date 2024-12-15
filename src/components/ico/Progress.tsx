import React from 'react';
import {
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  useTheme,
} from '@mui/material';
import {
  Rocket,
  Group,
  Security,
  AccountBalance,
  Engineering,
} from '@mui/icons-material';

const Progress: React.FC = () => {
  const theme = useTheme();

  const steps = [
    {
      label: 'Private Sale',
      description: 'Early investors and strategic partners',
      icon: <Group />,
      completed: true,
    },
    {
      label: 'Public Sale',
      description: 'Open participation for everyone',
      icon: <Rocket />,
      completed: true,
    },
    {
      label: 'Security Audit',
      description: 'Smart contract verification',
      icon: <Security />,
      completed: false,
    },
    {
      label: 'DEX Listing',
      description: 'Trading goes live',
      icon: <AccountBalance />,
      completed: false,
    },
    {
      label: 'Platform Launch',
      description: 'Full feature release',
      icon: <Engineering />,
      completed: false,
    },
  ];

  return (
    <Card
      sx={{
        background: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Project Progress
        </Typography>

        <Stepper
          activeStep={2}
          orientation="vertical"
          sx={{
            '& .MuiStepLabel-root': {
              py: 1,
            },
            '& .MuiStepLabel-iconContainer': {
              '& .MuiSvgIcon-root': {
                fontSize: 28,
                color: theme.palette.primary.main,
              },
            },
            '& .MuiStepLabel-label': {
              typography: 'body1',
              fontWeight: 'bold',
            },
          }}
        >
          {steps.map((step, index) => (
            <Step key={index} completed={step.completed}>
              <StepLabel
                icon={step.icon}
                optional={
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                }
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
};

export default Progress;
