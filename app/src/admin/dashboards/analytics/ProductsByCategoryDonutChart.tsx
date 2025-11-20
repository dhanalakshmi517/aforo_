// ProductsByCategoryDonutChart.tsx
import { ApexOptions } from 'apexcharts';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { getProducts } from '../../../../src/client/components/Dashboard/productsApi';

const baseOptions: ApexOptions = {
  chart: { type: 'donut', background: 'transparent' },
  dataLabels: { enabled: false },
  legend: { show: true, position: 'bottom' },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          name: { show: true },
          value: { show: false },
        },
      },
    },
  },
  stroke: { show: true, width: 2, colors: ['#ffffff'] },
  tooltip: {
    y: {
      formatter: (val: number) => `${val} products`,
    },
  },
  colors: ['#389315', '#ED5142', '#E2B226', '#6685CC', '#66CCA5', '#00365A'],
};

const ProductsByCategoryDonutChart: React.FC = () => {
  const [series, setSeries] = useState<number[]>([]);
  const [options, setOptions] = useState<ApexOptions>(baseOptions);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await getProducts();

        const categoryCounts = products.reduce(
          (acc: { [key: string]: number }, product) => {
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
          },
          {} as { [key: string]: number },
        );

        const rawLabels = Object.keys(categoryCounts);
        const data = Object.values(categoryCounts);

        const prettyLabels = rawLabels.map((cat) =>
          cat
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
        );

        setSeries(data);
        setOptions((prev: ApexOptions) => ({
          ...prev,
          labels: prettyLabels,
        }));
      } catch (e: unknown) {
        console.error('Error loading product data for donut chart:', e);
      }
    };

    fetchData();
  }, []);

  if (!series.length) return null;

  const total = series.reduce((sum: number, v: number) => sum + v, 0);

  return (
    <div>
      {/* header lives inside the same card as the chart (card is from parent) */}
      <div className="mb-2 flex flex-col">
        <h4 className="text-sm font-semibold text-gray-900">Category Share</h4>
        <span className="text-xs text-gray-600">{total} products</span>
      </div>

      <div className="flex justify-center">
        <ReactApexChart
          type="donut"
          options={options}
          series={series}
          height={240}
        />
      </div>
    </div>
  );
};

export default ProductsByCategoryDonutChart;
