import React from 'react';
import { Card, Title, BarChart, Text, Color } from '@tremor/react';

interface TremorBarChartProps {
  title: string;
  description: string;
  data: any[];
  index: string;
  categories: string[];
  colors: Color[];
  valueFormatter?: (value: number) => string;
}

const TremorBarChart: React.FC<TremorBarChartProps> = ({
  title,
  description,
  data,
  index,
  categories,
  colors,
  valueFormatter = (value) => `${value}`
}) => {
  // Debug logs
  console.log('TremorBarChart props:', { title, description, data });
  console.log('Chart config:', { index, categories, colors });
  
  return (
    <Card className="max-w-full mx-auto">
      <div className="mb-4">
        <Title className="text-xl font-semibold text-black dark:text-white">
          {title}
        </Title>
        <Text className="text-sm text-gray-500">
          {description}
        </Text>
      </div>

      <BarChart
          data={data}
          index={index}
          categories={categories}
          colors={colors}
          valueFormatter={valueFormatter}
          yAxisWidth={60}
          className="mt-4 h-72"
      />
    </Card>
  );
};

export default TremorBarChart;
