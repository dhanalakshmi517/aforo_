import React, { useEffect, useState } from 'react';
import './Main.css';
import CookieConsentBanner from './components/cookie-consent/Banner';
import { RatePlan } from './components/Rateplan/RatePlans';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/Landing/SignIn';
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

  // Hide sidebar when creating or editing entities
  useEffect(() => {
    const isEditingPlan = /\/get-started\/rate-plans\/\d+\/edit$/.test(location.pathname);
    const isEditingCustomer = /\/get-started\/customers\/\d+\/edit$/.test(location.pathname);

    if (
      showCreatePlan ||
      showNewProductForm ||
      showNewCustomerForm ||
      showNewUsageMetricForm ||
      showNewSubscriptionForm ||
      hideSidebarOnEditMetric ||
      isEditingPlan ||
      isEditingCustomer
    ) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [
    showCreatePlan,
    showNewProductForm,
    showNewCustomerForm,
    showNewUsageMetricForm,
    showNewSubscriptionForm,
    hideSidebarOnEditMetric,
    location.pathname
  ]);

  // Show loading state while checking auth
  if (isAuthLoading && !isAuthRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <CookieConsentBanner />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/signin"
          element={user ? <Navigate to="/get-started" replace /> : <SignIn />}
        />
        <Route
          path="/contact-sales"
          element={
            <div className="min-h-screen">
              <Organization />
            </div>
          }
        />
        <Route
          path="/thank-you"
          element={
            <div className="min-h-screen">
              <ThankYou />
            </div>
          }
        />
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/get-started" replace />
            ) : (
              <div className="min-h-screen">
                <Landing />
              </div>
            )
          }
        />

        {/* Protected routes - Get Started */}
        <Route path="/get-started" element={
          <ProtectedRoute>
            <div className="flex flex-col">
              <div className="flex-1">
                <SideNavbar
                  activeTab={currentTab}
                  onTabClick={(tab) => {
                    const slug =
                      tab === 'Billable Metrics'
                        ? 'metering'
                        : tab === 'Purchases'
                        ? 'subscriptions'
                        : tab === 'Data Ingetion'
                        ? 'data-ingetion'
                        : tab.toLowerCase().replace(/\s+/g, '-');
                    navigate(`/get-started/${slug}`);
                  }}
                  hidden={!showSidebar}
                />
                <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                  <div className="py-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h1>
                    <p className="text-gray-600 mb-6"></p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer" onClick={() => navigate('/get-started/products')}>
                        <h3 className="text-lg font-semibold mb-2">Products</h3>
                        <p className="text-gray-600"></p>
                      </div>
                      <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer" onClick={() => navigate('/get-started/customers')}>
                        <h3 className="text-lg font-semibold mb-2">Customers</h3>
                        <p className="text-gray-600"></p>
                      </div>
                      <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer" onClick={() => navigate('/get-started/metering')}>
                        <h3 className="text-lg font-semibold mb-2">Metering</h3>
                        <p className="text-gray-600"></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        {/* Rate Plans */}
        <Route path="/get-started/rate-plans" element={
          <ProtectedRoute>
            <div className="flex flex-col">
              <div className="flex-1">
                <SideNavbar
                  activeTab={currentTab}
                  onTabClick={(tab) => {
                    const slug =
                      tab === 'Billable Metrics'
                        ? 'metering'
                        : tab === 'Purchases'
                        ? 'subscriptions'
                        : tab === 'Data Ingetion'
                        ? 'data-ingetion'
                        : tab.toLowerCase().replace(/\s+/g, '-');
                    navigate(`/get-started/${slug}`);
                  }}
                  hidden={!showSidebar}
                />
                <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                  <RatePlans
                    ratePlans={ratePlans}
                    setRatePlans={setRatePlans}
                    showCreatePlan={showCreatePlan}
                    setShowCreatePlan={setShowCreatePlan}
                  />
                </div>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/get-started/products" element={
          <ProtectedRoute>
            <div className="flex flex-col">
              <div className="flex-1">
                {!isNewProductPage && (
                  <SideNavbar
                    activeTab={currentTab}
                    onTabClick={(tab) => {
                      const slug =
                        tab === 'Billable Metrics'
                          ? 'metering'
                          : tab === 'Purchases'
                          ? 'subscriptions'
                          : tab === 'Data Ingetion'
                          ? 'data-ingetion'
                          : tab.toLowerCase().replace(/\s+/g, '-');
                      navigate(`/get-started/${slug}`);
                    }}
                    hidden={!showSidebar}
                  />
                )}
                <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                  <Products
                    showNewProductForm={showNewProductForm}
                    setShowNewProductForm={setShowNewProductForm}
                  />
                </div>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/get-started/products/new" element={
          <ProtectedRoute>
            <div className="flex flex-col">
              <div className="flex-1">
                <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                  <NewProduct onClose={() => navigate('/get-started/products')} />
                </div>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        {/* Billable Metrics */}
        <Route path="/get-started/metering" element={
          <ProtectedRoute>
            <div className="flex flex-col">
              <div className="flex-1">
                <SideNavbar
                  activeTab={currentTab}
                  onTabClick={(tab) => {
                    const slug =
                      tab === 'Billable Metrics'
                        ? 'metering'
                        : tab === 'Purchases'
                        ? 'subscriptions'
                        : tab === 'Data Ingetion'
                        ? 'data-ingetion'
                        : tab.toLowerCase().replace(/\s+/g, '-');
                    navigate(`/get-started/${slug}`);
                  }}
                  hidden={!showSidebar}
                />
                <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                  <Metering
                    showNewUsageMetricForm={showNewUsageMetricForm}
                    setShowNewUsageMetricForm={setShowNewUsageMetricForm}
                    setHideSidebarOnEditMetric={setHideSidebarOnEditMetric}
                  />
                </div>
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Purchases / Subscriptions */}
        <Route path="/get-started/subscriptions" element={
          <ProtectedRoute>
            <div className="flex flex-col">
              <div className="flex-1">
                <SideNavbar
                  activeTab={currentTab}
                  onTabClick={(tab) => {
                    const slug =
                      tab === 'Billable Metrics'
                        ? 'metering'
                        : tab === 'Purchases'
                        ? 'subscriptions'
                        : tab === 'Data Ingetion'
                        ? 'data-ingetion'
                        : tab.toLowerCase().replace(/\s+/g, '-');
                    navigate(`/get-started/${slug}`);
                  }}
                  hidden={!showSidebar}
                />
                <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                  <Subscriptions
                    showNewSubscriptionForm={showNewSubscriptionForm}
                    setShowNewSubscriptionForm={setShowNewSubscriptionForm}
                  />
                </div>
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/get-started/customers" element={
          <ProtectedRoute>
            <div className="flex flex-col">
              <div className="flex-1">
                <SideNavbar
                  activeTab={currentTab}
                  onTabClick={(tab) => {
                    const slug =
                      tab === 'Billable Metrics'
                        ? 'metering'
                        : tab === 'Purchases'
                        ? 'subscriptions'
                        : tab === 'Data Ingetion'
                        ? 'data-ingetion'
                        : tab.toLowerCase().replace(/\s+/g, '-');
                    navigate(`/get-started/${slug}`);
                  }}
                  hidden={!showSidebar}
                />
                <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                  <Customers
                    showNewCustomerForm={showNewCustomerForm}
                    setShowNewCustomerForm={setShowNewCustomerForm}
                  />
                </div>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/get-started/customers/:id/edit" element={
          <ProtectedRoute>
            <div className="flex flex-col">
              <div className="flex-1">
                <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                  <EditCustomer />
                </div>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        {/* Add other protected routes similarly */}
        <Route path="*" element={<Navigate to="/get-started/products" replace />} />
      </Routes>
    </div>
  );
}
