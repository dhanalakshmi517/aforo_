import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
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

type CategoryPoint = {
  category: string;
  avgRating: number;
};

const ProductsCategoryHorizontalBarChart: React.FC = () => {
  const [data, setData] = useState<CategoryPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async (): Promise<void> => {
      try {
        const res = await fetch('https://dummyjson.com/products');
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const json: ProductsResponse = (await res.json()) as ProductsResponse;

        const map = new Map<string, { total: number; count: number }>();

        json.products.forEach((p) => {
          const entry = map.get(p.category) ?? { total: 0, count: 0 };
          entry.total += Number(p.rating);
          entry.count += 1;
          map.set(p.category, entry);
        });

        const chartData: CategoryPoint[] = Array.from(map.entries()).map(
          ([category, { total, count }]) => ({
            category,
            avgRating: count > 0 ? Number((total / count).toFixed(2)) : 0,
          })
        );

        // sort descending by avg rating for nicer look
        chartData.sort((a, b) => b.avgRating - a.avgRating);

        setData(chartData);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading horizontal bar chart…</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data.length) return <div>No data for horizontal bar chart.</div>;

  return (
    <div style={{ width: '100%', height: 400, padding: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
        Average rating by category
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
        >
          <XAxis type="number" />
          <YAxis type="category" dataKey="category" />
          <Tooltip />
          <Legend />
          <Bar dataKey="avgRating" fill="#22c55e" name="Avg Rating" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductsCategoryHorizontalBarChart;
