import React, { useEffect, useState } from 'react';
import { Card, Title, BarChart, Text } from '@tremor/react';
import { getProducts } from '../../../../src/client/components/Dashboard/productsApi';

type ChartData = {
  category: string;
  'Average Price': number;
};

const AveragePriceByCategoryChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await getProducts();

        // Calculate average price by category
        const sums: Record<string, { total: number; count: number }> = {};
        products.forEach((p: { category: string; price: number }) => {
          if (!sums[p.category]) sums[p.category] = { total: 0, count: 0 };
          sums[p.category].total += p.price;
          sums[p.category].count += 1;
        });

        // Format data for Tremor
        const formattedData: ChartData[] = Object.entries(sums).map(([category, data]) => ({
          category: category
            .split('-')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
          'Average Price': parseFloat((data.total / data.count).toFixed(2))
        }));

        // Sort by average price in descending order
        formattedData.sort((a, b) => b['Average Price'] - a['Average Price']);
        
        setChartData(formattedData);
      } catch (err) {
        console.error('Error loading product data:', err);
        setError('Failed to load price data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <Text>Loading price data...</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <Text className="text-red-500">{error}</Text>
      </Card>
    );
  }

  return (
    <Card className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <Title className="mb-4 text-lg font-semibold text-black dark:text-white">
        Average Price by Category
      </Title>
      
      <BarChart
        className="h-72 mt-4"
        data={chartData}
        index="category"
        categories={['Average Price']}
        colors={['cyan']}
        layout="horizontal"
        valueFormatter={(number) => `$${number.toFixed(2)}`}
      />
    </Card>
  );
};

export default AveragePriceByCategoryChart;
