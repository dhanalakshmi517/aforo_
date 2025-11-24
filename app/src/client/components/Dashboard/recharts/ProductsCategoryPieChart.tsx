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

type CategorySlice = {
  name: string;   // category
  value: number;  // number of products
};

const COLORS: string[] = [
  '#6366f1',
  '#22c55e',
  '#f97316',
  '#ec4899',
  '#14b8a6',
  '#facc15',
  '#8b5cf6',
];

const ProductsCategoryPieChart: React.FC = () => {
  const [data, setData] = useState<CategorySlice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async (): Promise<void> => {
      try {
        const res = await fetch('https://dummyjson.com/products');
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const json: ProductsResponse = (await res.json()) as ProductsResponse;

        const map = new Map<string, number>();

        json.products.forEach((p) => {
          const prev = map.get(p.category) ?? 0;
          map.set(p.category, prev + 1);
        });

        const pieData: CategorySlice[] = Array.from(map.entries()).map(
          ([name, value]) => ({ name, value })
        );

        setData(pieData);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading category pie chart…</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data.length) return <div>No data for category pie chart.</div>;

  return (
    <div style={{ width: '100%', height: 400, padding: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
        Products per category
      </h2>
      <ResponsiveContainer width="85%" height="100%">
  <PieChart>
    <Pie
      data={data}
      dataKey="value"
      nameKey="name"
      cx="45%"        // Fixes spacing
      cy="50%"
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

    <Legend
      layout="vertical"
      align="right"
      verticalAlign="middle"
    />
  </PieChart>
</ResponsiveContainer>

    </div>
  );
};

export default ProductsCategoryPieChart;
