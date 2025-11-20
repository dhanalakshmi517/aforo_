import React from 'react';

const TotalPageViewsCard: React.FC = () => {
  const totalPageViews = 12543;
  const changePercent = 12;
  const isDeltaPositive = true;

  return (
    <div className='rounded-lg border border-gray-200 bg-white py-5 px-6 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
        <svg
          className='h-6 w-6 text-blue-600 dark:text-blue-300'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
        </svg>
      </div>

      <div className='mt-4 flex items-end justify-between'>
        <div>
          <h4 className='text-lg font-bold text-gray-900 dark:text-white'>{totalPageViews.toLocaleString()}</h4>
          <span className='text-xs text-gray-600 dark:text-gray-400'>Total page views</span>
        </div>

        <span className={`flex items-center gap-1 text-xs font-medium ${isDeltaPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isDeltaPositive ? '↑' : '↓'} {changePercent}%
        </span>
      </div>
    </div>
  );
};

export default TotalPageViewsCard;
