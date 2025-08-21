import { useAuth } from 'wasp/client/auth';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { type User } from 'wasp/entities';

export default function AccountPage({ user }: { user: User }) {
  return (
    <div className='mx-auto max-w-7xl py-6 sm:px-6 lg:px-8'>
      <div className='px-4 py-6 sm:px-0'>
        <div className='overflow-hidden bg-white dark:bg-boxdark shadow sm:rounded-lg'>
          <div className='px-4 py-5 sm:px-6'>
            <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-white'>Account Information</h3>
            <p className='mt-1 max-w-2xl text-sm text-gray-500 dark:text-white'>Personal details and account settings.</p>
          </div>
          <div className='border-t border-gray-200 dark:border-strokedark'>
            <dl>
              <div className='bg-gray-50 dark:bg-boxdark px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                <dt className='text-sm font-medium text-gray-500 dark:text-white'>Email</dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0'>{user.email}</dd>
              </div>
              <div className='bg-white dark:bg-boxdark px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                <dt className='text-sm font-medium text-gray-500 dark:text-white'>Role</dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0'>
                  {user.isAdmin ? 'Admin' : 'User'}
                </dd>
              </div>
              <div className='bg-gray-50 dark:bg-boxdark px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                <dt className='text-sm font-medium text-gray-500 dark:text-white'>Last Active</dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0'>
                  {new Date(user.lastActiveTimestamp).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
