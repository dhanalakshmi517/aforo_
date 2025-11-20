import { ApexOptions } from 'apexcharts';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { getProducts } from '../../../../src/client/components/Dashboard/productsApi';

const baseOptions: ApexOptions = {
  chart: {
    type: 'scatter',
    height: 320,
    toolbar: { show: false },
    zoom: { enabled: true },
  },
  xaxis: {
    title: { text: 'Price ($)' },
  },
  yaxis: {
    title: { text: 'Rating' },
    min: 0,
    max: 5,
  },
  grid: {
    yaxis: { lines: { show: false } },
  },
  dataLabels: { enabled: false },
  colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'],
  markers: {
    size: 6,
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'],
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: {
      size: 6,
    },
  },
};

const PriceVsRatingScatterChart: React.FC = () => {
  const [series, setSeries] = useState<{ name: string; data: [number, number][] }[]>([]);
  const [options] = useState<ApexOptions>(baseOptions);

  useEffect(() => {
    const fetchData = async () => {
      const products = await getProducts();
      const points: [number, number][] = products.map((p) => [p.price, p.rating]);
      setSeries([{ name: 'Products', data: points }]);
    };

    fetchData();
  }, []);

  return (
    <div className="col-span-12 xl:col-span-6 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">Price vs Rating (Scatter)</h4>
      <ReactApexChart type="scatter" options={options} series={series} height={320} />
    </div>
  );
};

export default PriceVsRatingScatterChart;
