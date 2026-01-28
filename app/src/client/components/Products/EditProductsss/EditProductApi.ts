import { getAuthData } from '../../../utils/auth';

export const BASE_URL = 'http://product.dev.aforo.space:8080/api';

export const buildAuthHeaders = () => {
  const auth = getAuthData();
  if (!auth?.token) throw new Error('No auth token');
  return {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json',
    'X-Organization-Id': auth?.organizationId?.toString() || ''
  };
};

export const fetchGeneralDetails = async (productId: string) => {
  const res = await fetch(`${BASE_URL}/products/${productId}`, { headers: buildAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
};

export const updateGeneralDetails = async (productId: string, payload: any) => {
  const res = await fetch(`${BASE_URL}/products/${productId}`, {
    method: 'PATCH',
    headers: buildAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update general details');
  return res.json();
};

// --- Configuration API (edit/create) ---
const typeToPath = (t: string) => {
  const m: Record<string, string> = {
    API: 'api',
    FlatFile: 'flatfile',
    SQLResult: 'sql-result',
    LLMToken: 'llm-token',
  };
  return m[t] || t.replace(/_/g, '-').toLowerCase();
};

// Map UI labels to backend keys per type
const mapConfigForBackend = (productType: string, ui: Record<string, any>) => {
  const lower = (productType || '').toLowerCase();
  if (lower === 'flatfile') {
    return {
      format: ui['File Format'] ?? ui.format,
      fileLocation: ui['File Location'] ?? ui.fileLocation,
    };
  }
  if (lower === 'api') {
    return {
      endpointUrl: ui['Endpoint URL'] ?? ui.endpointUrl,
      authType: ui['Auth Type'] ?? ui.authType,
    };
  }
  if (lower === 'sqlresult' || lower === 'sql-result') {
    return {
      connectionString: ui['Connection String'] ?? ui.connectionString,
      dbType: ui['DB Type'] ?? ui.dbType,
      authType: ui['Auth Type'] ?? ui.authType,
    };
  }
  if (lower === 'llmtoken' || lower === 'llm-token') {
    return {
      modelName: ui['Model Name'] ?? ui.modelName,
      endpointUrl: ui['Endpoint URL'] ?? ui.endpointUrl,
      authType: ui['Auth Type'] ?? ui.authType,
    };
  }
  return ui;
};

export const updateConfiguration = async (
  productId: string,
  productType: string,
  rawConfig: Record<string, any>,
  createNew: boolean // true => POST (create), false => PATCH (update)
) => {
  const headers = buildAuthHeaders();
  const path = typeToPath(productType);
  const url = `${BASE_URL}/products/${productId}/${path}`;

  // choose HTTP method
  const method = createNew ? 'POST' : 'PATCH';

  // prepare payload
  const payload = mapConfigForBackend(productType, rawConfig);

  // strip empty values
  const cleaned = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null && `${v}`.trim() !== '')
  );

  // helpful console
  // eslint-disable-next-line no-console
  console.log('=== CONFIGURATION API CALL (EditProduct) ===');
  // eslint-disable-next-line no-console
  console.log('Method:', method);
  // eslint-disable-next-line no-console
  console.log('URL:', url);
  // eslint-disable-next-line no-console
  console.log('Payload:', cleaned);
  // eslint-disable-next-line no-console
  console.log('===========================================');

  const res = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(cleaned)
  });

  if (!res.ok) {
    throw new Error('Failed to update configuration');
  }
  return res.json().catch(() => ({}));
};
