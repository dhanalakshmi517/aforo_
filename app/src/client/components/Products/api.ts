import { getAuthHeaders, isAuthenticated, logout } from '../../utils/auth';

const BASE_URL = 'http://54.238.204.246:8080/api';

async function handleApiResponse(res: Response) {
  if (res.status === 401) {
    logout();
    throw new Error('Session expired. Please login again.');
  }
  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      message = res.statusText || message;
    }
    throw new Error(message);
  }
  return res.json();
}

export interface ProductPayload {
  productName: string;
  productType: string;
  category?: string;
  billable?: boolean;
  status?: string;
  [key: string]: any;
}

export async function getProducts() {
  if (!isAuthenticated()) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_URL}/products`, {
    headers: getAuthHeaders(),
  });
  return handleApiResponse(res);
}

export async function createProduct(payload: ProductPayload) {
  if (!isAuthenticated()) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleApiResponse(res);
}

export async function deleteProduct(productId: number | string) {
  if (!isAuthenticated()) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleApiResponse(res);
}
