import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check for the specific auth token key used in your application
        const token = localStorage.getItem('aforo_auth_token');
        // Immediately update auth state without artificial delays
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  // Don't show any loading state, just return null while checking
  // This prevents the flash of loading spinner
  if (isLoading || isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
