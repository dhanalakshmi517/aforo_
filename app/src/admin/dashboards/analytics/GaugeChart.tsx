import React from 'react';
import { Card, Title, Text, Flex, Metric, ProgressBar } from '@tremor/react';

const GaugeChart: React.FC = () => {
  // Current value - 75% of target achieved
  const currentValue = 75;
  const goalValue = 85;
  const previousValue = 68;
  
  return (
    <Card>
      <Flex className='mb-4' justifyContent="between">
        <Title className='text-sm font-semibold text-gray-900'>Performance Gauge</Title>
        <Text className='text-xs text-gray-600'>Current Status</Text>
      </Flex>
      
      <div className="flex flex-col items-center justify-center py-6">
        <Metric className="text-center text-green-600">{currentValue}%</Metric>
        <Text className="text-center mt-2">Performance</Text>
        
        <div className="w-full mt-4">
          <ProgressBar value={currentValue} color="green" className="mt-2" />
        </div>
      </div>
      
      <div className='mt-6 space-y-3'>
        <div className='flex justify-between items-center py-2 border-b border-gray-100'>
          <Text className='text-sm text-gray-600'>Target Achieved</Text>
          <Text className='text-sm font-semibold text-gray-900'>{currentValue}%</Text>
        </div>
        <div className='flex justify-between items-center py-2 border-b border-gray-100'>
          <Text className='text-sm text-gray-600'>Monthly Goal</Text>
          <Text className='text-sm font-semibold text-gray-900'>{goalValue}%</Text>
        </div>
        <div className='flex justify-between items-center py-2'>
          <Text className='text-sm text-gray-600'>Previous Month</Text>
          <Text className='text-sm font-semibold text-green-600'>{previousValue}%</Text>
        </div>
      </div>
    </Card>
  );
};

export default GaugeChart;
