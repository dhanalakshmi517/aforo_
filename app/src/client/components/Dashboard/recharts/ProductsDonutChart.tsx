import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

type Product = {
  id: number;
  title: string;
  price: number;
  rating: number;
  stock: number;
  category: string;
};

interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

type DonutSlice = {
  name: string;   // category name
  value: number;  // total stock for that category
};

// simple color palette
const COLORS = ['#6366f1', '#22c55e', '#f97316', '#ec4899', '#14b8a6', '#facc15', '#8b5cf6'];

const ProductsDonutChart: React.FC = () => {
  const [data, setData] = useState<DonutSlice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('https://dummyjson.com/products');
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        const json: ProductsResponse = await res.json();

        // aggregate total stock per category
        const map = new Map<string, number>();
        json.products.forEach((p) => {
          const prev = map.get(p.category) ?? 0;
          map.set(p.category, prev + Number(p.stock));
        });

        const donutData: DonutSlice[] = Array.from(map.entries()).map(
          ([name, value]) => ({ name, value })
        );

        setData(donutData);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading donut chart…</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data.length) return <div>No data for donut chart.</div>;

  return (
    <div style={{ width: '100%', height: 400, padding: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
        Stock distribution by category
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={140}
            paddingAngle={2}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductsDonutChart;
