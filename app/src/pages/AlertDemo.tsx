import React from 'react';
import { Box, Button, Typography, Grid, Paper, Divider } from '@mui/material';
import { useSweetAlert } from '../hooks/useSweetAlert';
import { Toast, showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from '../components/Toast';

const AlertDemo: React.FC = () => {
  const { 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo, 
    showConfirmation, 
    showLoading, 
    closeAlert 
  } = useSweetAlert();

  // For Toast component demo
  const [showToast, setShowToast] = React.useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
  }>({ show: false, type: 'success', title: '' });

  React.useEffect(() => {
    if (showToast.show) {
      setShowToast({ ...showToast, show: false });
    }
  }, [showToast]);

  const handleShowLoading = () => {
    showLoading('Processing', 'This will close in 2 seconds');
    setTimeout(() => {
      closeAlert();
      showSuccess('Completed', 'Loading process completed successfully');
    }, 2000);
  };

  const handleShowConfirmation = async () => {
    const result = await showConfirmation(
      'Are you sure?',
      'This is a demo confirmation dialog',
      'Yes, proceed',
      'No, cancel'
    );

    if (result.isConfirmed) {
      showSuccess('Confirmed', 'You clicked the confirm button');
    } else if (result.isDismissed) {
      showInfo('Cancelled', 'You cancelled the operation');
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h3" gutterBottom>
        Sweetalert2 Demo
      </Typography>
      <Typography variant="body1" paragraph>
        This page demonstrates the various alert types available using Sweetalert2 version 11.17.2.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h4" gutterBottom>
        Basic Alerts
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              color="success" 
              fullWidth
              onClick={() => showSuccess('Success!', 'Operation completed successfully')}
            >
              Success Alert
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              color="error" 
              fullWidth
              onClick={() => showError('Error!', 'Something went wrong')}
            >
              Error Alert
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              color="warning" 
              fullWidth
              onClick={() => showWarning('Warning!', 'This action might have consequences')}
            >
              Warning Alert
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              color="info" 
              fullWidth
              onClick={() => showInfo('Information', 'This is an informational message')}
            >
              Info Alert
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h4" gutterBottom>
        Advanced Alerts
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={handleShowConfirmation}
            >
              Confirmation Dialog
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button 
              variant="contained" 
              color="secondary" 
              fullWidth
              onClick={handleShowLoading}
            >
              Loading Alert
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h4" gutterBottom>
        Toast Notifications
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              color="success" 
              fullWidth
              onClick={() => setShowToast({ 
                show: true, 
                type: 'success', 
                title: 'Success Toast', 
                message: 'Operation completed successfully' 
              })}
            >
              Success Toast
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              color="error" 
              fullWidth
              onClick={() => setShowToast({ 
                show: true, 
                type: 'error', 
                title: 'Error Toast', 
                message: 'Something went wrong' 
              })}
            >
              Error Toast
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              color="warning" 
              fullWidth
              onClick={() => setShowToast({ 
                show: true, 
                type: 'warning', 
                title: 'Warning Toast', 
                message: 'This is a warning message' 
              })}
            >
              Warning Toast
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              color="info" 
              fullWidth
              onClick={() => setShowToast({ 
                show: true, 
                type: 'info', 
                title: 'Info Toast', 
                message: 'This is an informational message' 
              })}
            >
              Info Toast
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h4" gutterBottom>
        Helper Functions
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              color="success" 
              fullWidth
              onClick={() => showSuccessToast('Success Helper', 'Using the helper function')}
            >
              Success Helper
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              color="error" 
              fullWidth
              onClick={() => showErrorToast('Error Helper', 'Using the helper function')}
            >
              Error Helper
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              color="warning" 
              fullWidth
              onClick={() => showWarningToast('Warning Helper', 'Using the helper function')}
            >
              Warning Helper
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              color="info" 
              fullWidth
              onClick={() => showInfoToast('Info Helper', 'Using the helper function')}
            >
              Info Helper
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {showToast.show && (
        <Toast 
          title={showToast.title} 
          message={showToast.message} 
          type={showToast.type} 
        />
      )}
    </Box>
  );
};

export default AlertDemo;
