import React, { useState, useEffect } from 'react';
import './EmptyPage.css';
import SignInOverlay from '../Auth/SignInOverlay';
import SideNavbar from '../SideNavbar/SideNavbar';

interface EmptyPageProps {
  activeTab?: string;
}

export default function EmptyPage({ activeTab = 'Get Started' }: EmptyPageProps) {
  const [loggedIn, setLoggedIn] = useState<boolean>(() => !!localStorage.getItem('authToken'));
  useEffect(() => {
    const listener = () => setLoggedIn(!!localStorage.getItem('authToken'));
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);
  const handleTabClick = (tabName: string) => {
    // Handle tab click navigation
    console.log('Clicked tab:', tabName);
  };

  return (
    <>
      {!loggedIn && <SignInOverlay />}
      <div className={`empty-page ${loggedIn ? '' : 'page-blur'}`}>
        <SideNavbar
          activeTab={activeTab}
          onTabClick={handleTabClick}
          hidden={false}
        />
        <div className="empty-content">
          {/* main content */}
        </div>
      </div>
    </>
  );
}
