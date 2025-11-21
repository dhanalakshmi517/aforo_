import React, { useEffect, useState } from 'react';
import { Card, Title, BarChart, Text } from '@tremor/react';
import { getProducts, Product } from './productsApi';

type ChartData = {
  category: string;
  'Average Price': number;
  'Max Price': number;
  'Min Price': number;
};

const ProductPriceBarChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await getProducts();
        
        // Group products by category
        const categoryGroups: { [key: string]: Product[] } = {};
        products.forEach(product => {
          if (!categoryGroups[product.category]) {
            categoryGroups[product.category] = [];
          }
          categoryGroups[product.category].push(product);
        });
        
        // Calculate price metrics for each category
        const formattedData: ChartData[] = Object.entries(categoryGroups).map(([category, products]) => {
          const prices = products.map(product => product.price);
          const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
          const maxPrice = Math.max(...prices);
          const minPrice = Math.min(...prices);
          
          return {
            category: category.split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '),
            'Average Price': Number(avgPrice.toFixed(2)),
            'Max Price': maxPrice,
            'Min Price': minPrice
          };
        });

        // Sort by average price
        formattedData.sort((a, b) => b['Average Price'] - a['Average Price']);
        
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
        <Text>Loading product price data...</Text>
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
    <Card className="pa-card">
      <div className="mb-4">
        <Title className="text-xl font-semibold text-black dark:text-white">
          Product Prices by Category
        </Title>
        <Text className="text-sm text-gray-500">
          Average, minimum and maximum prices across product categories
        </Text>
      </div>

      <BarChart
        className="h-80 mt-4"
        data={chartData}
        index="category"
        categories={['Average Price', 'Min Price', 'Max Price']}
        colors={['indigo', 'emerald', 'amber']}
        valueFormatter={(value) => `$${value.toFixed(2)}`}
        yAxisWidth={60}
        stack={false}
      />
    </Card>
  );
};

export default ProductPriceBarChart;
