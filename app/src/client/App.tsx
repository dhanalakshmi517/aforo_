import React, { useEffect, useState } from 'react';
import './Main.css';
import CookieConsentBanner from './components/cookie-consent/Banner';
import { RatePlan } from './components/Rateplan/RatePlans';
import { useNavigate, useLocation } from 'react-router-dom';
import SignIn from './components/Landing/SignIn';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';
import { updateCurrentUserLastActiveTimestamp } from 'wasp/client/operations';
import { cn } from './cn';
import Landing from './components/Landing/Landing';
import Organization from './components/Landing/Organization';
import { ProtectedRoute } from './components/Common/ProtectedRoute';
import SideNavbar from './components/SideNavbar/SideNavbar';
import Customers from './components/Customers/Customers';
import EditCustomer from './components/Customers/EditCustomers/EditCustomer';
import Products from './components/Products/Products';
import NewProduct from './components/Products/NewProducts/NewProduct';
import Metering from './components/Metering/Metering';
import Subscriptions from './components/Subscriptions/Subscriptions';
import DataIngestion from './components/DataIngestion/DataIngestion';
import EstimateRevenue from './components/Rateplan/Revenue/EstimateRevenue';
import UsageEstimation from './components/Rateplan/Revenue/UsageEstimation';
import VolumeEstimation from './components/Rateplan/Revenue/VolumeEstimation';
import TieredEstimation from './components/Rateplan/Revenue/TieredEstimation';
import StairEstimation from './components/Rateplan/Revenue/StairEstimation';
import RatePlans from './components/Rateplan/RatePlans';
import EditPlan from './components/Rateplan/EditRatePlan/EditRatePlan';
import LoginPage from '../auth/LoginPage';
import ThankYou from './components/Landing/ThankYou';

/**
 * use this component to wrap all child components
 * this is useful for templates, themes, and context
 */
