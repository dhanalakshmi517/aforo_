import React from 'react';

const TotalRevenueCard: React.FC = () => {
  const totalRevenue = 45230;
  const changePercent = 8;
  const isDeltaPositive = true;

  return (
    <div className='rounded-lg border border-gray-200 bg-white py-5 px-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900'>
        <svg
          className='h-6 w-6 text-green-600 dark:text-green-300'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
      </div>

      <div className='mt-4 flex items-end justify-between'>
        <div>
          <h4 className='text-lg font-bold text-gray-900 dark:text-white'>${totalRevenue.toLocaleString()}</h4>
          <span className='text-xs text-gray-600 dark:text-gray-400'>Total Revenue</span>
        </div>

        <span className={`flex items-center gap-1 text-xs font-medium ${isDeltaPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isDeltaPositive ? '↑' : '↓'} {changePercent}%
        </span>
      </div>
    </div>
  );
};

export default TotalRevenueCard;
