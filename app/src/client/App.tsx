import * as React from 'react';
import { useEffect, useState, Suspense } from 'react';
import '../index.css';
import CookieConsentBanner from './components/cookie-consent/Banner';
import { RatePlan } from './components/Rateplan/RatePlans';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/Landing/SignIn';
import { ToastProvider } from './components/componenetsss/ToastProvider';
import TremorProvider from './components/TremorProvider';

// ========= Mock Wasp auth pieces (restore these) =========
interface User {
  id: string;
  lastActiveTimestamp?: Date;
}
const useAuth = () => {
  return {
    data: null as User | null,
    isLoading: false
  };
};
const updateCurrentUserLastActiveTimestamp = async (update: { lastActiveTimestamp: Date }) => {
  console.log('Updating last active timestamp:', update.lastActiveTimestamp);
};
// =========================================================

import Landing from './components/Landing/Landing';
import Organization from './components/Landing/Organization';
import { ProtectedRoute } from './components/Common/ProtectedRoute';
import SideNavbar from './components/SideNavbar/SideNavbar';
import DashboardGallery from './components/Dashboard/DashboardGallery';
import ProductAnalyticsPage from './components/Dashboard/ProductAnalyticsPage';

const customersLoader = () => import('./components/Customers/Customers');
const Customers = React.lazy(customersLoader) as React.ComponentType<any>;

const editCustomerLoader = () => import('./components/Customers/EditCustomers/EditCustomer');
const EditCustomer = React.lazy(editCustomerLoader) as React.ComponentType<any>;

const productsLoader = () => import('./components/Products/Products');
const Products = React.lazy(productsLoader) as React.ComponentType<any>;
const newProductLoader = () => import('./components/Products/NewProducts/NewProduct');
const NewProduct = React.lazy(newProductLoader) as React.ComponentType<any>;
const KongProductSelect = React.lazy(() => import('./components/Products/Kong Integration/KongProductSelect')) as React.ComponentType<any>;
const meteringLoader = () => import('./components/Metering/Metering');
const Metering = React.lazy(meteringLoader) as React.ComponentType<any>;
const createUsageMetricLoader = () => import('./components/Metering/CreateUsageMetric');
const CreateUsageMetric = React.lazy(createUsageMetricLoader) as React.ComponentType<any>;
const subscriptionsLoader = () => import('./components/Subscriptions/Subscriptions');
const Subscriptions = React.lazy(subscriptionsLoader) as React.ComponentType<any>;
const createSubscriptionLoader = () => import('./components/Subscriptions/CreateSubscription');
const CreateSubscription = React.lazy(createSubscriptionLoader) as React.ComponentType<any>;
const dataIngestionLoader = () => import('./components/DataIngestion/DataIngestionPage');
const DataIngestionPage = React.lazy(dataIngestionLoader) as React.ComponentType<any>;
const integrationsLoader = () => import('./components/Integrations/Integrations');
const Integrations = React.lazy(integrationsLoader) as React.ComponentType<any>;
import EstimateRevenue from './components/Rateplan/Revenue/EstimateRevenue';
import UsageEstimation from './components/Rateplan/Revenue/UsageEstimation';
import VolumeEstimation from './components/Rateplan/Revenue/VolumeEstimation';
import TieredEstimation from './components/Rateplan/Revenue/TieredEstimation';
import StairEstimation from './components/Rateplan/Revenue/StairEstimation';

const ratePlansLoader = () => import('./components/Rateplan/RatePlans');
const RatePlans = React.lazy(ratePlansLoader) as React.ComponentType<any>;
const editPlanLoader = () => import('./components/Rateplan/EditRatePlan/EditRatePlan');
const EditPlan = React.lazy(editPlanLoader) as React.ComponentType<any>;

import LoginPage from '../auth/LoginPage';
import ThankYou from './components/Landing/ThankYou';
import Settings from './components/Settings/Settings';
import KongIntegration from './components/Products/Kong Integration/KongIntegration';
import ApigeeIntegration from './components/ApigeeIntegration/ApigeeIntegration';
import ApigeeSuccess from './components/ApigeeIntegration/ApigeeSuccess';
import ApigeeFailure from './components/ApigeeIntegration/ApigeeFailure';
import ApigeeImport from './components/ApigeeIntegration/ApigeeImport';

