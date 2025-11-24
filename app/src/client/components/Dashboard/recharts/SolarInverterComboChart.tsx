// src/SolarInverterComboChart.tsx
import React from 'react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type MonthlyPoint = {
  month: string;
  solarPanels: number;
  inverters: number;
};

const data: MonthlyPoint[] = [
  { month: 'Jan 23', solarPanels: 2800, inverters: 2100 },
  { month: 'Feb 23', solarPanels: 2700, inverters: 1900 },
  { month: 'Mar 23', solarPanels: 3200, inverters: 1950 },
  { month: 'Apr 23', solarPanels: 3400, inverters: 1850 },
  { month: 'May 23', solarPanels: 3400, inverters: 1700 },
  { month: 'Jun 23', solarPanels: 3000, inverters: 1650 },
  { month: 'Jul 23', solarPanels: 2800, inverters: 1800 },
  { month: 'Aug 23', solarPanels: 2700, inverters: 2000 },
  { month: 'Sep 23', solarPanels: 2850, inverters: 2200 },
  { month: 'Oct 23', solarPanels: 2950, inverters: 2300 },
  { month: 'Nov 23', solarPanels: 3100, inverters: 4000 },
  { month: 'Dec 23', solarPanels: 3300, inverters: 3800 },
];

const currencyFormatter = (value: number): string =>
  `$${value.toLocaleString()}`;

const SolarInverterComboChart: React.FC = () => {
  return (
    <div style={{ width: '100%', height: 420, padding: '24px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 30, right: 50, left: 50, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          {/* X axis: months */}
          <XAxis dataKey="month" />

          {/* Left Y axis: Solar panels (bars) */}
          <YAxis
            yAxisId="left"
            tickFormatter={currencyFormatter}
            label={{
              value: 'Solar Panels (Bars)',
              angle: -90,
              position: 'insideLeft',
            }}
          />

          {/* Right Y axis: Inverters (line) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={currencyFormatter}
            label={{
              value: 'Inverters (Line)',
              angle: 90,
              position: 'insideRight',
            }}
          />

          <Tooltip
            formatter={(value: number) => currencyFormatter(value)}
            labelFormatter={(label) => label}
          />

          <Legend verticalAlign="top" align="right" />

          {/* Bars: Solar panels */}
          <Bar
            yAxisId="left"
            dataKey="solarPanels"
            name="SolarPanels"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />

          {/* Line: Inverters */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="inverters"
            name="Inverters"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SolarInverterComboChart;
