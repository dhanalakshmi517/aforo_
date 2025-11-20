import React from 'react';

const TotalSignupsCard: React.FC = () => {
  const totalSignups = 3456;
  const changeDelta = 89;
  const isDeltaPositive = true;

  return (
    <div className='rounded-lg border border-gray-200 bg-white py-5 px-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900'>
        <svg
          className='h-6 w-6 text-orange-600 dark:text-orange-300'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' />
        </svg>
      </div>

      <div className='mt-4 flex items-end justify-between'>
        <div>
          <h4 className='text-lg font-bold text-gray-900 dark:text-white'>{totalSignups.toLocaleString()}</h4>
          <span className='text-xs text-gray-600 dark:text-gray-400'>Total Signups</span>
        </div>

        <span className={`flex items-center gap-1 text-xs font-medium ${isDeltaPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isDeltaPositive ? '↑' : '↓'} {changeDelta}
        </span>
      </div>
    </div>
  );
};

export default TotalSignupsCard;
