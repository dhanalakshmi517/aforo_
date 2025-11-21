import React, { useEffect, useState } from 'react';
import { Card, Title, AreaChart, Text, Flex, Grid } from '@tremor/react';
import { getProducts, Product } from '../../../../src/client/components/Dashboard/productsApi';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Simulated monthly usage data by category for Tremor format
const generateMonthlyUsageData = (products: Product[]) => {
  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category)));
  
  // Generate data in Tremor's format (array of objects with month and category values)
  const result: { month: string; [key: string]: string | number }[] = [];
  
  // Initialize the result array with month objects
  months.forEach((month, monthIndex) => {
    result.push({ month });
  });

  categories.forEach((category) => {
    // Filter products by this category
    const categoryProducts = products.filter(p => p.category === category);
    const totalStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0);
    
    // Format category name
    const formattedCategory = category.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Base the monthly data on the total stock with some randomness
    const baseValue = totalStock / 12;
    
    // Add this category's data to each month
    months.forEach((month, i) => {
      // Create an upward trend with some randomness
      const trendFactor = 1 + (i * 0.05); // 5% increase each month
      const randomFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2
      result[i][formattedCategory] = Math.round(baseValue * trendFactor * randomFactor);
    });
  });
  
  return result;
};

const UsageStackedAreaChart: React.FC = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await getProducts();
        
        // Get unique categories and format them
        const uniqueCategories = Array.from(new Set(products.map(p => p.category)))
          .map(category => category.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          );

        // Take top 5 categories based on total products
        const categoryCounts = products.reduce((acc: {[key: string]: number}, product) => {
          const formattedCategory = product.category.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          acc[formattedCategory] = (acc[formattedCategory] || 0) + 1;
          return acc;
        }, {});
        
        const topCategories = Object.entries(categoryCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(entry => entry[0]);
        
        setCategories(topCategories);
        
        // Generate data with only top 5 categories
        const filteredProducts = products.filter(p => {
          const formattedCategory = p.category.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          return topCategories.includes(formattedCategory);
        });
        
        const data = generateMonthlyUsageData(filteredProducts);
        setChartData(data);
      } catch (err) {
        console.error('Error loading product data:', err);
        setError('Failed to load usage data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const colors = {
    'Smartphones': '#3C50E0',
    'Laptops': '#80CAEE',
    'Fragrances': '#10B981',
    'Skincare': '#F59E0B',
    'Groceries': '#EF4444',
    'Home Decoration': '#8B5CF6',
  };

  if (isLoading) {
    return (
      <Card className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <Text>Loading usage data...</Text>
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
          Monthly Usage by Category
        </Title>
        <Text className="text-sm text-gray-500 mt-1">
          Stacked area chart showing simulated monthly usage trends
        </Text>
      </div>

      <AreaChart
        className="h-80 mt-4"
        data={chartData}
        index="month"
        categories={categories}
        colors={['indigo', 'cyan', 'emerald', 'amber', 'rose', 'violet']}
        valueFormatter={(number) => `${number} units`}
        stack={true}
        showLegend
      />
    </Card>
  );
};

export default UsageStackedAreaChart;
