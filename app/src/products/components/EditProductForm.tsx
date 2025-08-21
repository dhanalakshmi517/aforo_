import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Box, Paper, Typography, TextField, Button, Grid, Alert, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import ProductBasicInfo from './ProductBasicInfo';
import ProductTechnicalDetails from './ProductTechnicalDetails';
import ProductPricing from './ProductPricing';
import ProductDocumentation from './ProductDocumentation';
import ProductFiles from './ProductFiles';
import { getProductById } from '../queries/getProducts';
import { ProductType, PricingModelType, ProductStatus } from './CreateProductForm';
import { updateProduct, deleteProduct } from '../actions/productActions';
import { showSuccessAlert, showErrorAlert, showLoadingAlert, closeAlert, showConfirmationDialog } from '../../utils/sweetAlert';

interface ProductInput {
  name: string;
  type: ProductType;
  description?: string;
  apiEndpoint?: string;
  status: ProductStatus;
  pricingModel: PricingModelType;
  basePrice: number;
  documentation?: string;
}

const EditProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);

  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ProductInput>({
    defaultValues: {
      name: '',
      type: 'Service',
      description: '',
      apiEndpoint: '',
      status: 'DRAFT',
      pricingModel: 'SUBSCRIPTION',
      basePrice: 0,
      documentation: ''
    }
  });

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setIsFetching(true);
        const fetchedProduct = await getProductById({ id }, {});

        if (fetchedProduct) {
          setProduct(fetchedProduct);

          // Set form values
          reset({
            name: fetchedProduct.name,
            type: fetchedProduct.type as ProductType,
            description: fetchedProduct.description || '',
            apiEndpoint: fetchedProduct.apiEndpoint || '',
            status: fetchedProduct.status,
            pricingModel: fetchedProduct.pricingModel,
            basePrice: fetchedProduct.basePrice,
            documentation: fetchedProduct.documentation || ''
          });
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(`Failed to fetch product: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProduct();
  }, [id, reset]);

  // Handle error alerts
  useEffect(() => {
    if (error) {
      showErrorAlert('Error', error);
    }
  }, [error]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCancel = () => {
    navigate('/products');
  };

  const handleSave = async (data: ProductInput, status?: ProductStatus) => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      // If status is provided, update it
      if (status) {
        data.status = status;
      }

      console.log('Updating product with data:', data);

      // Show loading alert
      showLoadingAlert('Updating Product', 'Please wait while we update your product...');

      // Update the product
      await updateProduct({
        id,
        product: {
          name: data.name,
          type: data.type,
          description: data.description,
          apiEndpoint: data.apiEndpoint,
          status: data.status,
          pricingModel: data.pricingModel,
          basePrice: data.basePrice,
          documentation: data.documentation
        }
      }, {});

      // Close loading alert and show success message
      closeAlert();
      showSuccessAlert('Product Updated', `${data.name} has been updated successfully!`);

      // Navigate back to products list
      navigate('/products');
    } catch (err) {
      console.error('Error updating product:', err);
      closeAlert();
      showErrorAlert('Update Failed', `Failed to update product: ${err instanceof Error ? err.message : String(err)}`);
      setError(`Failed to update product: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsDraft = () => {
    handleSubmit((data) => handleSave(data, 'DRAFT'))();
  };

  const handlePublish = () => {
    handleSubmit((data) => handleSave(data, 'PUBLISHED'))();
  };

  const handleDelete = async () => {
    if (!id) return;

    // Use SweetAlert confirmation dialog
    const result = await showConfirmationDialog(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      'Yes, delete it',
      'Cancel',
      'warning'
    );

    if (result.isConfirmed) {
      setIsLoading(true);
      setError(null);

      try {
        showLoadingAlert('Deleting Product', 'Please wait...');
        await deleteProduct({ id }, {});
        closeAlert();
        showSuccessAlert('Product Deleted', 'The product has been deleted successfully.');
        navigate('/products');
      } catch (err) {
        console.error('Error deleting product:', err);
        closeAlert();
        showErrorAlert('Deletion Failed', `Failed to delete product: ${err instanceof Error ? err.message : String(err)}`);
        setError(`Failed to delete product: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    }
  };

  const handleDocumentationChange = (content: string) => {
    setValue('documentation', content);
  };

  if (isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '298px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product && !isFetching) {
    return (
      <Box sx={{ p: 1 }}>
        <Alert severity="error">
          {error || 'Product not found'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/products')}
          sx={{ mt: 0 }}
        >
          Back to Products
        </Button>
      </Box>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h2" gutterBottom>
        Edit Product
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 0 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="General Info" />
          <Tab label="Technical Details" />
          <Tab label="Pricing" />
          <Tab label="Documentation" />
          <Tab label="Files" />
        </Tabs>
      </Box>

      <Box sx={{ p: 1 }}>
        {activeTab === 0 && (
          <Box>
            <Typography variant="h4" gutterBottom>
              General Information
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={10} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Product Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={10} sm={6}>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: 'Type is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.type}>
                      <InputLabel>Product Type</InputLabel>
                      <Select {...field} label="Product Type">
                        <MenuItem value="Service">Service</MenuItem>
                        <MenuItem value="Dataset">Dataset</MenuItem>
                        <MenuItem value="API">API</MenuItem>
                        <MenuItem value="Storage">Storage</MenuItem>
                      </Select>
                      {errors.type && (
                        <Typography variant="caption" color="error">
                          {errors.type.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={10}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={2}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Technical Details
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={10}>
                <Controller
                  name="apiEndpoint"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="API Endpoint"
                      fullWidth
                      error={!!errors.apiEndpoint}
                      helperText={errors.apiEndpoint?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={10}>
                <ProductTechnicalDetails
                  productId={id ? parseInt(id) : null}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Pricing
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={10} sm={6}>
                <Controller
                  name="pricingModel"
                  control={control}
                  rules={{ required: 'Pricing model is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.pricingModel}>
                      <InputLabel>Pricing Model</InputLabel>
                      <Select {...field} label="Pricing Model">
                        <MenuItem value="USAGE_BASED">Usage Based</MenuItem>
                        <MenuItem value="SUBSCRIPTION">Subscription</MenuItem>
                        <MenuItem value="ENTERPRISE">Enterprise</MenuItem>
                        <MenuItem value="CUSTOM">Custom</MenuItem>
                      </Select>
                      {errors.pricingModel && (
                        <Typography variant="caption" color="error">
                          {errors.pricingModel.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={10} sm={6}>
                <Controller
                  name="basePrice"
                  control={control}
                  rules={{
                    required: 'Base price is required',
                    min: { value: 0, message: 'Price cannot be negative' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Base Price"
                      type="number"
                      fullWidth
                      error={!!errors.basePrice}
                      helperText={errors.basePrice?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Documentation
            </Typography>
            <ProductDocumentation
              initialContent={watch('documentation') || ''}
              onChange={handleDocumentationChange}
              productId={id ? parseInt(id) : null}
            />
          </Box>
        )}

        {activeTab === 4 && id && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Product Files
            </Typography>
            <ProductFiles productId={parseInt(id)} />
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Box>
          <Button
            onClick={handleCancel}
            variant="outlined"
            color="secondary"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="outlined"
            color="error"
            disabled={isLoading}
          >
            Delete
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleSaveAsDraft}
            disabled={isLoading}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            onClick={handlePublish}
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={22} /> : 'Publish'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default EditProductForm;
