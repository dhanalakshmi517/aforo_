// ProductsByCategoryDonutChart.tsx
import React, { useEffect, useState } from 'react';
import { DonutChart, Title, Text, Flex } from '@tremor/react';
import { getProducts } from '../../../../src/client/components/Dashboard/productsApi';

type CategoryData = {
  category: string;
  count: number;
};

const ProductsByCategoryDonutChart: React.FC = () => {
  const [chartData, setChartData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

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

        // Format data for Tremor
        const formattedData = Object.entries(categoryCounts).map(([category, count]) => ({
          category: category
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          count
        }));

        // Sort by count (optional)
        formattedData.sort((a, b) => b.count - a.count);
        
        setChartData(formattedData);
        setTotal(formattedData.reduce((sum, item) => sum + item.count, 0));
      } catch (err) {
        console.error('Error loading product data for donut chart:', err);
        setError('Failed to load category data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!chartData.length) return null;

  return (
    <div>
      <div className="mb-2 flex flex-col">
        <Title className="text-sm font-semibold text-gray-900">Category Share</Title>
        <Text className="text-xs text-gray-600">{total} products</Text>
      </div>

      <DonutChart
        className="mt-6"
        data={chartData}
        category="count"
        index="category"
        valueFormatter={(value) => `${value} products`}
        colors={['green', 'red', 'amber', 'blue', 'teal', 'indigo']}
        variant="pie"
        label="Products"
      />
    </div>
  );
};

export default ProductsByCategoryDonutChart;
