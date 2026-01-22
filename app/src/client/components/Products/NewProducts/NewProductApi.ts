import { getAuthData } from '../../../utils/auth';

const buildHeaders = (): Record<string, string> => {
  const auth = getAuthData();
  if (!auth?.token) throw new Error('No authentication token');
  return {
    Authorization: `Bearer ${auth.token}`,
    'X-Organization-Id': auth.organizationId?.toString() || '',
    'Content-Type': 'application/json',
  };
};

const endpointMap: Record<string, string> = {
  API: 'api',
  FlatFile: 'flatfile',
  SQLResult: 'sql-result',
  LLMToken: 'llm-token',
};

const mapType = (type: string): string => endpointMap[type] || type.toLowerCase();

export const createConfiguration = async (
  productId: string,
  productType: string,
  payload: Record<string, any>,
): Promise<void> => {
  const res = await fetch(
    `http://54.238.204.246:8080/api/products/${productId}/${mapType(productType)}`,
    { method: 'POST', headers: buildHeaders(), body: JSON.stringify(payload) },
  );
  if (!res.ok) throw new Error('Failed to create configuration');
};

export const updateConfiguration = async (
  productId: string,
  productType: string,
  payload: Record<string, any>,
): Promise<void> => {
  const res = await fetch(
    `http://54.238.204.246:8080/api/products/${productId}/${mapType(productType)}`,
    { method: 'PUT', headers: buildHeaders(), body: JSON.stringify(payload) },
  );
  if (!res.ok) throw new Error('Failed to update configuration');
};

// Save configuration based on whether any values are provided.
// If no configuration values are selected (empty payload), we create the
// configuration with a POST request. Otherwise we update the existing
// configuration using PUT. We still provide a fallback to try the alternate
// method if the first attempt fails with common conflict or not-allowed codes.
export const saveConfiguration = async (
  productId: string,
  productType: string,
  payload: Record<string, any>,
): Promise<void> => {
  const url = `http://54.238.204.246:8080/api/products/${productId}/${mapType(productType)}`;
  const headers = buildHeaders();

  // Decide the HTTP method: POST when payload is empty (no values selected),
  // otherwise PUT for updates.
  const hasValues = payload && Object.keys(payload).length > 0;
  let method: 'POST' | 'PUT' = hasValues ? 'PUT' : 'POST';

  let res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
  if (res.ok) return;

  // On failure, attempt the opposite method in scenarios where the first
  // method might be rejected because the resource does/doesn't exist yet.
  // Always try the alternate method on failure, not just for specific status codes
  const alternateMethod: 'POST' | 'PUT' = method === 'POST' ? 'PUT' : 'POST';
  res = await fetch(url, { method: alternateMethod, headers, body: JSON.stringify(payload) });
  if (res.ok) return;

  throw new Error('Failed to save configuration');
};

export const finalizeDraft = async (productId: string): Promise<void> => {
  const res = await fetch(
    `http://54.238.204.246:8080/api/products/${productId}/finalize`,
    { method: 'POST', headers: buildHeaders() },
  );
  if (!res.ok) throw new Error('Failed to finalize product');
};
