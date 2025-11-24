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

const ProductsChart: React.FC = () => {
  const [data, setData] = useState<ChartPoint[]>([]);
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

        const chartData: ChartPoint[] = json.products.slice(0, 10).map((p) => ({
          title: p.title,
          rating: Number(p.rating),
          stock: Number(p.stock),
        }));

        setData(chartData);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading products…</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data.length) return <div>No products found.</div>;

  return (
    <div style={{ width: '100%', height: 500, padding: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
        Products – Rating vs Stock
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
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
          <Bar dataKey="rating" fill="#8884d8" />
          <Bar dataKey="stock" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductsChart;
