import React from 'react';
import { Card, Title, AreaChart, Text, Flex } from '@tremor/react';

type ChartData = {
  day: string;
  Revenue: number;
  Profit: number;
};

const RevenueAndProfitChart: React.FC = () => {
  // Data in Tremor format
  const chartData: ChartData[] = [
    { day: 'Mon', Revenue: 30, Profit: 20 },
    { day: 'Tue', Revenue: 40, Profit: 30 },
    { day: 'Wed', Revenue: 35, Profit: 25 },
    { day: 'Thu', Revenue: 50, Profit: 35 },
    { day: 'Fri', Revenue: 49, Profit: 30 },
    { day: 'Sat', Revenue: 60, Profit: 40 },
    { day: 'Sun', Revenue: 70, Profit: 50 },
  ];

  return (
    <Card>
      <Flex className='mb-4' justifyContent="between" alignItems="center">
        <Title className='text-sm font-semibold text-gray-900'>Revenue & Profit</Title>
        <Text className='text-xs text-gray-600'>Last 7 Days</Text>
      </Flex>
      
      <AreaChart
        className="h-72 mt-4"
        data={chartData}
        index="day"
        categories={['Revenue', 'Profit']}
        colors={['indigo', 'cyan']}
        valueFormatter={(number) => `$${number}k`}
        showLegend
      />
    </Card>
  );
};

export default RevenueAndProfitChart;
