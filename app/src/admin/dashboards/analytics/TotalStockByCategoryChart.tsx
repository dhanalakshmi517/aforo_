import React, { useEffect, useState } from 'react';
import { Card, Title, BarChart, Text } from '@tremor/react';
import { getProducts } from '../../../../src/client/components/Dashboard/productsApi';

type ChartData = {
  category: string;
  'Total Stock': number;
};

const TotalStockByCategoryChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await getProducts();

        const stockByCategory: Record<string, number> = {};
        products.forEach((p: { category: string; stock: number }) => {
          stockByCategory[p.category] = (stockByCategory[p.category] || 0) + p.stock;
        });

        // Format data for Tremor
        const formattedData: ChartData[] = Object.entries(stockByCategory).map(([category, stock]) => ({
          category: category
            .split('-')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
          'Total Stock': stock
        }));

        // Sort by stock in descending order
        formattedData.sort((a, b) => b['Total Stock'] - a['Total Stock']);
        
        setChartData(formattedData);
      } catch (err) {
        console.error('Error loading product data:', err);
        setError('Failed to load stock data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <Text>Loading stock data...</Text>
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
        Total Stock by Category
      </Title>
      
      <BarChart
        className="h-80 mt-4"
        data={chartData}
        index="category"
        categories={['Total Stock']}
        colors={['purple']}
        valueFormatter={(number) => `${number} units`}
      />
    </Card>
  );
};

export default TotalStockByCategoryChart;
