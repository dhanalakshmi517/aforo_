import React, { useEffect, useState } from 'react';
import { Card, Title, ScatterChart } from '@tremor/react';
import { getProducts } from '../../../../src/client/components/Dashboard/productsApi';

type ScatterPoint = {
  price: number;
  rating: number;
  category: string;
};

const PriceVsRatingScatterChart: React.FC = () => {
  const [chartData, setChartData] = useState<ScatterPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await getProducts();
        
        // Transform products into scatter points
        const points = products.map((p) => ({
          price: p.price,
          rating: p.rating,
          category: p.category.split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        }));
        
        setChartData(points);
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
      <Card className="col-span-12 xl:col-span-6 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <p>Loading product data...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-12 xl:col-span-6 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <p className="text-red-500">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="col-span-12 xl:col-span-6 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <Title className="mb-4 text-lg font-semibold text-black dark:text-white">
        Price vs Rating (Scatter)
      </Title>
      <ScatterChart
        className="h-80"
        data={chartData}
        category="category"
        x="price"
        y="rating"
        size="price"
        colors={["rose", "indigo", "cyan", "amber", "emerald", "violet"]}
        valueFormatter={{
          x: (price) => `$${price}`,
          y: (rating) => rating.toFixed(1),
          size: (price) => `$${price}`
        }}
        showLegend
      />
    </Card>
  );
};

export default PriceVsRatingScatterChart;
