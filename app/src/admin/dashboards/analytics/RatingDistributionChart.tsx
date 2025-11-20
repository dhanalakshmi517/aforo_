import { ApexOptions } from 'apexcharts';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { getProducts } from '../../../../src/client/components/Dashboard/productsApi';

const baseOptions: ApexOptions = {
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
  },
  grid: {
    yaxis: {
      lines: { show: false },
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['1', '2', '3', '4', '5'],
    title: { text: 'Rating' },
  },
  yaxis: {
    title: { text: 'Number of Products' },
    min: 0,
  },
  tooltip: {
    y: {
      formatter: (val: number) => `${val} products`,
    },
  },
  colors: [' #79ff4d'],
};

const RatingDistributionChart: React.FC = () => {
  const [series, setSeries] = useState([{ name: 'Products', data: [] as number[] }]);
  const [options] = useState<ApexOptions>(baseOptions);

  useEffect(() => {
    const fetchData = async () => {
      const products = await getProducts();

      const buckets: number[] = [0, 0, 0, 0, 0];
      products.forEach((p: { rating: number }) => {
        const r = Math.round(p.rating);
        if (r >= 1 && r <= 5) {
          buckets[r - 1] += 1;
        }
      });

      setSeries([{ name: 'Products', data: buckets }]);
    };

    fetchData();
  }, []);

  return (
    <div className="col-span-12 xl:col-span-6 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">Rating Distribution</h4>
      <ReactApexChart type="bar" options={options} series={series} height={320} />
    </div>
  );
};

export default RatingDistributionChart;
