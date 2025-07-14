import React from 'react';
import './SideNavbar.css';
import { MdPeople } from 'react-icons/md';

// Define the types for the props that Sidebar component expects
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <g clipPath="url(#clip0_2020_2762)">
            <path
              d="M6.6665 10H13.3332M13.3332 10L9.99984 13.3334M13.3332 10L9.99984 6.66669M18.3332 10C18.3332 14.6024 14.6022 18.3334 9.99984 18.3334C5.39746 18.3334 1.6665 14.6024 1.6665 10C1.6665 5.39765 5.39746 1.66669 9.99984 1.66669C14.6022 1.66669 18.3332 5.39765 18.3332 10Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_2020_2762">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
    },
    {
      name: 'Dashboards',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="19"
          viewBox="0 0 18 19"
          fill="none"
        >
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
        <MdPeople size={20} />
      ),
    },
    {
      name: 'Billable Metrics',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="19"
          viewBox="0 0 18 19"
          fill="none"
        >
          <path
            d="M10.875 10.3514L12.375 8.85141M8.62497 8.10141L10.125 6.60141M6.37497 5.85141L7.87497 4.35141M13.125 12.6014L14.625 11.1014"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.975 12.4514C16.1428 12.6186 16.2759 12.8173 16.3668 13.0361C16.4576 13.2549 16.5044 13.4895 16.5044 13.7264C16.5044 13.9633 16.4576 14.1979 16.3668 14.4167C16.2759 14.6355 16.1428 14.8342 15.975 15.0014L14.025 16.9514C13.8577 17.1192 13.659 17.2524 13.4402 17.3432C13.2215 17.4341 12.9869 17.4808 12.75 17.4808C12.5131 17.4808 12.2785 17.4341 12.0597 17.3432C11.8409 17.2524 11.6422 17.1192 11.475 16.9514L2.02497 7.50141C1.68789 7.1627 1.49866 6.70428 1.49866 6.22641C1.49866 5.74855 1.68789 5.29013 2.02497 4.95141L3.97497 3.00141C4.31369 2.66433 4.77211 2.4751 5.24997 2.4751C5.72784 2.4751 6.18626 2.66433 6.52497 3.00141L15.975 12.4514Z"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: 'Rate Plans',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="19"
          viewBox="0 0 18 19"
          fill="none"
        >
          <path
            d="M9 14.4768H3C2.60218 14.4768 2.22064 14.3188 1.93934 14.0375C1.65804 13.7562 1.5 13.3746 1.5 12.9768V6.97681C1.5 6.57898 1.65804 6.19745 1.93934 5.91615C2.22064 5.63484 2.60218 5.47681 3 5.47681H15C15.3978 5.47681 15.7794 5.63484 16.0607 5.91615C16.342 6.19745 16.5 6.57898 16.5 6.97681V10.7268"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: 'Subscriptions',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="19"
          viewBox="0 0 18 19"
          fill="none"
        >
          <path
            d="M8.25 8.47681V11.4768M8.25 11.4768H11.25M8.25 11.4768L9.40125 10.2731"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
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
