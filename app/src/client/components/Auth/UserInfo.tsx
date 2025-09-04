import React from 'react';
import { getAuthData, logout } from '../../utils/auth';

interface UserInfoProps {
  className?: string;
}

const UserInfo: React.FC<UserInfoProps> = ({ className = '' }) => {
  const authData = getAuthData();

  if (!authData) {
    return null;
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className={`user-info ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ fontSize: '14px', color: '#666' }}>
        <div style={{ fontWeight: '500' }}>{authData.businessEmail}</div>
        <div style={{ fontSize: '12px' }}>Org ID: {authData.organizationId}</div>
      </div>
      <button 
        onClick={handleLogout}
        style={{
          padding: '6px 12px',
          fontSize: '12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: '#fff',
          cursor: 'pointer',
          color: '#666'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#f5f5f5';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = '#fff';
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default UserInfo;
