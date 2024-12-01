// src/components/CoinLogoWithBackground.tsx

import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import CoinLogo from '../assets/coin100-transp.png';

interface CoinLogoWithBackgroundProps {
  size?: number; // Diameter of the circular background
  imgSize?: number; // Size of the CoinLogo image
  alt?: string; // Alt text for the image
  sx?: object; // Additional styling
}

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '100%',
  backgroundColor:
    theme.palette.mode === 'light'
      ? theme.palette.grey[800]
      : theme.palette.grey[200],
  padding: theme.spacing(1),
}));

const CoinLogoWithBackground: React.FC<CoinLogoWithBackgroundProps> = ({
  size = 100,
  imgSize = 80,
  alt = 'COIN100 Logo',
  sx = {},
}) => {
  return (
    <StyledBox
      sx={{
        width: size,
        height: size,
        ...sx,
      }}
    >
      <Box
        component="img"
        src={CoinLogo}
        alt={alt}
        sx={{
          width: imgSize,
          height: imgSize,
        }}
      />
    </StyledBox>
  );
};

export default CoinLogoWithBackground;
