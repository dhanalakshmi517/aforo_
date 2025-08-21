import React from 'react';
import { BsCheckCircleFill } from 'react-icons/bs';

import { Box, Typography, Button } from '@mui/material';

const SuccessStep: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="50vh"
      textAlign="center"
      padding={4}
      bgcolor="white"
      borderRadius={2}
      boxShadow={3}
    >
      <BsCheckCircleFill size={72} color="green" />
      <Typography variant="h5" mt={2} mb={1}>
        Product Created Successfully!
      </Typography>
      <Typography variant="body1" color="textSecondary" mb={3}>
        Your product has been added and is ready for pricing configuration.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => window.location.reload()}
      >
        Done
      </Button>
    </Box>
  );
};

export default SuccessStep;
