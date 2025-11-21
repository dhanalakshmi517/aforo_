import React, { useEffect, useState } from 'react';
import { Card, Title, BarChart, Text } from '@tremor/react';
import { getProducts } from '../../../../src/client/components/Dashboard/productsApi';

type ChartData = {
  rating: string;
  Products: number;
};

const RatingDistributionChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await getProducts();

        // Create buckets for each rating value (1-5)
        const buckets: number[] = [0, 0, 0, 0, 0];
        products.forEach((p: { rating: number }) => {
          const r = Math.round(p.rating);
          if (r >= 1 && r <= 5) {
            buckets[r - 1] += 1;
          }
        });

        // Format data for Tremor
        const formattedData: ChartData[] = buckets.map((count, index) => ({
          rating: `${index + 1}`, // Convert to string
          Products: count
        }));
        
        setChartData(formattedData);
      } catch (err) {
        console.error('Error loading product data:', err);
        setError('Failed to load rating data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card className="col-span-12 xl:col-span-6 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <Text>Loading rating data...</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-12 xl:col-span-6 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <Text className="text-red-500">{error}</Text>
      </Card>
    );
  }

  return (
    <Card className="col-span-12 xl:col-span-6 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <Title className="mb-4 text-lg font-semibold text-black dark:text-white">
        Rating Distribution
      </Title>
      
      <BarChart
        className="h-72 mt-4"
        data={chartData}
        index="rating"
        categories={['Products']}
        colors={['green']}
        valueFormatter={(value) => `${value} products`}
      />
    </Card>
  );
};

export default RatingDistributionChart;
