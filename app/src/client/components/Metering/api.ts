export interface Product {
  productId: number;
  productName: string;
  productType: string;
  version: string;
  productDescription: string | null;
  tags: Record<string, unknown>;
}

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch('http://13.230.194.245:8080/api/products');
    if (!response.ok) {
      throw new Error(`API error with status ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}
