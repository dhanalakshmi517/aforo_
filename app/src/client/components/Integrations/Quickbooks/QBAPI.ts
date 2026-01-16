// QBAPI.ts - QuickBooks API functions

export interface QuickBooksConnectResponse {
  authUrl: string;
  image?: string;
  [key: string]: any;
}

/**
 * Connect to QuickBooks API
 * @returns Promise with authUrl and other response data
 */
export async function connectQuickBooks(): Promise<QuickBooksConnectResponse> {
  try {
    const response = await fetch('http://44.204.127.27:8095/api/quickbooks/connect', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error connecting to QuickBooks:', error);
    throw error;
  }
}