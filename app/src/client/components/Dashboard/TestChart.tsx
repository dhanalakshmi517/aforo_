import React from 'react';
import { Card, BarChart, Title, Text } from '@tremor/react';

const TestChart: React.FC = () => {
  const chartData = [
    {
      name: 'Test 1',
      value: 30,
    },
    {
      name: 'Test 2',
      value: 50,
    },
    {
      name: 'Test 3',
      value: 80,
    },
  ];

  return (
    <Card>
      <Title>Test Chart</Title>
      <Text>Simple bar chart to test Tremor rendering</Text>
      <BarChart
        className="mt-6"
        data={chartData}
        index="name"
        categories={["value"]}
        colors={["blue"]}
        yAxisWidth={48}
      />
    </Card>
  );
};

export default TestChart;
