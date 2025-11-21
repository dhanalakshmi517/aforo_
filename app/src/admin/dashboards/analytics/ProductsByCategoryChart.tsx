import React, { useEffect, useState } from 'react';
import { Card, Title, BarChart, Text } from '@tremor/react';
import { getProducts } from '../../../../src/client/components/Dashboard/productsApi';
import ProductsByCategoryDonutChart from './ProductsByCategoryDonutChart';

type ChartData = {
  category: string;
  'Number of Products': number;
};

const ProductsByCategoryChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await getProducts();
        
        // Group products by category and count them
        const categoryCounts = products.reduce((acc: {[key: string]: number}, product) => {
          acc[product.category] = (acc[product.category] || 0) + 1;
          return acc;
        }, {});

        // Format the data for Tremor BarChart
        const formattedData = Object.entries(categoryCounts).map(([category, count]) => ({
          category: category.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          'Number of Products': count
        }));

        // Sort by count in descending order
        formattedData.sort((a, b) => b['Number of Products'] - a['Number of Products']);
        
        setChartData(formattedData);
      } catch (err) {
        console.error('Error loading product data:', err);
        setError('Failed to load product data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <Text>Loading product data...</Text>
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
      <div className="mb-4">
        <Title className="text-xl font-semibold text-black dark:text-white">
          Products by Category
        </Title>
      </div>

      <BarChart
        className="h-80 mt-4"
        data={chartData}
        index="category"
        categories={['Number of Products']}
        colors={['indigo']}
        valueFormatter={(number) => `${number} products`}
      />
    </Card>
  );
};

export default ProductsByCategoryChart;