export default function App() {
  const navigate = useNavigate();
  const { data: user, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();
  const [isNewProductPage, setIsNewProductPage] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Update page states when location changes
  useEffect(() => {
    setIsNewProductPage(location.pathname === '/get-started/products/new');
    
    // Reset sidebar visibility when navigating away from edit pages
    if (!location.pathname.includes('/edit') && !location.pathname.endsWith('/new')) {
      setShowSidebar(true);
    }
  }, [location.pathname]);
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
    // @ts-ignore
    window.addEventListener('toggleSidebar', handleToggleSidebar);
    return () => {
      // @ts-ignore
      window.removeEventListener('toggleSidebar', handleToggleSidebar);
    };
  }, []);

  // Update last active timestamp (uses restored mock)
  useEffect(() => {
    if (user) {
      const now = new Date();
      const userUpdate = { lastActiveTimestamp: now };
      if (user.lastActiveTimestamp) {
        const lastActive = new Date(user.lastActiveTimestamp);
        if (now.getTime() - lastActive.getTime() > 5 * 60 * 1000) {
          updateCurrentUserLastActiveTimestamp(userUpdate).catch(console.error);
        }
      } else {
        updateCurrentUserLastActiveTimestamp(userUpdate).catch(console.error);
      }
    }
  }, [user]);

  const currentTab = (() => {
    const path = location.pathname;
    if (path === '/get-started') return 'Get Started';
    if (path.startsWith('/get-started/customers')) return 'Customers';
    if (path.startsWith('/get-started/products')) return 'Products';
    if (path.startsWith('/get-started/rate-plans')) return 'Rate Plans';
    if (path.startsWith('/get-started/metering')) return 'Billable Metrics';
    if (path.startsWith('/get-started/data-ingetion')) return 'Data Ingetion';
    if (path.startsWith('/get-started/subscriptions')) return 'Purchases';
    if (path.startsWith('/get-started/dashboards')) return 'Dashboards';
    if (path.startsWith('/get-started/integrations')) return 'Integrations';
    if (path.startsWith('/get-started/settings')) return 'Settings';
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

  // Prefetch heavy modules (also edit screen)
  useEffect(() => {
    customersLoader();
    meteringLoader();
    subscriptionsLoader();
    ratePlansLoader();
    editPlanLoader();
    editCustomerLoader();
    dataIngestionLoader(); // Prefetch data ingestion chunk
    integrationsLoader(); // Prefetch integrations chunk
  }, []);

  // Small reusable spinner for route-level Suspense
  const RouteSpinner = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <ToastProvider>
    <TremorProvider>
    <div className="min-h-screen bg-white">
      <CookieConsentBanner />
      <Suspense
        // Keep your existing behavior, BUT we add a route-level fallback below for edit screens
        fallback={
          !localStorage.getItem('aforo_auth_token') ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : null
        }
      >
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signin" element={user ? <Navigate to="/get-started" replace /> : <SignIn />} />
          <Route path="/contact-sales" element={<div className="min-h-screen"><Organization /></div>} />
          <Route path="/thank-you" element={<div className="min-h-screen"><ThankYou /></div>} />
          <Route
            path="*"
            element={user ? <Navigate to="/get-started" replace /> : <div className="min-h-screen"><Landing /></div>}
          />

          {/* Get Started landing — ONLY sidebar */}
          <Route
            path="/get-started"
            element={
              <ProtectedRoute>
                <SideNavbar
                  activeTab={currentTab}
                  onTabClick={(tab) => {
                    if (tab === 'Settings') {
                      navigate('/get-started/settings');
                    } else {
                      const slug =
                        tab === 'Billable Metrics'
                          ? 'metering'
                          : tab === 'Purchases'
                          ? 'subscriptions'
                          : tab === 'Data Ingetion'
                          ? 'data-ingetion'
                          : tab === 'Integrations'
                          ? 'integrations'
                          : tab.toLowerCase().replace(/\s+/g, '-');
                      navigate(`/get-started/${slug}`);
                    }
                  }}
                  hidden={!showSidebar}
                />
              </ProtectedRoute>
            }
          />

          {/* Dashboards — ONLY sidebar */}
          <Route
            path="/get-started/dashboards"
            element={
              <ProtectedRoute>
                <SideNavbar
                  activeTab={currentTab}
                  onTabClick={(tab) => {
                    if (tab === 'Settings') {
                      navigate('/get-started/settings');
                    } else {
                      const slug =
                        tab === 'Billable Metrics'
                          ? 'metering'
                          : tab === 'Purchases'
                          ? 'subscriptions'
                          : tab === 'Data Ingetion'
                          ? 'data-ingetion'
                          : tab === 'Integrations'
                          ? 'integrations'
                          : tab.toLowerCase().replace(/\s+/g, '-');
                      navigate(`/get-started/${slug}`);
                    }
                  }}
                  hidden={!showSidebar}
                />
                <DashboardGallery
                  onCardClick={(card) => {
                    if (card.id === 'product') {
                      navigate('/get-started/dashboards/product-analytics');
                    }
                  }}
                />
              </ProtectedRoute>
            }
          />

          {/* Product Analytics dashboard detail */}
          <Route
            path="/get-started/dashboards/product-analytics"
            element={
              <ProtectedRoute>
                <SideNavbar
                  activeTab={currentTab}
                  onTabClick={(tab) => {
                    if (tab === 'Settings') {
                      navigate('/get-started/settings');
                    } else {
                      const slug =
                        tab === 'Billable Metrics'
                          ? 'metering'
                          : tab === 'Purchases'
                          ? 'subscriptions'
                          : tab === 'Data Ingetion'
                          ? 'data-ingetion'
                          : tab === 'Integrations'
                          ? 'integrations'
                          : tab.toLowerCase().replace(/\s+/g, '-');
                      navigate(`/get-started/${slug}`);
                    }
                  }}
                  hidden={!showSidebar}
                />
                <ProductAnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* Rate Plans list */}
          <Route
            path="/get-started/rate-plans"
            element={
              <ProtectedRoute>
                <div className="flex flex-col">
                  <div className="flex-1">
                    <SideNavbar
                      activeTab={currentTab}
                      onTabClick={(tab) => {
                        if (tab === 'Settings') {
                          navigate('/get-started/settings');
                        } else {
                          const slug =
                            tab === 'Billable Metrics'
                              ? 'metering'
                              : tab === 'Purchases'
                              ? 'subscriptions'
                              : tab === 'Data Ingetion'
                              ? 'data-ingetion'
                              : tab.toLowerCase().replace(/\s+/g, '-');
                          navigate(`/get-started/${slug}`);
                        }
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
            }
          />

          {/* Kong Integration */}
          <Route
            path="/kong-integration"
            element={
              <ProtectedRoute>
                <KongIntegration onClose={() => navigate(-1)} />
              </ProtectedRoute>
            }
          />

          {/* Apigee Integration */}
          <Route
            path="/apigee-integration"
            element={
              <ProtectedRoute>
                <ApigeeIntegration />
              </ProtectedRoute>
            }
          />

          {/* Apigee Success */}
          <Route
            path="/apigee-success"
            element={
              <ProtectedRoute>
                <ApigeeSuccess />
              </ProtectedRoute>
            }
          />

          {/* Apigee Failure */}
          <Route
            path="/apigee-failure"
            element={
              <ProtectedRoute>
                <ApigeeFailure />
              </ProtectedRoute>
            }
          />

          {/* Apigee Import */}
          <Route
            path="/apigee-import"
            element={
              <ProtectedRoute>
                <ApigeeImport />
              </ProtectedRoute>
            }
          />

          {/* Settings */}
          <Route
            path="/get-started/settings"
            element={
              <ProtectedRoute>
                <div className="flex">
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
                          : tab === 'Integrations'
                          ? 'integrations'
                          : tab.toLowerCase().replace(/\s+/g, '-');
                      navigate(`/get-started/${slug}`);
                    }}
                    hidden={!showSidebar}
                  />
                  <div className="flex-1 p-6">
                    <Settings />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Rate Plan Edit */}
          <Route
            path="/get-started/rate-plans/:id/edit"
            element={
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
                      <EditPlan />
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Products */}
          <Route
            path="/get-started/products"
            element={
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
                      <Products
                        showNewProductForm={showNewProductForm}
                        setShowNewProductForm={setShowNewProductForm}
                      />
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/get-started/products/new"
            element={
              <ProtectedRoute>
                <div className="flex flex-col">
                  <div className="flex-1">
                    <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                      <NewProduct onClose={() => navigate('/get-started/products')} />
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Metering */}
          <Route
            path="/get-started/metering"
            element={
              <ProtectedRoute>
                <div className="flex flex-col">
                  <div className="flex-1">
                    <SideNavbar
                      activeTab={currentTab}
                      onTabClick={(tab) => {
                        if (tab === 'Settings') {
                          navigate('/get-started/settings');
                        } else {
                          const slug =
                            tab === 'Billable Metrics'
                              ? 'metering'
                              : tab === 'Purchases'
                              ? 'subscriptions'
                              : tab === 'Data Ingetion'
                              ? 'data-ingetion'
                              : tab.toLowerCase().replace(/\s+/g, '-');
                          navigate(`/get-started/${slug}`);
                        }
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
            }
          />

          <Route
            path="/get-started/metering/new"
            element={
              <ProtectedRoute>
                <div className="flex flex-col">
                  <div className="flex-1">
                    <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                      <CreateUsageMetric onClose={() => navigate('/get-started/metering')} />
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Subscriptions */}
          <Route
            path="/get-started/subscriptions"
            element={
              <ProtectedRoute>
                <div className="flex flex-col">
                  <div className="flex-1">
                    <SideNavbar
                      activeTab={currentTab}
                      onTabClick={(tab) => {
                        if (tab === 'Settings') {
                          navigate('/get-started/settings');
                        } else {
                          const slug =
                            tab === 'Billable Metrics'
                              ? 'metering'
                              : tab === 'Purchases'
                              ? 'subscriptions'
                              : tab === 'Data Ingetion'
                              ? 'data-ingetion'
                              : tab.toLowerCase().replace(/\s+/g, '-');
                          navigate(`/get-started/${slug}`);
                        }
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
            }
          />

          <Route
            path="/get-started/subscriptions/new"
            element={
              <ProtectedRoute>
                <div className="flex flex-col">
                  <div className="flex-1">
                    <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                      <CreateSubscription 
                        onClose={() => navigate('/get-started/subscriptions')}
                        onCreateSuccess={() => navigate('/get-started/subscriptions')}
                        onRefresh={() => {}}
                      />
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Customers */}
          <Route
            path="/get-started/customers"
            element={
              <ProtectedRoute>
                <div className="flex flex-col">
                  <div className="flex-1">
                    <SideNavbar
                      activeTab={currentTab}
                      onTabClick={(tab) => {
                        if (tab === 'Settings') {
                          navigate('/get-started/settings');
                        } else {
                          const slug =
                            tab === 'Billable Metrics'
                              ? 'metering'
                              : tab === 'Purchases'
                              ? 'subscriptions'
                              : tab === 'Data Ingetion'
                              ? 'data-ingetion'
                              : tab.toLowerCase().replace(/\s+/g, '-');
                          navigate(`/get-started/${slug}`);
                        }
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
            }
          />

          {/* Customer Edit */}
          <Route
            path="/get-started/customers/:id/edit"
            element={
              <ProtectedRoute>
                <div className="flex flex-col">
                  <div className="flex-1">
                    <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                      {/* NEW: route-level Suspense so we always show a loader while chunk loads */}
                      <Suspense fallback={RouteSpinner}>
                        <EditCustomer />
                      </Suspense>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Data Ingestion */}
          <Route
            path="/get-started/data-ingetion"
            element={
              <ProtectedRoute>
                <div className="flex flex-col">
                  <div className="flex-1">
                    <SideNavbar
                      activeTab={currentTab}
                      onTabClick={(tab) => {
                        if (tab === 'Settings') {
                          navigate('/get-started/settings');
                        } else {
                          const slug =
                            tab === 'Billable Metrics'
                              ? 'metering'
                              : tab === 'Purchases'
                              ? 'subscriptions'
                              : tab === 'Data Ingetion'
                              ? 'data-ingetion'
                              : tab.toLowerCase().replace(/\s+/g, '-');
                          navigate(`/get-started/${slug}`);
                        }
                      }}
                      hidden={!showSidebar}
                    />
                    <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                      <Suspense fallback={RouteSpinner}>
                        <DataIngestionPage />
                      </Suspense>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Integrations */}
          <Route
            path="/get-started/integrations"
            element={
              <ProtectedRoute>
                <div className="flex flex-col">
                  <div className="flex-1">
                    <SideNavbar
                      activeTab={currentTab}
                      onTabClick={(tab) => {
                        if (tab === 'Settings') {
                          navigate('/get-started/settings');
                        } else {
                          const slug =
                            tab === 'Billable Metrics'
                              ? 'metering'
                              : tab === 'Purchases'
                              ? 'subscriptions'
                              : tab === 'Data Ingetion'
                              ? 'data-ingetion'
                              : tab === 'Integrations'
                              ? 'integrations'
                              : tab.toLowerCase().replace(/\s+/g, '-');
                          navigate(`/get-started/${slug}`);
                        }
                      }}
                      hidden={!showSidebar}
                    />
                    <div className="flex-1">
                      <Suspense fallback={RouteSpinner}>
                        <Integrations />
                      </Suspense>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Import from Kong */}
          <Route
            path="/get-started/products/import"
            element={
              <ProtectedRoute>
                <KongProductSelect 
                  onBack={() => {
                    // If coming from settings, navigate directly to settings
                    if (location.state?.from === 'settings') {
                      navigate('/get-started/settings');
                    } else {
                      navigate(-1);
                    }
                  }} 
                  previousRoute={location.state?.from === 'settings' ? 'settings' : 'products'}
                />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/get-started" replace />} />
        </Routes>
      </Suspense>
    </div>
    </TremorProvider>
    </ToastProvider>
  );
}
