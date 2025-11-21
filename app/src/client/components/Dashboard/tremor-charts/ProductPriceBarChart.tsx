import React, { useEffect, useState } from 'react';
import { Card, Text } from '@tremor/react';
import { getProducts, Product } from '../productsApi';
import TremorBarChart from './TremorBarChart';

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
        console.log('Fetched products data:', products);
        
        // Group products by category
        const categoryGroups: { [key: string]: Product[] } = {};
        products.forEach(product => {
          if (!categoryGroups[product.category]) {
            categoryGroups[product.category] = [];
          }
          categoryGroups[product.category].push(product);
        });
        console.log('Product categories:', Object.keys(categoryGroups));
        
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
        
        console.log('Formatted chart data:', formattedData);
        
        // Ensure we have valid data
        if (formattedData && formattedData.length > 0) {
          console.log('First data item:', formattedData[0]);
          console.log('Sample values - Average Price:', formattedData[0]['Average Price']);
          console.log('Sample values - Min Price:', formattedData[0]['Min Price']);
          console.log('Sample values - Max Price:', formattedData[0]['Max Price']);
        } else {
          console.warn('No data available for chart');
        }
        
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
    <TremorBarChart
      title="Product Prices by Category"
      description="Average, minimum and maximum prices across product categories"
      data={chartData}
      index="category"
      categories={['Average Price', 'Min Price', 'Max Price']}
      colors={['indigo', 'emerald', 'amber']}
      valueFormatter={(value: number) => `$${value.toFixed(2)}`}
    />
  );
};

export default ProductPriceBarChart;
