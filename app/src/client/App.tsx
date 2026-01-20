import * as React from 'react';
import { useEffect, useState, Suspense } from 'react';
import '../index.css';
import 'flag-icons/css/flag-icons.min.css';
import CookieConsentBanner from './components/cookie-consent/Banner';
import { RatePlan } from './components/Rateplan/RatePlans';
import { useNavigate, useLocation, Routes, Route, Navigate, useParams } from 'react-router-dom';
import SignIn from './components/Landing/SignIn';
import ForgotPassword from './components/Landing/ForgotPassword';
import ResetLinkSent from './components/Landing/ResetLinkSent';
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
import CustomerOverviewHeader from './components/Dashboard/customeranalysis/CustomerOverviewHeader';
import CustomerOverviewStats from './components/Dashboard/customeranalysis/CustomerOverviewStats';
import CustomerHealthOverview from './components/Dashboard/customeranalysis/CustomerHealthOverview';
import TopAtRiskCustomers from './components/Dashboard/customeranalysis/TopAtRiskCustomers';


const customersLoader = () => import('./components/Customers/Customers');
const Customers = React.lazy(customersLoader) as React.ComponentType<any>;

const editCustomerLoader = () => import('./components/Customers/EditCustomers/EditCustomer');
const EditCustomer = React.lazy(editCustomerLoader) as React.ComponentType<any>;

const createCustomerLoader = () => import('./components/Customers/CreateCustomer');
const CreateCustomer = React.lazy(createCustomerLoader) as React.ComponentType<any>;

const productsLoader = () => import('./components/Products/Products');
const Products = React.lazy(productsLoader) as React.ComponentType<any>;

const newProductLoader = () => import('./components/Products/NewProducts/NewProduct');
const NewProduct = React.lazy(newProductLoader) as React.ComponentType<any>;

const editProductLoader = () => import('./components/Products/EditProductsss/EditProduct');
const EditProduct = React.lazy(editProductLoader) as React.ComponentType<any>;

const meteringLoader = () => import('./components/Metering/Metering');
const Metering = React.lazy(meteringLoader) as React.ComponentType<any>;

const createUsageMetricLoader = () => import('./components/Metering/CreateUsageMetric');
const CreateUsageMetric = React.lazy(createUsageMetricLoader) as React.ComponentType<any>;

const editMetricsLoader = () => import('./components/Metering/EditMetering/EditMetrics');
const EditMetrics = React.lazy(editMetricsLoader) as React.ComponentType<any>;
const subscriptionsLoader = () => import('./components/Subscriptions/Subscriptions');
const Subscriptions = React.lazy(subscriptionsLoader) as React.ComponentType<any>;
const createSubscriptionLoader = () => import('./components/Subscriptions/CreateSubscription');
const CreateSubscription = React.lazy(createSubscriptionLoader) as React.ComponentType<any>;
const editSubscriptionLoader = () => import('./components/Subscriptions/EditSubscriptions/EditSubscription');
const EditSubscription = React.lazy(editSubscriptionLoader) as React.ComponentType<any>;
const dataIngestionLoader = () => import('./components/DataIngestion/DataIngestionPage');
const DataIngestionPage = React.lazy(dataIngestionLoader) as React.ComponentType<any>;
const integrationsLoader = () => import('./components/Integrations/Integrations');
const Integrations = React.lazy(integrationsLoader) as React.ComponentType<any>;

import EstimateRevenue from './components/Rateplan/Revenue/EstimateRevenue';
import UsageEstimation from './components/Rateplan/Revenue/UsageEstimation';
import VolumeEstimation from './components/Rateplan/Revenue/VolumeEstimation';
import ImportProducts from './components/componenetsss/ImportProducts';
import TieredEstimation from './components/Rateplan/Revenue/TieredEstimation';
import StairEstimation from './components/Rateplan/Revenue/StairEstimation';

