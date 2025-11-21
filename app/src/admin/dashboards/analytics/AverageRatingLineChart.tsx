import React, { useEffect, useState } from 'react';
import { Card, Title, LineChart, Text } from '@tremor/react';
import { getProducts } from '../../../../src/client/components/Dashboard/productsApi';

type ChartData = {
  category: string;
  'Average Rating': number;
};

const AverageRatingLineChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await getProducts();

        // Calculate average rating by category
        const sums: Record<string, { total: number; count: number }> = {};
        products.forEach((p: { category: string; rating: number }) => {
          if (!sums[p.category]) sums[p.category] = { total: 0, count: 0 };
          sums[p.category].total += p.rating;
          sums[p.category].count += 1;
        });

        // Format data for Tremor
        const formattedData: ChartData[] = Object.entries(sums).map(([category, data]) => ({
          category: category
            .split('-')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
          'Average Rating': parseFloat((data.total / data.count).toFixed(2))
        }));

        // Sort by category name for line chart
        formattedData.sort((a, b) => a.category.localeCompare(b.category));
        
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
        Average Rating (Line)
      </Title>
      
      <LineChart
        className="h-72 mt-4"
        data={chartData}
        index="category"
        categories={['Average Rating']}
        colors={['emerald']}
        valueFormatter={(number) => number.toFixed(2)}
      />
    </Card>
  );
};

export default AverageRatingLineChart;
