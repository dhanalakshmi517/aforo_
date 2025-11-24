// src/SolarInverterAreaChart.tsx
import React from 'react';
import {
  AreaChart,
  Area,
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
  { month: 'Jan 23', solarPanels: 2900, inverters: 2300 },
  { month: 'Feb 23', solarPanels: 2750, inverters: 2100 },
  { month: 'Mar 23', solarPanels: 3300, inverters: 2200 },
  { month: 'Apr 23', solarPanels: 3450, inverters: 2100 },
  { month: 'May 23', solarPanels: 3450, inverters: 1800 },
  { month: 'Jun 23', solarPanels: 3100, inverters: 1700 },
  { month: 'Jul 23', solarPanels: 3500, inverters: 1950 },
  { month: 'Aug 23', solarPanels: 2900, inverters: 2000 },
  { month: 'Sep 23', solarPanels: 2650, inverters: 2300 },
  { month: 'Oct 23', solarPanels: 2850, inverters: 2500 },
  { month: 'Nov 23', solarPanels: 3800, inverters: 3800 },
  { month: 'Dec 23', solarPanels: 3200, inverters: 3700 },
];

const currencyFormatter = (value: number): string =>
  `$${value.toLocaleString()}`;

const SolarInverterAreaChart: React.FC = () => {
  return (
    <div style={{ width: '100%', height: 420, padding: '24px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 30, right: 40, left: 0, bottom: 30 }}
        >
          {/* background grid */}
          <CartesianGrid strokeDasharray="3 3" />

          {/* X axis – months */}
          <XAxis dataKey="month" />

          {/* Y axis – dollars */}
          <YAxis tickFormatter={currencyFormatter} />

          {/* Hover tooltip */}
          <Tooltip
            formatter={(value: number) => currencyFormatter(value)}
            labelFormatter={(label) => label}
          />

          {/* Legend in top-right */}
          <Legend verticalAlign="top" align="right" />

          {/* Gradients for the areas */}
          <defs>
            <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorInverters" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Blue line + area */}
          <Area
            type="monotone"
            dataKey="solarPanels"
            name="SolarPanels"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorSolar)"
            activeDot={{ r: 5 }}
          />

          {/* Green line + area */}
          <Area
            type="monotone"
            dataKey="inverters"
            name="Inverters"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#colorInverters)"
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SolarInverterAreaChart;
