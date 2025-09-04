import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, isTokenExpired, getAuthToken } from '../../utils/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, redirectTo = '/signin' }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const token = getAuthToken();
      const tokenExpired = isTokenExpired(token || '');

      if (!authenticated || tokenExpired) {
        navigate(redirectTo);
        return;
      }

      setIsAuthed(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [navigate, redirectTo]);

  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        Verifying authentication...
      </div>
    );
  }

  return isAuthed ? <>{children}</> : null;
};

export default AuthGuard;
