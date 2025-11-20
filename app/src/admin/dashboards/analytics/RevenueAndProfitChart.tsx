import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

const options: ApexOptions = {
  legend: {
    show: true,
    position: 'bottom',
  },
  colors: ['#3C50E0', '#80CAEE'],
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    height: 300,
    type: 'area',
    toolbar: {
      show: false,
    },
  },
  stroke: {
    width: [2, 2],
    curve: 'straight',
  },
  grid: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 4,
    colors: '#fff',
    strokeColors: ['#3056D3', '#80CAEE'],
    strokeWidth: 2,
  },
  xaxis: {
    type: 'category',
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    title: {
      style: {
        fontSize: '0px',
      },
    },
  },
};

const RevenueAndProfitChart: React.FC = () => {
  const [series, setSeries] = useState([
    {
      name: 'Revenue',
      data: [30, 40, 35, 50, 49, 60, 70],
    },
    {
      name: 'Profit',
      data: [20, 30, 25, 35, 30, 40, 50],
    },
  ]);

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <h4 className='text-sm font-semibold text-gray-900'>Revenue & Profit</h4>
        <span className='text-xs text-gray-600'>Last 7 Days</span>
      </div>
      <div className='flex justify-center'>
        <ReactApexChart
          options={options}
          series={series}
          type='area'
          height={300}
        />
      </div>
    </div>
  );
};

export default RevenueAndProfitChart;
