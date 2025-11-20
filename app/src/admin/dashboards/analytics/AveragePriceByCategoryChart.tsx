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
  plotOptions: {
    bar: {
      horizontal: true,
      columnWidth: '45%',
      borderRadius: 4,
    },
  },
  grid: {
    xaxis: {
      lines: { show: false },
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    type: 'category',
    categories: [],
    labels: { style: { fontSize: '11px' } },
  },
  yaxis: {
    title: { text: 'Category' },
  },
  tooltip: {
    y: {
      formatter: (val: number) => `$${val.toFixed(2)}`,
    },
  },
  colors: ['#7df9ff'],
};

const AveragePriceByCategoryChart: React.FC = () => {
  const [series, setSeries] = useState([{ name: 'Avg Price', data: [] as number[] }]);
  const [options, setOptions] = useState<ApexOptions>(baseOptions);

  useEffect(() => {
    const fetchData = async () => {
      const products = await getProducts();

      const sums: Record<string, { total: number; count: number }> = {};
      products.forEach((p) => {
        if (!sums[p.category]) sums[p.category] = { total: 0, count: 0 };
        sums[p.category].total += p.price;
        sums[p.category].count += 1;
      });

      const categories = Object.keys(sums);
      const avgPrices = categories.map((c) => sums[c].total / sums[c].count);

      const prettyCategories = categories.map((cat) =>
        cat
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
      );

      setSeries([{ name: 'Avg Price', data: avgPrices }]);
      setOptions((prev) => ({
        ...prev,
        xaxis: {
          type: 'numeric',
        },
        yaxis: {
          categories: prettyCategories,
        } as any,
      }));
    };

    fetchData();
  }, []);

  return (
    <div className="col-span-12 xl:col-span-6 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">Average Price by Category</h4>
      <ReactApexChart type="bar" options={options} series={series} height={320} />
    </div>
  );
};

export default AveragePriceByCategoryChart;
