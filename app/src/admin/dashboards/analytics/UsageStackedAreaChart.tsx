import { ApexOptions } from 'apexcharts';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { getProducts, Product } from '../../../../src/client/components/Dashboard/productsApi';

const baseOptions: ApexOptions = {
  chart: {
    type: 'area',
    height: 350,
    stacked: true,
    toolbar: {
      show: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
    width: 1,
  },
  fill: {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.6,
      opacityTo: 0.1,
    },
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    labels: {
      style: {
        fontSize: '12px',
      },
    },
  },
  yaxis: {
    title: {
      text: 'Usage',
    },
  },
  tooltip: {
    y: {
      formatter: (val: number) => `${val} units`,
    },
  },
  grid: {
    show: false,
  },
  colors: ['#3C50E0', '#80CAEE', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
};

// Simulated monthly usage data by category
const generateMonthlyUsageData = (products: Product[]) => {
  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category)));
  
  // Generate random usage data for each category for each month
  return categories.map((category, index) => {
    // Filter products by this category
    const categoryProducts = products.filter(p => p.category === category);
    const totalStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0);
    
    // Base the monthly data on the total stock with some randomness
    const baseValue = totalStock / 12;
    
    // Generate monthly data with an upward trend and some randomness
    const monthlyData = Array(12).fill(0).map((_, i) => {
      // Create an upward trend with some randomness
      const trendFactor = 1 + (i * 0.05); // 5% increase each month
      const randomFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2
      return Math.round(baseValue * trendFactor * randomFactor);
    });
    
    return {
      name: category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      data: monthlyData,
    };
  });
};

const UsageStackedAreaChart: React.FC = () => {
  const [series, setSeries] = useState<any[]>([]);
  const [options, setOptions] = useState<ApexOptions>(baseOptions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await getProducts();
        const usageData = generateMonthlyUsageData(products);
        
        // Take only top 5 categories to avoid overcrowding
        const topCategories = usageData
          .sort((a, b) => 
            b.data.reduce((sum: number, val: number) => sum + val, 0) - 
            a.data.reduce((sum: number, val: number) => sum + val, 0)
          )
          .slice(0, 5);
        
        setSeries(topCategories);
      } catch (err) {
        console.error('Error loading product data:', err);
        setError('Failed to load usage data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <p>Loading usage data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Monthly Usage by Category
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            Stacked area chart showing simulated monthly usage trends
          </p>
        </div>
      </div>

      <div>
        <div id="usageStackedAreaChart">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default UsageStackedAreaChart;
