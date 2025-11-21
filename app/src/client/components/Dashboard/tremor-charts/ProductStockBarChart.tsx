import React, { useEffect, useState } from 'react';
import { Card, Text } from '@tremor/react';
import { getProducts, Product } from '../productsApi';
import TremorBarChart from './TremorBarChart';

type ChartData = {
  category: string;
  'Total Stock': number;
  'Average Stock per Product': number;
};

const ProductStockBarChart: React.FC = () => {
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
        
        // Calculate stock metrics for each category
        const formattedData: ChartData[] = Object.entries(categoryGroups).map(([category, products]) => {
          const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
          const avgStock = Number((totalStock / products.length).toFixed(2));
          
          return {
            category: category.split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '),
            'Total Stock': totalStock,
            'Average Stock per Product': avgStock
          };
        });

        // Sort by total stock in descending order
        formattedData.sort((a, b) => b['Total Stock'] - a['Total Stock']);
        
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
        <Text>Loading product stock data...</Text>
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
    <TremorBarChart
      title="Product Stock by Category"
      description="Total and average inventory levels across product categories"
      data={chartData}
      index="category"
      categories={['Total Stock', 'Average Stock per Product']}
      colors={['blue', 'cyan']}
      valueFormatter={(value: number) => value.toLocaleString()}
    />
  );
};

export default ProductStockBarChart;