const ratePlansLoader = () => import('./components/Rateplan/RatePlans');
const RatePlans = React.lazy(ratePlansLoader) as React.ComponentType<any>;
const createPricePlanLoader = () => import('./components/Rateplan/CreatePricePlan');
const CreatePricePlan = React.lazy(createPricePlanLoader) as React.ComponentType<any>;
const editPlanLoader = () => import('./components/Rateplan/EditRatePlan/EditRatePlan');
const EditPlan = React.lazy(editPlanLoader) as React.ComponentType<any>;

import LoginPage from '../auth/LoginPage';
import ThankYou from './components/Landing/ThankYou';
import Settings from './components/Settings/Settings';
import KongIntegration from './components/Products/Kong Integration/KongIntegration';
import ApigeeIntegration from './components/ApigeeIntegration/ApigeeIntegration';
import ApigeeSuccess from './components/ApigeeIntegration/ApigeeSuccess';
import { getApigeeProducts } from './components/ApigeeIntegration/api';
import ApigeeFailure from './components/ApigeeIntegration/ApigeeFailure';
import ApigeeImport from './components/ApigeeIntegration/ApigeeImport';
import ApigeeImportedProducts from './components/ApigeeIntegration/ApigeeImportedProductsPage';
import SalesSite from './components/comingsoon/SalesSite';
import QBIntegration from './components/Integrations/Quickbooks/QBIntegration';
import QuickbooksIntegration from './components/Integrations/Quickbooks/QuickbooksIntegration';
import SuccessQB from './components/Integrations/Quickbooks/SuccessQB';
import TopHealthyCustomers from './components/Dashboard/customeranalysis/TopHealthyCustomers';
import TopChurningCustomers from './components/Dashboard/customeranalysis/TopChurningCustomers';
import CustomerSegmentation from './components/Dashboard/customeranalysis/CustomerSegmentation';
import NewVsExistingAndIndustries from './components/Dashboard/customeranalysis/NewVsExistingAndIndustries';
import RevenueAnalysisHeader from './components/Dashboard/RevenueAnalysis/RevenueAnalysisHeader';
import RevenueAnalytics from './components/Dashboard/RevenueAnalysis/RevenueAnalytics';
import RevenueSummaryCards from './components/Dashboard/RevenueAnalysis/RevenueSummaryCards';
import RevenuAnalyticsDash1 from './components/Dashboard/RevenueAnalysis/RevenuAnalyticsDash1';
import RevenueAnalyticsDash2 from './components/Dashboard/RevenueAnalysis/RevenueAnalyticsDash2';
import RevenueAnalyticsDash3 from './components/Dashboard/RevenueAnalysis/RevenueAnalyticsDash3';
import RevenueAnalyticsDash4 from './components/Dashboard/RevenueAnalysis/RevenueAnalyticsDash4';
import GrowthOpportunities from './components/Dashboard/RevenueAnalysis/GrowthOpportunities';
import RevenueAnalyticsDash5 from './components/Dashboard/RevenueAnalysis/RevenueAnalyticsDash5';
import RealTimeHeader from './components/Dashboard/Real-time analysis/RealTimeHeader';
import RealTimeKpiCards from './components/Dashboard/Real-time analysis/RealTimekpiCards';
import CustomersByUsageCard from './components/Dashboard/Real-time analysis/CustomersByUsageCard';
import RealTimePaymentsWidgets from './components/Dashboard/Real-time analysis/RealTimePaymentWidgets';
import BillableHeatmapAndRevenue from './components/Dashboard/Real-time analysis/BIllableHeatmapAndRevenue';
import ProductHeader from './components/Dashboard/Productanalyticsdashboard/ProductsHeaders';
import ProductsKpiStrip from './components/Dashboard/Productanalyticsdashboard/ProductsKpiStrip';
import RevenueBarsTwinCards from './components/Dashboard/Productanalyticsdashboard/RevenueBarTwinCards';
import RatePlansByProductTables from './components/Dashboard/Productanalyticsdashboard/RatePlansByProductTables';
import RepeatBuyersAndGrowth from './components/Dashboard/Productanalyticsdashboard/RepeatBuyersAndGrowth';
import UsageVolumeByProductType from './components/Dashboard/Productanalyticsdashboard/UsageVolumeByProductType';
import ProductsUsageTrends from './components/Dashboard/Productanalyticsdashboard/ProductUsageTrends';

