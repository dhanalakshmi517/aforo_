// QBAPI.ts - QuickBooks API functions

import { getAuthHeadersJSON } from '../../../utils/auth';

export interface QuickBooksConnectResponse {
  authUrl: string;
  image?: string;
  [key: string]: any;
}

export interface QuickBooksStatusResponse {
  status: boolean;
  [key: string]: any;
}


export async function connectQuickBooks(): Promise<QuickBooksConnectResponse> {
  try {
    const response = await fetch('http://44.204.127.27:8095/api/quickbooks/connect', {
      method: 'GET',
      headers: getAuthHeadersJSON(),
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

/**
 * Check QuickBooks connection status
 * @returns Promise with status boolean and other response data
 */
export async function checkQuickBooksStatus(): Promise<QuickBooksStatusResponse> {
  try {
    const response = await fetch('http://44.204.127.27:8095/api/quickbooks/status', {
      method: 'GET',
      headers: getAuthHeadersJSON(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking QuickBooks status:', error);
    throw error;
  }
}