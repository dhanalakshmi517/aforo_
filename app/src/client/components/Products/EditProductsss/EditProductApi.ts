import { getAuthData } from '../../../utils/auth';

/**
 * Common helper to build authenticated headers.
 */
export const buildAuthHeaders = async (): Promise<Record<string, string>> => {
  const authData = getAuthData();
  if (!authData?.token) throw new Error('No authentication token');
  return {
    'Authorization': `Bearer ${authData.token}`,
    'Content-Type': 'application/json',
    'X-Organization-Id': authData?.organizationId?.toString() || '',
  };
};

/** Update general product details (name, version, sku, description) */
export const updateGeneralDetails = async (
  productId: string,
  payload: { productName: string; version: string; internalSkuCode: string; productDescription: string },
  method: 'PUT' | 'PATCH' = 'PUT'
): Promise<void> => {
  const headers = await buildAuthHeaders();
  const res = await fetch(`http://54.238.204.246:8080/api/products/${productId}`, {
    method,
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update product');
};

/** Fetch general details for an existing product by ID */
export const fetchGeneralDetails = async (productId: string): Promise<any> => {
  const headers = await buildAuthHeaders();
  const res = await fetch(`http://54.238.204.246:8080/api/products/${productId}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
};

/** Update configuration section for given product + productType */
export const updateConfiguration = async (
  productId: string,
  productType: string,
  config: Record<string, string>,
  usePost: boolean = false // If true, use POST (for new configurations or changed product type)
): Promise<void> => {
  // Map UI labels to backend keys first
  let mapped: Record<string, string | undefined> = {};
  switch (productType) {
    case 'FlatFile':
      mapped = {
        format: config['File Format'],
        fileLocation: config['File Location'],
      };
      break;
    case 'API':
      mapped = {
        endpointUrl: config['Endpoint URL'],
        authType: config['Auth Type'],
      };
      break;
    case 'SQLResult':
      mapped = {
        connectionString: config['Connection String'],
        dbType: config['DB Type'],
        authType: config['Auth Type'],
      };
      break;
    case 'LLMToken':
      mapped = {
        modelName: config['Model Name'],
        endpointUrl: config['Endpoint URL'],
        authType: config['Auth Type'],
      };
      break;
    default:
      mapped = config;
  }

  // Remove empty / undefined values so we only send selected ones
  const payload: Record<string, string> = Object.entries(mapped).reduce((acc, [k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      acc[k] = v as string;
    }
    return acc;
  }, {} as Record<string, string>);

  const headers = await buildAuthHeaders();
  const endpointMap: Record<string, string> = {
    API: 'api',
    FlatFile: 'flatfile',
    SQLResult: 'sql-result',
    LLMToken: 'llm-token',
  };
  const endpoint = endpointMap[productType] || productType.toLowerCase();
  const url = `http://54.238.204.246:8080/api/products/${productId}/${endpoint}`;

  // Use POST if product type changed or configuration doesn't exist, otherwise PUT
  const method = usePost ? 'POST' : 'PUT';
  console.log(`=== CONFIGURATION API CALL (EditProduct) ===`);
  console.log(`Method: ${method} (usePost: ${usePost})`);
  console.log(`URL: ${url}`);
  console.log(`Payload:`, payload);
  console.log(`===========================================`);
  
  const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
  if (!res.ok) {
    throw new Error('Failed to update configuration');
  }
};