// Wrapper to extract route params for EditMetrics
function EditMetricsWrapper() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  return <EditMetrics metricId={id} onClose={() => navigate('/get-started/metering')} />;
}

// Wrapper to extract route params for EditSubscription
function EditSubscriptionWrapper() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      if (id) {
        try {
          const { getSubscription } = await import('./components/Subscriptions/api');
          const subscriptionData = await getSubscription(Number(id));
          setSubscription(subscriptionData);
        } catch (error) {
          console.error('Failed to load subscription:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadSubscription();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <EditSubscription
      onClose={() => navigate('/get-started/subscriptions')}
      onRefresh={() => {}}
      initial={subscription}
    />
  );
}

// Wrapper component to pass navigation state to ApigeeSuccess
function ApigeeSuccessWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;
  
  const credentials = state ? [
    { label: "Organization ID", value: state.orgId || "" },
    { label: "Environment", value: state.environment || "" },
    { label: "Analytics Mode", value: state.analyticsMode || "" }
  ] : [];

  return (
    <ApigeeSuccess 
      onBack={() => navigate('/get-started/integrations')} 
      onImportProducts={() => navigate('/apigee-import')}
      credentials={credentials}
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const location = useLocation();

  const [isNewProductPage, setIsNewProductPage] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [showNewUsageMetricForm, setShowNewUsageMetricForm] = useState(false);
  const [hideSidebarOnEditMetric, setHideSidebarOnEditMetric] = useState(false);
  const [hideSidebarOnEditCustomer, setHideSidebarOnEditCustomer] = useState(false); // not used but kept
  const [showNewSubscriptionForm, setShowNewSubscriptionForm] = useState(false);
  const [loading, setLoading] = useState(true); // not used but kept
  const [error, setError] = useState(''); // not used but kept
  const [hideBreadcrumb, setHideBreadcrumb] = useState(false); // not used but kept

  // Update page states when location changes
  useEffect(() => {
    setIsNewProductPage(location.pathname === '/get-started/products/new');

    // Hide sidebar for edit and new pages
    if (location.pathname.includes('/edit') || location.pathname.endsWith('/new')) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [location.pathname]);

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
    if (path.startsWith('/get-started/data-ingestion')) return 'Data Ingestion';
    if (path.startsWith('/get-started/subscriptions')) return 'Purchases';
    if (path.startsWith('/get-started/dashboards')) return 'Dashboards';
    if (path.startsWith('/get-started/integrations')) return 'Integrations';
    if (path.startsWith('/get-started/settings')) return 'Settings';
    if (path.startsWith('/get-started/invoices')) return 'Invoices';
    if (path.startsWith('/get-started/sales-site-builder')) return 'Sales Site Builder';
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
    createCustomerLoader();
    productsLoader();
    newProductLoader();
    editProductLoader();
    meteringLoader();
    createUsageMetricLoader();
    editMetricsLoader();
    subscriptionsLoader();
    createSubscriptionLoader();
    ratePlansLoader();
    createPricePlanLoader();
    editPlanLoader();
    editCustomerLoader();
    dataIngestionLoader();
    integrationsLoader();
  }, []);

  // Small reusable spinner for route-level Suspense
  const RouteSpinner = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  // Helper to compute sidebar tab slug
  const getSlugForTab = (tab: string) => {
    return tab === 'Billable Metrics'
      ? 'metering'
      : tab === 'Purchases'
        ? 'subscriptions'
        : tab === 'Data Ingestion'
          ? 'data-ingestion'
          : tab === 'Integrations'
            ? 'integrations'
            : tab.toLowerCase().replace(/\s+/g, '-');
  };

  // Shared sidebar click handler
  const handleSidebarClick = (tab: string) => {
    if (tab === 'Settings') {
      navigate('/get-started/settings');
    } else if (tab === 'Get Started') {
      navigate('/get-started');
    } else if (tab === 'Invoices') {
      navigate('/get-started/invoices');
    } else if (tab === 'Sales Site Builder') {
      navigate('/get-started/sales-site-builder');
    } else {
      const slug = getSlugForTab(tab);
      navigate(`/get-started/${slug}`);
    }
  };

  return (
    <ToastProvider>
      <TremorProvider>
        <div className="min-h-screen no-scrollbar" style={{ backgroundColor: '#FBFDFF' }}>
          <CookieConsentBanner />
          <Suspense
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
              <Route
                path="/signin"
                element={user ? <Navigate to="/get-started" replace /> : <SignIn />}
              />
              <Route
                path="/forgot-password"
                element={<ForgotPassword />}
              />
              <Route
                path="/reset-link-sent"
                element={<ResetLinkSent />}
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

              {/* Default landing / catch-all for non-logged in */}
              <Route
                path="*"
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

              {/* Get Started base – only sidebar */}
              <Route
                path="/get-started"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <SideNavbar
                        activeTab={currentTab}
                        onTabClick={handleSidebarClick}
                        hidden={!showSidebar}
                      />
                      <main className="flex-1 px-6 py-6 bg-white" style={{ marginLeft: showSidebar ? '15rem' : '0' }}>
                        <SalesSite />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Invoices -> Coming soon */}
              <Route
                path="/get-started/invoices"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <SideNavbar
                        activeTab={currentTab}
                        onTabClick={handleSidebarClick}
                        hidden={!showSidebar}
                      />
                      <main className="flex-1 px-6 py-6 bg-white" style={{ marginLeft: showSidebar ? '15rem' : '0' }}>
                        <SalesSite />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Sales Site Builder -> Coming soon */}
              <Route
                path="/get-started/sales-site-builder"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <SideNavbar
                        activeTab={currentTab}
                        onTabClick={handleSidebarClick}
                        hidden={!showSidebar}
                      />
                      <main className="flex-1 px-6 py-6 bg-white" style={{ marginLeft: showSidebar ? '15rem' : '0' }}>
                        <SalesSite />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Dashboards list */}
              <Route
                path="/get-started/dashboards"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <SideNavbar
                        activeTab={currentTab}
                        onTabClick={handleSidebarClick}
                        hidden={!showSidebar}
                      />
                      <main className="flex-1 px-6 py-6 bg-white" style={{ marginLeft: showSidebar ? '15rem' : '0' }}>
                        <DashboardGallery />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Dashboards list */}
              <Route
                path="/get-started/dashboards"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <SideNavbar
                        activeTab={currentTab}
                        onTabClick={handleSidebarClick}
                        hidden={!showSidebar}
                      />
                      <main className="flex-1 px-6 py-6 bg-white" style={{ marginLeft: showSidebar ? '15rem' : '0' }}>
                        <DashboardGallery
                          onCardClick={(card) => {
                            if (card.id === 'product') {
                              navigate('/get-started/dashboards/product-analytics');
                            }
                          }}
                        />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Product Analytics dashboard detail */}
              <Route
                path="/get-started/dashboards/product-analytics"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <div
                        onMouseEnter={() => setSidebarHovered(true)}
                        onMouseLeave={() => setSidebarHovered(false)}
                      >
                        <SideNavbar
                          activeTab={currentTab}
                          onTabClick={handleSidebarClick}
                          hidden={!showSidebar}
                          collapsible={true}
                        />
                      </div>
                      <main
                        className="flex-1 flex flex-col"
                        style={{
                          backgroundColor: "#F9FBFD",
                          marginLeft: sidebarHovered ? '15rem' : '80px',
                          transition: 'margin-left 0.3s ease'
                        }}
                      >
                        <ProductHeader />
                        <div
                          className="flex-1 overflow-y-auto"
                          style={{ padding: '20px' }}
                        >
                          <ProductsKpiStrip />
                          <RevenueBarsTwinCards />
                          <RatePlansByProductTables />
                          <RepeatBuyersAndGrowth />
                          <UsageVolumeByProductType />
                           <RevenueBarsTwinCards />

                          <RatePlansByProductTables />

                          <RepeatBuyersAndGrowth />

                          <UsageVolumeByProductType />
                        </div>
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Customer Analysis dashboard detail */}
              <Route
                path="/get-started/dashboards/customer-analysis"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <div
                        onMouseEnter={() => setSidebarHovered(true)}
                        onMouseLeave={() => setSidebarHovered(false)}
                      >
                        <SideNavbar
                          activeTab={currentTab}
                          onTabClick={handleSidebarClick}
                          hidden={!showSidebar}
                          collapsible={true}
                        />
                      </div>
                      <main
                        className="flex-1 flex flex-col"
                        style={{
                          backgroundColor: "#F9FBFD",
                          marginLeft: sidebarHovered ? '15rem' : '80px',
                          transition: 'margin-left 0.3s ease'
                        }}
                      >
                        <CustomerOverviewHeader />
                        <div
                          className="flex-1 overflow-y-auto"
                          style={{ padding: '20px' }}
                        >
                          <CustomerOverviewStats />
                          <CustomerHealthOverview />
                          <TopAtRiskCustomers />
                          <TopHealthyCustomers />
                          <TopChurningCustomers />
                          <CustomerSegmentation />
                          <NewVsExistingAndIndustries />
                        </div>
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Real-Time Analysis dashboard detail */}
              <Route
                path="/get-started/dashboards/real-time-analysis"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <div
                        onMouseEnter={() => setSidebarHovered(true)}
                        onMouseLeave={() => setSidebarHovered(false)}
                      >
                        <SideNavbar
                          activeTab={currentTab}
                          onTabClick={handleSidebarClick}
                          hidden={!showSidebar}
                          collapsible={true}
                        />
                      </div>
                      <main
                        className="flex-1 flex flex-col"
                        style={{
                          backgroundColor: "#F9FBFD",
                          marginLeft: sidebarHovered ? '15rem' : '80px',
                          transition: 'margin-left 0.3s ease'
                        }}
                      >
                        <RealTimeHeader />
                        <div
                          className="flex-1 overflow-y-auto"
                          style={{ padding: '20px' }}
                        >
                          <RealTimeKpiCards />
                          <div
                          style={{ padding: '10px' }}
                        ></div>

                          <CustomersByUsageCard />
