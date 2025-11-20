import { ApexOptions } from 'apexcharts';
import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const options: ApexOptions = {
  chart: {
    type: 'radialBar',
    height: 300,
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      hollow: {
        margin: 15,
        size: '70%',
        background: 'transparent',
        image: undefined,
      },
      dataLabels: {
        name: {
          show: true,
          fontSize: '16px',
          fontWeight: 600,
          offsetY: -10,
        },
        value: {
          show: true,
          fontSize: '24px',
          fontWeight: 700,
          offsetY: 16,
          formatter: (val: number) => `${val}%`,
        },
      },
      track: {
        background: '#e5e7eb',
        strokeWidth: '97%',
        margin: 5,
      },
    },
  },
  colors: ['#33ff33'],
  stroke: {
    lineCap: 'round',
  },
  labels: ['Performance'],
};

const GaugeChart: React.FC = () => {
  const [series] = useState([75]);

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <h4 className='text-sm font-semibold text-gray-900'>Performance Gauge</h4>
        <span className='text-xs text-gray-600'>Current Status</span>
      </div>
      <div className='flex justify-center'>
        <ReactApexChart
          options={options}
          series={series}
          type='radialBar'
          height={300}
        />
      </div>
      <div className='mt-6 space-y-3'>
        <div className='flex justify-between items-center py-2 border-b border-gray-100'>
          <span className='text-sm text-gray-600'>Target Achieved</span>
          <span className='text-sm font-semibold text-gray-900'>75%</span>
        </div>
        <div className='flex justify-between items-center py-2 border-b border-gray-100'>
          <span className='text-sm text-gray-600'>Monthly Goal</span>
          <span className='text-sm font-semibold text-gray-900'>85%</span>
        </div>
        <div className='flex justify-between items-center py-2'>
          <span className='text-sm text-gray-600'>Previous Month</span>
          <span className='text-sm font-semibold text-green-600'>68%</span>
        </div>
      </div>
    </div>
  );
};

export default GaugeChart;
