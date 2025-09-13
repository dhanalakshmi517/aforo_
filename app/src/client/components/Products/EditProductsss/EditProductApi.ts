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
  payload: { productName: string; version: string; internalSkuCode: string; productDescription: string }
): Promise<void> => {
  const headers = await buildAuthHeaders();
  const res = await fetch(`http://54.238.204.246:8080/api/products/${productId}`, {
    method: 'PUT',
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
  config: Record<string, string>
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

  // Decide between POST and PUT. If no values selected (empty payload) treat as create (POST), else update (PUT).
  const hasValues = Object.keys(payload).length > 0;
  let method: 'POST' | 'PUT' = hasValues ? 'PUT' : 'POST';

  let res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
  if (res.ok) return;

  // Retry with alternate method on typical conflict / not allowed codes
  const alternate: 'POST' | 'PUT' = method === 'POST' ? 'PUT' : 'POST';
  if ([404, 405, 409, 500].includes(res.status)) {
    res = await fetch(url, { method: alternate, headers, body: JSON.stringify(payload) });
    if (res.ok) return;
  }

  throw new Error('Failed to save configuration');
};
