import React from 'react';
import './SideNavbar.css';
import { MdPeople } from 'react-icons/md';

interface SidebarProps {
  activeTab: string;
  onTabClick: (tabName: string) => void;
  hidden: boolean;
}

interface Tab {
  name: string;
  icon: JSX.Element;
}

function SideNavbar({ activeTab, onTabClick, hidden }: SidebarProps): JSX.Element {
  const tabs: Tab[] = [
    {
      name: 'Started',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M6.6665 10H13.3332M13.3332 10L9.99984 13.3334M13.3332 10L9.99984 6.66669M18.3332 10C18.3332 14.6024 14.6022 18.3334 9.99984 18.3334C5.39746 18.3334 1.6665 14.6024 1.6665 10C1.6665 5.39765 5.39746 1.66669 9.99984 1.66669C14.6022 1.66669 18.3332 5.39765 18.3332 10Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: 'Dashboards',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
          <path
            d="M6.75 3.22681H3C2.58579 3.22681 2.25 3.56259 2.25 3.97681V9.22681C2.25 9.64102 2.58579 9.97681 3 9.97681H6.75C7.16421 9.97681 7.5 9.64102 7.5 9.22681V3.97681C7.5 3.56259 7.16421 3.22681 6.75 3.22681Z"
            stroke="#47424A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 3.22681H11.25C10.8358 3.22681 10.5 3.56259 10.5 3.97681V6.22681C10.5 6.64102 10.8358 6.97681 11.25 6.97681H15C15.4142 6.97681 15.75 6.64102 15.75 6.22681V3.97681C15.75 3.56259 15.4142 3.22681 15 3.22681Z"
            stroke="#47424A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 9.97681H11.25C10.8358 9.97681 10.5 10.3126 10.5 10.7268V15.9768C10.5 16.391 10.8358 16.7268 11.25 16.7268H15C15.4142 16.7268 15.75 16.391 15.75 15.9768V10.7268C15.75 10.3126 15.4142 9.97681 15 9.97681Z"
            stroke="#47424A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.75 12.9768H3C2.58579 12.9768 2.25 13.3126 2.25 13.7268V15.9768C2.25 16.391 2.58579 16.7268 3 16.7268H6.75C7.16421 16.7268 7.5 16.391 7.5 15.9768V13.7268C7.5 13.3126 7.16421 12.9768 6.75 12.9768Z"
            stroke="#47424A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: 'Products',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
          <g clipPath="url(#clip0_2599_3672)">
            <path
              d="M2.475 6.22686L9 9.97686M9 9.97686L15.525 6.22686M9 9.97686L9 17.4769M15.75 6.97686C15.7497 6.71381 15.6803 6.45546 15.5487 6.22773C15.417 5.99999 15.2278 5.81088 15 5.67936L9.75 2.67936C9.52197 2.5477 9.2633 2.47839 9 2.47839C8.73669 2.47839 8.47803 2.5477 8.25 2.67936L3 5.67936C2.7722 5.81088 2.58299 5.99999 2.45135 6.22773C2.31971 6.45546 2.25027 6.71381 2.25 6.97686V12.9769C2.25027 13.2399 2.31971 13.4982 2.45135 13.726C2.58299 13.9537 2.7722 14.1428 3 14.2744L8.25 17.2744C8.47803 17.406 8.73669 17.4753 9 17.4753C9.2633 17.4753 9.52197 17.406 9.75 17.2744L15 14.2744C15.2278 14.1428 15.417 13.9537 15.5487 13.726C15.6803 13.4982 15.7497 13.2399 15.75 12.9769V6.97686Z"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_2599_3672">
              <rect width="18" height="18" fill="white" transform="translate(0 0.976807)" />
            </clipPath>
          </defs>
        </svg>
      ),
    },
    {
      name: 'Customers',
      icon: <MdPeople size={20} />,
    },
  ];

  return (
    <div className={`side-navbar ${hidden ? 'hidden' : ''}`}>
      <ul>
        {tabs.map((tab) => (
          <li
            key={tab.name}
            className={activeTab === tab.name ? 'active' : ''}
            onClick={() => onTabClick(tab.name)}
          >
            <span className="icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SideNavbar;
