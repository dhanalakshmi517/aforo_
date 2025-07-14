import React, { useState, useEffect } from "react";
import {
  ProductType,
  GeneralFormData,
  MetadataForm,
  ConfigurationData,
  FormData,
  EditProductFormProps
} from './types';

import FormTabs from './FormTabs';
import { getInitialConfig } from './utils';
import { updateProduct, fetchProductData } from './api';

const EditProductForm = ({
  productId,
  productType,
  productName,
  showEditForm,
  onClose,
  onSave
}: EditProductFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    productName: productName || '',
    productType: productType || ProductType.API,
    version: '',
    description: '',
    tags: {},
    category: '',
    visibility: false,
    status: '',
    internalSkuCode: '',
    uom: '',
    effectiveStartDate: '',
    effectiveEndDate: '',
    billable: false,
    linkedRatePlans: [],
    labels: {},
    auditLogId: 0,
    configuration: getInitialConfig(productType)
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'metadata' | 'configuration'>('general');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        if (!productId || !productType) return;
        const data = await fetchProductData(productId, productType);
        setFormData(data);
        setIsInitialLoading(false);
      } catch (error) {
        console.error('Error loading product data:', error);
        setError('Failed to load product data');
        setIsInitialLoading(false);
      }
    };

    loadProductData();
  }, [productId, productType]);

  const initializeHandlers = () => {
    const handleTabChange = (tab: 'general' | 'metadata' | 'configuration') => {
      setActiveTab(tab);
    };

    const updateFormData = (field: keyof FormData, value: any) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const onNextClick = async () => {
      try {
        setLoading(true);
        if (!formData) {
          setError('Form data is not initialized');
          return;
        }

        if (activeTab === 'general') {
          if (!formData.productName) {
            setError('Product Name is required');
            return;
          }
          if (!formData.productType) {
            setError('Product Type is required');
            return;
          }

          const updatedData = await updateProduct(productId, {
            ...formData,
            configuration: undefined
          });
          setFormData(updatedData);
          handleTabChange('metadata');
          setSuccess('General details saved successfully');
        } else if (activeTab === 'metadata') {
          try {
            const updatedData = await updateProduct(productId, {
              ...formData,
              configuration: undefined
            });

            const normalizedType = updatedData.productType.toLowerCase();
            const apiType = {
              [ProductType.API]: 'api',
              [ProductType.FLATFILE]: 'flatfile',
              [ProductType.SQLRESULT]: 'sql-result',
              [ProductType.LLMTOKEN]: 'llm-token'
            }[normalizedType];

            if (!apiType) {
              throw new Error(`Invalid product type: ${updatedData.productType}`);
            }

            const configResponse = await fetch(`http://13.230.194.245:8080/api/products/${productId}/${apiType}`);
            if (!configResponse.ok) {
              throw new Error('Failed to fetch configuration details');
            }

            const configData = await configResponse.json();

            const completeConfig = {
              ...getInitialConfig(updatedData.productType),
              ...configData,
              ...(updatedData.configuration || {})
            };

            setFormData({
              ...updatedData,
              configuration: completeConfig
            });

            handleTabChange('configuration');
            setSuccess('General and Metadata details saved successfully');
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch configuration details');
            console.error(error instanceof Error ? error.message : 'Failed to fetch configuration details');
          }
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to save details');
        console.error(error instanceof Error ? error.message : 'Failed to save details');
      } finally {
        setLoading(false);
      }
    };

    const handleSubmit = async (): Promise<void> => {
      setLoading(true);
      setError('');
      try {
        await updateProduct(productId, formData);

        try {
          const config = await fetch(`http://13.230.194.245:8080/api/products/${productId}/${formData.productType.toLowerCase()}`);
          if (config.ok) {
            const configData = await config.json();
            await updateProduct(productId, {
              ...formData,
              configuration: configData
            });
          } else {
            await updateProduct(productId, formData);
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch configuration details');
          console.error(error instanceof Error ? error.message : 'Failed to fetch configuration details');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to save details');
        console.error(error instanceof Error ? error.message : 'Failed to save details');
      } finally {
        setLoading(false);
        onSave();
      }
    };

    const handleCancel = () => {
      onClose();
    };

    return {
      handleTabChange,
      updateFormData,
      onNextClick,
      handleSubmit,
      handleCancel
    };
  };

  const {
    handleTabChange,
    updateFormData,
    onNextClick,
    handleSubmit,
    handleCancel
  } = initializeHandlers();

  const handleBack = () => {
    if (activeTab === 'metadata') {
      handleTabChange('general');
    } else if (activeTab === 'configuration') {
      handleTabChange('metadata');
    }
  };

  useEffect(() => {
    if (productId) {
      setLoading(true);
      setIsInitialLoading(true);
      fetchProductData(productId, productType).then(async data => {
        if (!data) {
          setError('No product data found');
          setIsInitialLoading(false);
          setLoading(false);
          return;
        }

        setFormData({
          ...data,
          configuration: getInitialConfig(data.productType)
        });

        updateProduct(productId, data).catch(error => {
          console.error('Error saving initial data:', error);
        });
      }).catch(error => {
        setError('Failed to load product data');
        console.error('Error loading product data:', error);
      }).finally(() => {
        setLoading(false);
        setIsInitialLoading(false);
      });

      setFormData({
        productName: productName || '',
        productType: productType || ProductType.API,
        version: '',
        description: '',
        tags: {},
        category: '',
        visibility: false,
        status: '',
        internalSkuCode: '',
        uom: '',
        effectiveStartDate: '',
        effectiveEndDate: '',
        billable: false,
        linkedRatePlans: [],
        labels: {},
        auditLogId: 0,
        configuration: getInitialConfig(productType)
      });
      setError('');
      setSuccess('');
      setIsInitialLoading(false);
    }
  }, [productId]);

  return (
    <div className="edit-product-form-container">
      <FormTabs
        formData={formData}
        setFormData={setFormData}
        productType={productType}
        error={error}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNextClick={onNextClick}
        onSubmit={handleSubmit}
        onClose={onClose}
        loading={loading}
        productId={productId}
        setLoading={setLoading}
        setError={setError}
      />
    </div>
  );
};

export default EditProductForm;
