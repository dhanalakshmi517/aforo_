import React from 'react';
import './EmptyPage.css';
import SideNavbar from '../SideNavbar/SideNavbar';

interface EmptyPageProps {
  activeTab?: string;
}

export default function EmptyPage({ activeTab = 'Get Started' }: EmptyPageProps) {
  const handleTabClick = (tabName: string) => {
    // Handle tab click navigation
    console.log('Clicked tab:', tabName);
  };

  return (
    <div className="empty-page">
      <SideNavbar 
        activeTab={activeTab} 
        onTabClick={handleTabClick} 
        hidden={false} 
      />
      <div className="empty-content">
        {/* Add some content to test the background */}
      </div>
    </div>
  );
}
