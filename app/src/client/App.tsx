import React, { useEffect, useState } from 'react';
import './Main.css';
import CookieConsentBanner from './components/cookie-consent/Banner';
import { RatePlan } from './components/Rateplan/RatePlans';
import { useNavigate, useLocation } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';
import { updateCurrentUserLastActiveTimestamp } from 'wasp/client/operations';
import { cn } from './cn';
import LandingPage from '../landing-page/LandingPage';
import NavBar from './components/NavBar/NavBar';
import SideNavbar from './components/SideNavbar/SideNavbar';
import Customers from './components/Customers/Customers';
import Products from './components/Products/Products';
import Metering from './components/Metering/Metering';
import EditPlan from './components/RatePlans/EditRatePlans/EditPlan';
import RatePlans from './components/Rateplan/RatePlans';
import LoginPage from '../auth/LoginPage';

/**
 * use this component to wrap all child components
 * this is useful for templates, themes, and context
 */
export default function App() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [showNewUsageMetricForm, setShowNewUsageMetricForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const lastSeenAt = new Date(user.lastActiveTimestamp);
      const today = new Date();
      if (today.getTime() - lastSeenAt.getTime() > 5 * 60 * 1000) {
        updateCurrentUserLastActiveTimestamp({ lastActiveTimestamp: today });
      }
    }
  }, [user]);

  const navigationItems = [
    {
      name: 'Home',
      to: '/',
    },
    {
      name: 'Get Started',
      to: '/get-started',
    },
    {
      name: 'Customers',
      to: '/get-started/customers',
    },
    {
      name: 'Products',
      to: '/get-started/products',
    },
    {
      name: 'Rate Plans',
      to: '/get-started/rate-plans',
    },
    {
      name: 'Billable Metrics',
      to: '/get-started/metering',
    }
  ];

  const currentTab = (() => {
    if (location.pathname === '/get-started') return 'Get Started';
    if (location.pathname === '/get-started/customers') return 'Customers';
    if (location.pathname === '/get-started/products') return 'Products';
    if (location.pathname === '/get-started/rate-plans') return 'Rate Plans';
    if (location.pathname === '/get-started/metering') return 'Billable Metrics';
    return 'Get Started';
  })();

  // Hide sidebar when creating a new customer, rate plan, or product
  useEffect(() => {
    const isEditingPlan = /\/get-started\/rate-plans\/\d+\/edit$/.test(location.pathname);
    if (showCreatePlan || showNewProductForm || showNewCustomerForm || showNewUsageMetricForm || isEditingPlan) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [showCreatePlan, showNewProductForm, showNewCustomerForm, showNewUsageMetricForm, location.pathname]);

  return (
    <div className='min-h-screen bg-white'>
      <CookieConsentBanner />
      <div className='flex flex-col'>
        {location.pathname === '/' && (
          <NavBar navigationItems={navigationItems} />
        )}
        <div className='flex-1'>
          <Routes>
            <Route path="/" element={
              <div className="min-h-screen">
                <LandingPage />
              </div>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/get-started/*" element={
              <div className="empty-background">
                <div className="flex h-full">
                  <SideNavbar 
                    activeTab={currentTab} 
                    onTabClick={(tab) => {
                      const slug = tab === 'Billable Metrics' ? 'metering' : tab.toLowerCase().replace(/\s+/g, '-');
                      navigate(`/get-started/${slug}`);
                    }} 
                    hidden={!showSidebar} 
                  />
                  <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <Routes>
                      <Route index element={<div className="flex-1 h-full">Empty Content</div>} />
                      <Route path="customers" element={<Customers showNewCustomerForm={showNewCustomerForm} setShowNewCustomerForm={setShowNewCustomerForm} />} />
                      <Route path="products" element={<Products showNewProductForm={showNewProductForm} setShowNewProductForm={setShowNewProductForm} />} />
                      <Route path="rate-plans" element={<RatePlans 
                        showCreatePlan={showCreatePlan} 
                        setShowCreatePlan={setShowCreatePlan}
                        ratePlans={ratePlans}
                      />} />
                      <Route path="metering" element={<Metering 
                        showNewUsageMetricForm={showNewUsageMetricForm}
                        setShowNewUsageMetricForm={setShowNewUsageMetricForm}
                      />} />
                      <Route path="rate-plans/:id/edit" element={<EditPlan onClose={() => navigate(-1)} />} />
                    </Routes>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
}
