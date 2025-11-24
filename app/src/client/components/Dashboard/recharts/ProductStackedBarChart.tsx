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

type StackedPoint = {
  category: string;
  totalStock: number;
  totalPrice: number;
};

const ProductsStackedBarChart: React.FC = () => {
  const [data, setData] = useState<StackedPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async (): Promise<void> => {
      try {
        const res = await fetch('https://dummyjson.com/products');
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const json: ProductsResponse = (await res.json()) as ProductsResponse;

        const aggMap = new Map<string, { stock: number; price: number }>();

        json.products.forEach((p) => {
          const entry = aggMap.get(p.category) ?? { stock: 0, price: 0 };
          entry.stock += Number(p.stock);
          entry.price += Number(p.price);
          aggMap.set(p.category, entry);
        });

        const chartData: StackedPoint[] = Array.from(aggMap.entries()).map(
          ([category, { stock, price }]) => ({
            category,
            totalStock: stock,
            totalPrice: Number(price.toFixed(2)),
          })
        );

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

  if (loading) return <div>Loading stacked bar chart…</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data.length) return <div>No data for stacked bar chart.</div>;

  return (
    <div style={{ width: '100%', height: 400, padding: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
        Stock & price by category
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <XAxis
            dataKey="category"
            angle={-30}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalStock" stackId="a" fill="#22c55e" name="Total Stock" />
          <Bar dataKey="totalPrice" stackId="a" fill="#6366f1" name="Total Price" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductsStackedBarChart;