export default function App() {
  const navigate = useNavigate();
  const { data: user, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();
  const isNewProductPage = location.pathname === '/get-started/products/new';
  const isAuthRoute = ['/signin', '/login', '/contact-sales', '/thank-you', '/'].includes(location.pathname);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [showNewUsageMetricForm, setShowNewUsageMetricForm] = useState(false);
  const [hideSidebarOnEditMetric, setHideSidebarOnEditMetric] = useState(false);
  const [hideSidebarOnEditCustomer, setHideSidebarOnEditCustomer] = useState(false);
  const [showNewSubscriptionForm, setShowNewSubscriptionForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hideBreadcrumb, setHideBreadcrumb] = useState(false);

  // Listen for toggleSidebar events from child components
  useEffect(() => {
    const handleToggleSidebar = (event: CustomEvent) => {
      const { shouldShow, hideBreadcrumb: shouldHideBreadcrumb } = event.detail;
      setShowSidebar(shouldShow);
      setHideBreadcrumb(shouldHideBreadcrumb);
    };

    // @ts-ignore - CustomEvent type issue
    window.addEventListener('toggleSidebar', handleToggleSidebar);
    
    // Cleanup
    return () => {
      // @ts-ignore - CustomEvent type issue
      window.removeEventListener('toggleSidebar', handleToggleSidebar);
    };
  }, []);

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
    if (location.pathname === '/get-started/data-ingetion') return 'Data Ingetion';

    if (location.pathname === '/get-started/subscriptions') return 'Purchases';


    return 'Get Started';
  })();

  // Hide sidebar when creating a new customer, rate plan, or product
  useEffect(() => {
    const isEditingPlan = /\/get-started\/rate-plans\/\d+\/edit$/.test(location.pathname);
    const isEditingCustomer = /\/get-started\/customers\/\d+\/edit$/.test(location.pathname);

    if (showCreatePlan || showNewProductForm || showNewCustomerForm || showNewUsageMetricForm || showNewSubscriptionForm || hideSidebarOnEditMetric || isEditingPlan || isEditingCustomer) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }

  }, [showCreatePlan, showNewProductForm, showNewCustomerForm, showNewUsageMetricForm, showNewSubscriptionForm, hideSidebarOnEditMetric, location.pathname]);



  // Show loading state while checking auth
  if (isAuthLoading && !isAuthRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      <CookieConsentBanner />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signin" element={
          user ? <Navigate to="/get-started" replace /> : <SignIn />
        } />
        <Route path="/contact-sales" element={
          <div className="min-h-screen">
            <Organization />
          </div>
        } />
        <Route path="/thank-you" element={
          <div className="min-h-screen">
            <ThankYou />
          </div>
        } />
        <Route path="/" element={
          user ? <Navigate to="/get-started" replace /> : (
            <div className="min-h-screen">
              <Landing />
            </div>
          )
        } />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute><div className="flex flex-col"><div className="flex-1">
          {!isNewProductPage && (
            <SideNavbar 
              activeTab={currentTab} 
              onTabClick={(tab) => {
                const slug =
                tab === 'Billable Metrics' ? 'metering'
                : tab === 'Purchases' ? 'subscriptions'
                : tab === 'Data Ingetion' ? 'data-ingetion'
                : tab.toLowerCase().replace(/\s+/g, '-');
                navigate(`/get-started/${slug}`);
              }} 
              hidden={!showSidebar} 
            />
          )}
          <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route index element={<Navigate to="/get-started" replace />} />
              <Route path="estimate-revenue" element={<EstimateRevenue />} />
              <Route path="usage-estimation" element={<UsageEstimation />} />
              <Route path="volume-estimation" element={<VolumeEstimation />} />
              <Route path="tiered-estimation" element={<TieredEstimation />} />
              <Route path="stair-estimation" element={<StairEstimation />} />
              
              <Route path="get-started">
                <Route index element={<div className="flex-1 h-full">Empty Content</div>} />
                <Route path="customers" element={
                  <Customers 
                    showNewCustomerForm={showNewCustomerForm} 
                    setShowNewCustomerForm={setShowNewCustomerForm} 
                  />
                } />
                <Route path="customers/:id/edit" element={<EditCustomer />} />
                <Route path="products" element={
                  <Products 
                    showNewProductForm={showNewProductForm} 
                    setShowNewProductForm={setShowNewProductForm} 
                  />
                } />
                <Route path="products/new" element={
                  <NewProduct 
                    onClose={() => navigate('/get-started/products')} 
                  />
                } />
                <Route path="rate-plans" element={
                  <RatePlans 
                    showCreatePlan={showCreatePlan} 
                    setShowCreatePlan={setShowCreatePlan}
                    ratePlans={ratePlans}
                  />
                } />
                <Route path="rate-plans/:id/edit" element={
                  <EditPlan onClose={() => navigate(-1)} />
                } />
                <Route path="rate-plans/estimate-revenue" element={<EstimateRevenue />} />
                <Route path="rate-plans/usage-estimation" element={<UsageEstimation />} />
                <Route path="rate-plans/volume-estimation" element={<VolumeEstimation />} />
                <Route path="rate-plans/tiered-estimation" element={<TieredEstimation />} />
                <Route path="rate-plans/stair-estimation" element={<StairEstimation />} />
                <Route path="subscriptions" element={
                  <Subscriptions 
                    showNewSubscriptionForm={showNewSubscriptionForm}
                    setShowNewSubscriptionForm={setShowNewSubscriptionForm}
                  />
                } />
                <Route path="data-ingetion" element={<DataIngestion />} />
                <Route path="metering" element={
                  <Metering 
                    showNewUsageMetricForm={showNewUsageMetricForm}
                    setShowNewUsageMetricForm={setShowNewUsageMetricForm}
                    setHideSidebarOnEditMetric={setHideSidebarOnEditMetric}
                  />
                } />
              </Route>
            </Routes>
          </div>
        </div></div></ProtectedRoute>}>
          {/* These routes are protected and will be wrapped by the ProtectedRoute */}
          <Route path="/*" element={
            <Navigate to="/get-started" replace />
          } />
        </Route>
      </Routes>
    </div>
  );
}
