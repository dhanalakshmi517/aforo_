import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface ApexBarChartProps {
  title: string;
  description: string;
  data: any[];
  index: string;
  categories: string[];
  colors: string[];
  valueFormatter?: (value: number) => string;
}

const ApexBarChart: React.FC<ApexBarChartProps> = ({
  title,
  description,
  data,
  index,
  categories,
  colors,
  valueFormatter = (value) => `${value}`
}) => {
  // Transform data for ApexCharts format
  const transformedData = categories.map(category => {
    return {
      name: category,
      data: data.map(item => item[category])
    };
  });
  
  const labels = data.map(item => item[index]);
  
  // Create chart options
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      stacked: false,
      toolbar: {
        show: true
      },
      zoom: {
        enabled: false
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom',
          offsetX: -10,
          offsetY: 0
        }
      }
    }],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '55%',
      },
    },
    xaxis: {
      type: 'category',
      categories: labels,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return valueFormatter(val);
        }
      },
    },
    legend: {
      position: 'right',
      offsetY: 40
    },
    fill: {
      opacity: 1
    },
    title: {
      text: title,
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
      }
    },
    subtitle: {
      text: description,
      align: 'left',
      style: {
        fontSize: '12px',
        fontWeight: 'normal',
      }
    },
    colors: colors
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div id="chart">
        <ReactApexChart 
          options={options}
          series={transformedData}
          type="bar"
          height={400}
        />
      </div>
    </div>
  );
};

export default ApexBarChart;