<div
                          style={{ padding: '10px' }}
                        ></div>
                          <RealTimePaymentsWidgets />
<div
                          style={{ padding: '10px' }}
                        ></div>
                          <BillableHeatmapAndRevenue/>

                         <div
                          style={{ padding: '10px' }}
                        ></div>

                          {/* Other real-time analysis components will go here */}
                        </div>
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Real-Time Tracking dashboard detail */}
              <Route
                path="/get-started/dashboards/real-time-tracking"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <div
                        onMouseEnter={() => setSidebarHovered(true)}
                        onMouseLeave={() => setSidebarHovered(false)}
                      >
                        <SideNavbar
                          activeTab={currentTab}
                          onTabClick={handleSidebarClick}
                          hidden={!showSidebar}
                          collapsible={true}
                        />
                      </div>
                      <main
                        className="flex-1 flex flex-col"
                        style={{
                          backgroundColor: "#F9FBFD",
                          marginLeft: sidebarHovered ? '15rem' : '80px',
                          transition: 'margin-left 0.3s ease'
                        }}
                      >
                        <RealTimeHeader />
                        <div
                          className="flex-1 overflow-y-auto"
                          style={{ padding: '20px' }}
                        >
                          <RealTimeKpiCards />
                          <div
                          style={{ padding: '20px' }}
                        ></div>

                          <CustomersByUsageCard />
