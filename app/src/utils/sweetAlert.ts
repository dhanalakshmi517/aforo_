import Swal from 'sweetalert2';

// Success alert
export const showSuccessAlert = (
  title: string = 'Success!',
  text: string = 'Operation completed successfully.',
  timer: number = 2000
) => {
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
};

// Error alert
export const showErrorAlert = (
  title: string = 'Error!',
  text: string = 'Something went wrong.',
  timer?: number
) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#3085d6',
    position: 'center'
  });
};

// Warning alert
export const showWarningAlert = (
  title: string = 'Warning!',
  text: string = 'Please be careful.',
  timer?: number
) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'OK',
    confirmButtonColor: '#3085d6',
    position: 'center'
  });
};

// Info alert
export const showInfoAlert = (
  title: string = 'Info',
  text: string = 'Just so you know.',
  timer: number = 3000
) => {
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
};

// Confirmation dialog
export const showConfirmationDialog = (
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
};

// Loading alert
export const showLoadingAlert = (
  title: string = 'Loading...',
  text: string = 'Please wait'
) => {
  return Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Close any open alert
export const closeAlert = () => {
  Swal.close();
};

// Default export for convenience
export default {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showInfoAlert,
  showConfirmationDialog,
  showLoadingAlert,
  closeAlert
};
