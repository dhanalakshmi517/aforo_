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
  dataLabels: { enabled: false },
  xaxis: {
    categories: [],
    labels: { style: { fontSize: '11px' } },
  },
  yaxis: {
    title: { text: 'Total Stock' },
    min: 0,
  },
  grid: {
    show: false,
  },
  tooltip: {
    y: {
      formatter: (val: number) => `${val} units`,
    },
  },
  colors: ['#330066'],
};

const TotalStockByCategoryChart: React.FC = () => {
  const [series, setSeries] = useState([{ name: 'Stock', data: [] as number[] }]);
  const [options, setOptions] = useState<ApexOptions>(baseOptions);

  useEffect(() => {
    const fetchData = async () => {
      const products = await getProducts();

      const stockByCategory: Record<string, number> = {};
      products.forEach((p: { category: string; stock: number }) => {
        stockByCategory[p.category] = (stockByCategory[p.category] || 0) + p.stock;
      });

      const categories = Object.keys(stockByCategory);
      const stocks = categories.map((c) => stockByCategory[c]);

      const prettyCategories = categories.map((cat) =>
        cat
          .split('-')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
      );

      setSeries([{ name: 'Stock', data: stocks }]);
      setOptions((prev: ApexOptions) => ({
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
    <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">Total Stock by Category</h4>
      <ReactApexChart type="bar" options={options} series={series} height={320} />
    </div>
  );
};

export default TotalStockByCategoryChart;
