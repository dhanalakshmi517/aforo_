import { ApexOptions } from 'apexcharts';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { getProducts } from '../../../../src/client/components/Dashboard/productsApi';

const baseOptions: ApexOptions = {
  chart: {
    type: 'line',
    height: 320,
    toolbar: { show: false },
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  markers: {
    size: 4,
  },
  xaxis: {
    categories: [],
  },
  yaxis: {
    title: { text: 'Average Rating' },
    min: 0,
    max: 5,
  },
  grid: {
    yaxis: { lines: { show: false } },
  },
  dataLabels: { enabled: false },
  colors: ['#10B981'],
};

const AverageRatingLineChart: React.FC = () => {
  const [series, setSeries] = useState([{ name: 'Avg Rating', data: [] as number[] }]);
  const [options, setOptions] = useState<ApexOptions>(baseOptions);

  useEffect(() => {
    const fetchData = async () => {
      const products = await getProducts();

      const sums: Record<string, { total: number; count: number }> = {};
      products.forEach((p) => {
        if (!sums[p.category]) sums[p.category] = { total: 0, count: 0 };
        sums[p.category].total += p.rating;
        sums[p.category].count += 1;
      });

      const categories = Object.keys(sums);
      const avgRatings = categories.map((c) => sums[c].total / sums[c].count);

      const prettyCategories = categories.map((cat) =>
        cat
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
      );

      setSeries([{ name: 'Avg Rating', data: avgRatings }]);
      setOptions((prev: any) => ({
        ...prev,
        xaxis: {
          ...prev.xaxis,
          categories: prettyCategories,
        },
      }));
    };

    fetchData();
  }, []);

  return (
    <div className="col-span-12 xl:col-span-6 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">Average Rating (Line)</h4>
      <ReactApexChart type="line" options={options} series={series} height={320} />
    </div>
  );
};

export default AverageRatingLineChart;
