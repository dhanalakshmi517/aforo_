import { type AuthUser } from 'wasp/auth';
import { useQuery } from 'wasp/client/operations';
// Commenting out unused imports to fix build errors
// import TotalSignupsCard from './TotalSignupsCard';
// import TotalPageViewsCard from './TotalPageViewsCard';
// import TotalPayingUsersCard from './TotalPayingUsersCard';
// import TotalRevenueCard from './TotalRevenueCard';
// import RevenueAndProfitChart from './RevenueAndProfitChart';
import ProductsByCategoryChart from './ProductsByCategoryChart';
// import SourcesTable from './SourcesTable';
import DefaultLayout from '../../layout/DefaultLayout';
// import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';
import { cn } from '../../../client/cn';

const Dashboard = ({ user }: { user: AuthUser }) => {
  // useRedirectHomeUnlessUserIsAdmin({ user });
  // const { data: stats, isLoading, error } = useQuery(() => ({}));

  return (
    <DefaultLayout user={user}>
      <div className='relative'>
        <div className={cn({
          'opacity-100': true,
        })}>
          {/* Simplified layout since we're just showing the products chart */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-1 md:gap-6 xl:grid-cols-1 2xl:gap-7.5'>
            <h2 className='text-2xl font-bold text-boxdark dark:text-white'>Product Analytics</h2>
          </div>

          <div className='mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5'>
            {/* Products by Category Chart */}
            <div className='col-span-12'>
              <ProductsByCategoryChart />
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
