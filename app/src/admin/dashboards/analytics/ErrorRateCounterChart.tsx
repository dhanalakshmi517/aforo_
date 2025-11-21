import React from 'react';
import { Card, Title, AreaChart, Text, Flex } from '@tremor/react';

type ChartData = {
  month: string;
  'Error Rate': number;
};

const ErrorRateCounterChart: React.FC = () => {
  // Create data in Tremor format
  const chartData: ChartData[] = [
    { month: 'Jan', 'Error Rate': 15 },
    { month: 'Feb', 'Error Rate': 22 },
    { month: 'Mar', 'Error Rate': 28 },
    { month: 'Apr', 'Error Rate': 35 },
    { month: 'May', 'Error Rate': 42 },
    { month: 'Jun', 'Error Rate': 38 },
    { month: 'Jul', 'Error Rate': 32 },
    { month: 'Aug', 'Error Rate': 28 },
    { month: 'Sep', 'Error Rate': 25 },
  ];

  return (
    <Card className="rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Flex className="mb-4" justifyContent="between">
        <Title className="text-sm font-semibold text-gray-200">Error Rate Counter</Title>
        <Text className="text-xs text-gray-400">Last 9 months</Text>
      </Flex>
      
      <AreaChart
        className="h-72 mt-4"
        data={chartData}
        index="month"
        categories={['Error Rate']}
        colors={['violet']}
        valueFormatter={(value) => `${value.toFixed(1)}%`}
        showAnimation
      />
    </Card>
  );
};

export default ErrorRateCounterChart;
