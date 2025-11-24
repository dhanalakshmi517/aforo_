import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
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
};

interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

type ChartPoint = {
  title: string;
  rating: number;
  stock: number;
};

const ProductsAreaChart: React.FC = () => {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async (): Promise<void> => {
      try {
        const res = await fetch('https://dummyjson.com/products');
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }

        const json: ProductsResponse = (await res.json()) as ProductsResponse;

        const chartData: ChartPoint[] = json.products.slice(0, 10).map((p) => ({
          title: p.title,
          rating: Number(p.rating),
          stock: Number(p.stock),
        }));

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

  if (loading) return <div>Loading area chart…</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data.length) return <div>No data for area chart.</div>;

  return (
    <div style={{ width: '100%', height: 400, padding: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
        Rating & stock by product
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="title"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={80}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="rating"
            stroke="#6366f1"
            fill="#6366f1"
            name="Rating"
          />
          <Area
            type="monotone"
            dataKey="stock"
            stroke="#22c55e"
            fill="#22c55e"
            name="Stock"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductsAreaChart;
