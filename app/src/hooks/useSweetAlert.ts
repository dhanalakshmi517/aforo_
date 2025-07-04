import { useCallback } from 'react';
import Swal from 'sweetalert2';

export const useSweetAlert = () => {
  // Success alert
  const showSuccess = useCallback((title: string, text?: string, timer: number = 2000) => {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
  }, []);

  // Error alert
  const showError = useCallback((title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
      position: 'center'
    });
  }, []);

  // Warning alert
  const showWarning = useCallback((title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
      position: 'center'
    });
  }, []);

  // Info alert
  const showInfo = useCallback((title: string, text?: string, timer: number = 3000) => {
    return Swal.fire({
      title,
      text,
      icon: 'info',
      timer,
      timerProgressBar: true,
      position: 'top-end',
      toast: true,
      showConfirmButton: false
    });
  }, []);

  // Confirmation dialog
  const showConfirmation = useCallback((
    title: string = 'Are you sure?',
    text: string = 'This action cannot be undone.',
    confirmButtonText: string = 'Yes, proceed',
    cancelButtonText: string = 'Cancel',
    icon: 'warning' | 'question' = 'warning'
  ) => {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText,
      cancelButtonText
    });
  }, []);

  // Loading alert
  const showLoading = useCallback((title: string = 'Loading...', text: string = 'Please wait') => {
    return Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }, []);

  // Close any open alert
  const closeAlert = useCallback(() => {
    Swal.close();
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
    showLoading,
    closeAlert
  };
};

export default useSweetAlert;
