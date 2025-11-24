import React, { useEffect, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
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

type ScatterPoint = {
  title: string;
  price: number;
  rating: number;
};

const ProductsScatterChart: React.FC = () => {
  const [data, setData] = useState<ScatterPoint[]>([]);
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

        const scatterData: ScatterPoint[] = json.products.slice(0, 30).map((p) => ({
          title: p.title,
          price: Number(p.price),
          rating: Number(p.rating),
        }));

        setData(scatterData);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading scatter chart…</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data.length) return <div>No data for scatter chart.</div>;

  return (
    <div style={{ width: '100%', height: 400, padding: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
        Price vs rating
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <XAxis
            type="number"
            dataKey="price"
            name="Price"
            unit="$"
          />
          <YAxis
            type="number"
            dataKey="rating"
            name="Rating"
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value, name, props) => {
              if (name === 'price') return [`$${value}`, 'Price'];
              if (name === 'rating') return [value, 'Rating'];
              return [value, name];
            }}
            labelFormatter={(_, payload) =>
              payload && payload[0] ? (payload[0].payload as ScatterPoint).title : ''
            }
          />
          <Legend />
          <Scatter name="Products" data={data} fill="#6366f1" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductsScatterChart;
