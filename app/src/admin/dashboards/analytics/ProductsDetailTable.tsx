import React, { useEffect, useState } from 'react';
import { getProducts, Product } from '../../../../src/client/components/Dashboard/productsApi';
import {
  Card,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Text,
  Title,
  Badge,
  TextInput,
  Flex,
  Button
} from '@tremor/react';

interface ExtendedProduct extends Product {
  tags?: string[];
  sku?: string;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: {
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  meta?: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
}

const ProductsDetailTable: React.FC = () => {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const productsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts as ExtendedProduct[]);
      } catch (err) {
        console.error('Error loading product data:', err);
        setError('Failed to load product data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  if (isLoading) {
    return (
      <Card>
        <Text>Loading product data...</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Text className="text-red-500">{error}</Text>
      </Card>
    );
  }

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Get formatted category name
  const formatCategory = (category: string) => {
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get appropriate color for rating badge
  const getRatingColor = (rating: number) => {
    if (rating < 2.5) return 'red';
    if (rating < 4) return 'amber';
    return 'green';
  };

  // Get appropriate color for stock badge
  const getStockColor = (stock: number) => {
    if (stock <= 20) return 'red';
    if (stock <= 50) return 'amber';
    return 'green';
  };

  // Get appropriate color for discount badge
  const getDiscountColor = (discount: number) => {
    if (discount >= 20) return 'green';
    if (discount >= 10) return 'amber';
    return 'gray';
  };

  return (
    <Card>
      <Flex justifyContent="between" alignItems="center" className="mb-6">
        <Title>Product Details</Title>
        <div className="max-w-xs">
          <TextInput 
            placeholder="Search by name, category, brand..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </Flex>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Product</TableHeaderCell>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell>Price</TableHeaderCell>
            <TableHeaderCell>Rating</TableHeaderCell>
            <TableHeaderCell>Stock</TableHeaderCell>
            <TableHeaderCell>Brand</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {currentProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Text className="font-medium">{product.title}</Text>
              </TableCell>
              <TableCell>
                <Text>{formatCategory(product.category)}</Text>
              </TableCell>
              <TableCell>
                <Text className="font-medium">{formatPrice(product.price)}</Text>
                {product.discountPercentage > 0 && (
                  <Badge size="xs" color={getDiscountColor(product.discountPercentage)}>
                    -{product.discountPercentage.toFixed(1)}%
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge size="sm" color={getRatingColor(product.rating)}>
                  {product.rating.toFixed(1)}
                </Badge>
                <Text className="text-xs text-gray-500 mt-1">
                  {product.reviews ? product.reviews.length : 3} reviews
                </Text>
              </TableCell>
              <TableCell>
                <Badge size="sm" color={getStockColor(product.stock)}>
                  {product.stock}
                </Badge>
              </TableCell>
              <TableCell>
                <Text>{product.brand}</Text>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Flex justifyContent="between" className="mt-6">
        <Text className="text-sm text-gray-500">
          Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} entries
        </Text>

        <Flex justifyContent="end" className="gap-2">
          <Button 
            size="xs" 
            variant="secondary" 
            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
            <Button
              key={i}
              size="xs"
              variant={currentPage === i + 1 ? "primary" : "secondary"}
              onClick={() => paginate(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          
          <Button 
            size="xs" 
            variant="secondary" 
            onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            &gt;
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export default ProductsDetailTable;
