interface ProductValidationResponse {
  exists: boolean;
  message?: string;
}

export const validateProductName = async (productName: string): Promise<ProductValidationResponse> => {
  try {
    const response = await fetch('http://13.230.194.245:8080/api/products');
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const products = await response.json();
    
    // Check if response is an array
    if (!Array.isArray(products)) {
      throw new Error('Invalid response format');
    }

    // Check if any product has the same name (case-insensitive)
    const exists = products.some(product => 
      product.productName?.toLowerCase() === productName.toLowerCase()
    );

    return {
      exists,
      message: exists ? 'Product Name must be unique.' : undefined
    };
  } catch (error) {
    console.error('Error validating product name:', error);
    return {
      exists: false,
      message: 'Error checking product name uniqueness'
    };
  }
};
