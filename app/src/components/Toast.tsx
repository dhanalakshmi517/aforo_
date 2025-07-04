import React from 'react';
import Swal from 'sweetalert2';

interface ToastProps {
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end';
}

export const Toast: React.FC<ToastProps> = ({ 
  title, 
  message, 
  type, 
  duration = 3000,
  position = 'top-end'
}) => {
  React.useEffect(() => {
    const Toast = Swal.mixin({
      toast: true,
      position,
      showConfirmButton: false,
      timer: duration,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: type,
      title,
      text: message
    });
  }, [title, message, type, duration, position]);

  // This component doesn't render anything
  return null;
};

// Helper functions for common toast types
export const showSuccessToast = (title: string, message?: string, duration?: number) => {
  return <Toast title={title} message={message} type="success" duration={duration} />;
};

export const showErrorToast = (title: string, message?: string, duration?: number) => {
  return <Toast title={title} message={message} type="error" duration={duration} />;
};

export const showWarningToast = (title: string, message?: string, duration?: number) => {
  return <Toast title={title} message={message} type="warning" duration={duration} />;
};

export const showInfoToast = (title: string, message?: string, duration?: number) => {
  return <Toast title={title} message={message} type="info" duration={duration} />;
};

export default Toast;
