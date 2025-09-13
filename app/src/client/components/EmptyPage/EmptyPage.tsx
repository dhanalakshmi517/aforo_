import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Using a more reliable way to check auth state
const useAuth = () => {
  const [user, setUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate auth check
    const checkAuth = () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const userData = authToken ? { id: 'user-id' } : null; // Replace with actual user data
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { data: user, isLoading };
};
import './EmptyPage.css';
import SignInOverlay from '../Auth/SignInOverlay';
import SideNavbar from '../SideNavbar/SideNavbar';
// Inline LoadingSpinner component to avoid module resolution issues
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

interface EmptyPageProps {
  activeTab?: string;
}

export default function EmptyPage({ activeTab = 'Get Started' }: EmptyPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user, isLoading } = useAuth();
  const [isClientSide, setIsClientSide] = useState(false);

  // Handle client-side only rendering to avoid hydration mismatches
  useEffect(() => {
    setIsClientSide(true);
  }, []);

  // Redirect to products page if authenticated
  useEffect(() => {
    if (!isLoading && user && location.pathname === '/get-started') {
      navigate('/get-started/products', { replace: true });
    }
  }, [user, isLoading, navigate, location.pathname]);

  const handleTabClick = (tabName: string) => {
    const pathMap: Record<string, string> = {
      'Products': '/get-started/products',
      'Customers': '/get-started/customers',
      'Rate Plans': '/get-started/rate-plans',
      'Billable Metrics': '/get-started/metering',
      'Data Ingestion': '/get-started/data-ingestion',
      'Purchases': '/get-started/subscriptions'
    };
    
    const path = pathMap[tabName];
    if (path) {
      navigate(path);
    }
  };

  // Show loading state while checking auth
  if (isLoading || !isClientSide) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      {!user && <SignInOverlay />}
      <div className={`empty-page ${user ? '' : 'page-blur'}`}>
        {user && (
          <SideNavbar
            activeTab={activeTab}
            onTabClick={handleTabClick}
            hidden={false}
          />
        )}
        <div className="empty-content">
          {/* Main content will be rendered by child routes */}
        </div>
      </div>
    </>
  );
}
