import React from 'react';

const TotalPayingUsersCard: React.FC = () => {
  const totalPayingUsers = 8234;
  const changeDelta = 125;
  const isDeltaPositive = true;

  return (
    <div className='rounded-lg border border-gray-200 bg-white py-5 px-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900'>
        <svg
          className='h-6 w-6 text-purple-600 dark:text-purple-300'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 00-20 0v2h2z' />
        </svg>
      </div>

      <div className='mt-4 flex items-end justify-between'>
        <div>
          <h4 className='text-lg font-bold text-gray-900 dark:text-white'>{totalPayingUsers.toLocaleString()}</h4>
          <span className='text-xs text-gray-600 dark:text-gray-400'>Total Paying Users</span>
        </div>

        <span className={`flex items-center gap-1 text-xs font-medium ${isDeltaPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isDeltaPositive ? '↑' : '↓'} {changeDelta}
        </span>
      </div>
    </div>
  );
};

export default TotalPayingUsersCard;
