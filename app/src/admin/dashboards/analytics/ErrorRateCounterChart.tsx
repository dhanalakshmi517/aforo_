import { ApexOptions } from 'apexcharts';
import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const options: ApexOptions = {
  chart: {
    type: 'area',
    height: 300,
    background: 'transparent',
    toolbar: {
      show: false,
    },
    sparkline: {
      enabled: false,
    },
  },
  colors: ['#a78bfa'],
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.6,
      opacityTo: 0.1,
      stops: [0, 90, 100],
      colorStops: [
        {
          offset: 0,
          color: '#a78bfa',
          opacity: 0.8,
        },
        {
          offset: 100,
          color: '#6366f1',
          opacity: 0.1,
        },
      ],
    },
  },
  dataLabels: {
    enabled: false,
  },
  grid: {
    show: true,
    borderColor: '#2d3748',
    strokeDashArray: 3,
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  xaxis: {
    type: 'category',
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      style: {
        colors: '#9ca3af',
        fontSize: '12px',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#9ca3af',
        fontSize: '12px',
      },
    },
  },
  tooltip: {
    theme: 'dark',
    style: {
      fontSize: '12px',
    },
    y: {
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
  },
  markers: {
    size: 6,
    colors: '#a78bfa',
    strokeColors: '#1e1b4b',
    strokeWidth: 2,
    hover: {
      size: 8,
    },
  },
};

const ErrorRateCounterChart: React.FC = () => {
  const [series] = useState([
    {
      name: 'Error Rate',
      data: [15, 22, 28, 35, 42, 38, 32, 28, 25],
    },
  ]);

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <h4 className='text-sm font-semibold text-gray-900'>Error Rate Counter</h4>
        <span className='text-xs text-gray-600'>Last 9 months</span>
      </div>
      <div className='rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 p-4'>
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

export default ErrorRateCounterChart;