<div
                          style={{ padding: '20px' }}
                        ></div>
                          <RealTimePaymentsWidgets />
<div
                          style={{ padding: '20px' }}
                        ></div>
                          <BillableHeatmapAndRevenue/>

                         <div
                          style={{ padding: '20px' }}
                        ></div>


                          {/* Other real-time analysis components will go here */}
                        </div>
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Revenue Analysis dashboard detail */}
              <Route
                path="/get-started/dashboards/revenue-analysis"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <div
                        onMouseEnter={() => setSidebarHovered(true)}
                        onMouseLeave={() => setSidebarHovered(false)}
                      >
                        <SideNavbar
                          activeTab={currentTab}
                          onTabClick={handleSidebarClick}
                          hidden={!showSidebar}
                          collapsible={true}
                        />
                      </div>
                      <main
                        className="flex-1 flex flex-col"
                        style={{
                          backgroundColor: "#FBFDFF",
                          marginLeft: sidebarHovered ? '15rem' : '80px',
                          transition: 'margin-left 0.3s ease'
                        }}
                      >
                        <div className="sticky top-0">
                          <RevenueAnalysisHeader />
                        </div>
                        <div
                          className="flex-1 overflow-y-auto"
                          style={{ padding: '20px' }}
                        >
                          <RevenueSummaryCards />
                          <RevenueAnalytics />
                          <RevenuAnalyticsDash1 />
                          <RevenueAnalyticsDash2 />
                          <RevenueAnalyticsDash3 />
                          <GrowthOpportunities />
                          <RevenueAnalyticsDash4 />
                          <RevenueAnalyticsDash5 />
                        </div>
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Product Analysis dashboard detail */}
              <Route
                path="/get-started/dashboards/product-analysis"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <div
                        onMouseEnter={() => setSidebarHovered(true)}
                        onMouseLeave={() => setSidebarHovered(false)}
                      >
                        <SideNavbar
                          activeTab={currentTab}
                          onTabClick={handleSidebarClick}
                          hidden={!showSidebar}
                          collapsible={true}
                        />
                      </div>
                      <main
                        className="flex-1 flex flex-col"
                        style={{
                          backgroundColor: "#FBFDFF",
                          marginLeft: sidebarHovered ? '15rem' : '80px',
                          transition: 'margin-left 0.3s ease'
                        }}
                      >
                        <div className="sticky top-0">
                          <ProductHeader />
                        </div>
                        <div
                          className="flex-1 overflow-y-auto"
                          style={{ padding: '20px' }}
                        >
                          <ProductsKpiStrip />
                          <div
                          style={{ padding: '20px' }}
                        ></div>
                          <RevenueBarsTwinCards />
                          <div
                          style={{ padding: '20px' }}
                        ></div>
                        
                          <RatePlansByProductTables />
                          <div
                          style={{ padding: '20px' }}
                        ></div>
                        <ProductsUsageTrends />
                         <div
                          style={{ padding: '20px' }}
                        ></div>
                          <RepeatBuyersAndGrowth />
                          <div
                          style={{ padding: '20px' }}
                        ></div>
                          <UsageVolumeByProductType />
                          <div
                          style={{ padding: '20px' }}
                        ></div>
                        
                        </div>
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Rate Plans list */}
              <Route
                path="/get-started/rate-plans"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <SideNavbar
                        activeTab={currentTab}
                        onTabClick={handleSidebarClick}
                        hidden={!showSidebar}
                      />
                      <main
                        className="flex-1 "
                        style={{ marginLeft: showSidebar ? '15rem' : '0',backgroundColor: "#FBFDFF",
 }}
                      >
                        <RatePlans
                          ratePlans={ratePlans}
                          setRatePlans={setRatePlans}
                          showCreatePlan={showCreatePlan}
                          setShowCreatePlan={setShowCreatePlan}
                        />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Kong Integration */}
              <Route
                path="/kong-integration"
                element={
                  <ProtectedRoute>
                    <KongIntegration onBack={() => navigate(-1)} />
                  </ProtectedRoute>
                }
              />

              {/* Apigee routes */}
              <Route
                path="/apigee-integration"
                element={
                  <ProtectedRoute>
                    <ApigeeIntegration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apigee-success"
                element={
                  <ProtectedRoute>
                    <ApigeeSuccessWrapper />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apigee-failure"
                element={
                  <ProtectedRoute>
                    <ApigeeFailure 
                      onBack={() => navigate('/get-started/integrations')}
                      onTryAgain={() => navigate('/apigee-integration')}
                    />
                  </ProtectedRoute>
                }
              />
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
                    <div className="flex min-h-screen">
                      <SideNavbar
                        activeTab={currentTab}
                        onTabClick={handleSidebarClick}
                        hidden={!showSidebar}
                      />
                      <main className="flex-1 px-6 py-6 bg-white" style={{ marginLeft: showSidebar ? '15rem' : '0' }}>
                        <Settings />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Rate Plan Edit */}
              <Route
                path="/get-started/rate-plans/:id/edit"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <SideNavbar
                        activeTab={currentTab}
                        onTabClick={handleSidebarClick}
                        hidden={!showSidebar}
                      />
                      <main className="flex-1 px-6 py-6 bg-white" style={{ marginLeft: showSidebar ? '15rem' : '0' }}>
                        <EditPlan />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Create Price Plan */}
              <Route
                path="/get-started/rate-plans/new"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen px-6 py-6 bg-white">
                      <div className="w-full">
                        <Suspense fallback={RouteSpinner}>
                          <CreatePricePlan onClose={() => navigate('/get-started/rate-plans')} />
                        </Suspense>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Products list */}
              <Route
                path="/get-started/products"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <SideNavbar
                        activeTab={currentTab}
                        onTabClick={handleSidebarClick}
                        hidden={!showSidebar}
                      />
                      <main
                        className="flex-1 py-6"
                        style={{ marginLeft: showSidebar ? '15rem' : '0',backgroundColor: "#FBFDFF", }}
                      >
                        <Products
                          showNewProductForm={showNewProductForm}
                          setShowNewProductForm={setShowNewProductForm}
                        />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* New Product – no sidebar */}
              <Route
                path="/get-started/products/new"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen px-6 py-6 bg-white">
                      <div className="w-full">
                        <Suspense fallback={RouteSpinner}>
                          <NewProduct onClose={() => navigate('/get-started/products')} />
                        </Suspense>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Edit Product – full width without wrapper */}
              <Route
                path="/get-started/products/edit/:id"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={RouteSpinner}>
                      <EditProduct onClose={() => navigate('/get-started/products')} />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Metering */}
              <Route
                path="/get-started/metering"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <SideNavbar
                        activeTab={currentTab}
                        onTabClick={handleSidebarClick}
                        hidden={!showSidebar}
                      />
                      <main className="flex-1 px-6 py-6" style={{ marginLeft: showSidebar ? '15rem' : '0',backgroundColor: "#FBFDFF", }}>
                        <Metering
                          showNewUsageMetricForm={showNewUsageMetricForm}
                          setShowNewUsageMetricForm={setShowNewUsageMetricForm}
                          setHideSidebarOnEditMetric={setHideSidebarOnEditMetric}
                        />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* New Metric – no sidebar */}
              <Route
                path="/get-started/metering/new"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen px-6 py-6 bg-white">
                      <div className="w-full">
                        <CreateUsageMetric onClose={() => navigate('/get-started/metering')} />
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Edit Metric – no sidebar */}
              <Route
                path="/get-started/metering/:id/edit"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={RouteSpinner}>
                      <EditMetricsWrapper />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Subscriptions list */}
              <Route
                path="/get-started/subscriptions"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <SideNavbar
                        activeTab={currentTab}
                        onTabClick={handleSidebarClick}
                        hidden={!showSidebar}
                      />
                      <main className="flex-1 px-6 py-6 bg-white" style={{ marginLeft: showSidebar ? '15rem' : '0' ,backgroundColor: "#FBFDFF", }}>
                        <Subscriptions
                          showNewSubscriptionForm={showNewSubscriptionForm}
                          setShowNewSubscriptionForm={setShowNewSubscriptionForm}
                        />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* New Subscription – no sidebar */}
              <Route
                path="/get-started/subscriptions/new"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen px-6 bg-white">
                      <div className="w-full">
                        <CreateSubscription
                          onClose={() => navigate('/get-started/subscriptions')}
                          onCreateSuccess={() => navigate('/get-started/subscriptions')}
                          onRefresh={() => { }}
                        />
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Edit Subscription – no sidebar */}
              <Route
                path="/get-started/subscriptions/:id/edit"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen bg-white">
                      <div className="w-full">
                        <Suspense fallback={RouteSpinner}>
                          <EditSubscriptionWrapper />
                        </Suspense>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Customers list */}
              <Route
                path="/get-started/customers"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <SideNavbar
                        activeTab={currentTab}
                        onTabClick={handleSidebarClick}
                        hidden={!showSidebar}
                      />
                      <main className="flex-1 px-6 py-6 " style={{ marginLeft: showSidebar ? '15rem' : '0' ,backgroundColor: "#FBFDFF", }}>
                        <Customers
                          showNewCustomerForm={showNewCustomerForm}
                          setShowNewCustomerForm={setShowNewCustomerForm}
                        />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              {/* Customer Edit – no sidebar (as before) */}
              <Route
                path="/get-started/customers/:id/edit"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen px-6 py-6 bg-white">
                      <div className="w-full">
                        <Suspense fallback={RouteSpinner}>
                          <EditCustomer />
                        </Suspense>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Create Customer */}
              <Route
                path="/get-started/customers/new"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen px-6 py-6 bg-white">
                      <div className="w-full">
                        <Suspense fallback={RouteSpinner}>
                          <CreateCustomer onClose={() => navigate('/get-started/customers')} />
                        </Suspense>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Data Ingestion */}
              <Route
                path="/get-started/data-ingestion"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <SideNavbar
                        activeTab={currentTab}
                        onTabClick={handleSidebarClick}
                        hidden={!showSidebar}
                      />
                      <main className="flex-1 px-6 py-6 " style={{ marginLeft: showSidebar ? '15rem' : '0',backgroundColor: "#FBFDFF", }}>
                        <Suspense fallback={RouteSpinner}>
                          <DataIngestionPage />
                        </Suspense>
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Integrations */}
              <Route
                path="/get-started/integrations"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <SideNavbar
                        activeTab={currentTab}
                        onTabClick={handleSidebarClick}
                        hidden={!showSidebar}
                      />
                      <main className="flex-1 px-6 py-6" style={{ marginLeft: showSidebar ? '15rem' : '0' ,backgroundColor: "#FBFDFF", }}>
                        <Suspense fallback={RouteSpinner}>
                          <Integrations />
                        </Suspense>
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Import Products (new shared screen) */}
              <Route
                path="/get-started/products/import"
                element={
                  <ProtectedRoute>
                    <ImportProducts
                      onBack={() => navigate('/get-started/products')}
                    />
                  </ProtectedRoute>
                }
              />

              {/* Apigee Integration Routes */}
              <Route
                path="/get-started/integrations/apigee"
                element={
                  <ProtectedRoute>
                    <ApigeeIntegration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apigee-success"
                element={
                  <ProtectedRoute>
                    <ApigeeSuccessWrapper />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apigee-failure"
                element={
                  <ProtectedRoute>
                    <ApigeeFailure 
                      onBack={() => navigate('/get-started/integrations')}
                      onTryAgain={() => navigate('/apigee-integration')}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/get-started/integrations/apigee/import"
                element={
                  <ProtectedRoute>
                    <ApigeeImport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/get-started/integrations/apigee/imported-products"
                element={
                  <ProtectedRoute>
                    <ApigeeImportedProducts />
                  </ProtectedRoute>
                }
              />

              {/* QuickBooks Integration Routes */}
              <Route
                path="/quickbooks-integration"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={RouteSpinner}>
                      <QBIntegration 
                        onBack={() => navigate('/get-started/integrations')}
                        onConnect={() => navigate('/quickbooks-success')}
                      />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quickbooks-success"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={RouteSpinner}>
                      <SuccessQB 
                        onBack={() => navigate('/quickbooks-integration')}
                        onViewCustomerSyncStatus={() => navigate('/quickbooks-sync-status')}
                      />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quickbooks-sync-status"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={RouteSpinner}>
                      <QuickbooksIntegration 
                        onBack={() => navigate('/quickbooks-success')}
                      />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </TremorProvider>
    </ToastProvider>
  );
}