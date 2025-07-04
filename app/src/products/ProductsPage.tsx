import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Button, Grid, Card, CardContent, 
  CardActions, Box, Chip, CircularProgress, Alert 
} from '@mui/material';
import { getProducts } from './queries/getProducts';
import { deleteProduct } from './actions/productActions';

// Product type
type Product = {
  id: string;
  name: string;
  type: string;
  description: string;
  apiEndpoint?: string;
  status: 'DRAFT' | 'PUBLISHED';
  pricingModel: 'USAGE_BASED' | 'SUBSCRIPTION' | 'ENTERPRISE' | 'CUSTOM';
  basePrice: number;
  documentation?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await getProducts({});
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await deleteProduct({ id }, {});
        // Refresh the products list
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product. Please try again.');
        setLoading(false);
      }
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string): string => {
    return status === 'PUBLISHED' ? 'success' : 'warning';
  };

  if (loading && products.length === 0) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading products...
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/products/add')}
        >
          Add New Product
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {products.length === 0 && !loading ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6">
            No products found
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, mb: 3 }}>
            Get started by adding your first product
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/products/add')}
          >
            Add New Product
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                      {product.name}
                    </Typography>
                    <Chip 
                      label={product.status} 
                      color={getStatusColor(product.status) as 'success' | 'warning'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {product.type}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {product.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Price: ${product.basePrice.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created: {formatDate(product.createdAt)}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate(`/products/edit/${product.id}`)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProductsPage;
