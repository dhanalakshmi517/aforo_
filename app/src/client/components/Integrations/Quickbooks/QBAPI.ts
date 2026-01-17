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

export interface CustomerOverviewResponse {
  synced_customers: number;
  non_synced_customers: number;
  [key: string]: any;
}

export interface QuickBooksDisconnectResponse {
  message: string;
  success: boolean;
  [key: string]: any;
}

export interface BulkSyncResponse {
  message: string;
  success: boolean;
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

/**
 * Get customer overview from QuickBooks admin
 * @returns Promise with synced and non-synced customer counts
 */
export async function getCustomerOverview(): Promise<CustomerOverviewResponse> {
  try {
    const response = await fetch('http://44.204.127.27:8095/api/quickbooks/admin/customer-overview', {
      method: 'GET',
      headers: getAuthHeadersJSON(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting customer overview:', error);
    throw error;
  }
}

/**
 * Disconnect QuickBooks integration
 * @returns Promise with disconnect response
 */
export const disconnectQuickBooks = async (): Promise<QuickBooksDisconnectResponse> => {
  try {
    const response = await fetch('http://44.204.127.27:8095/api/quickbooks/disconnect', {
      method: 'POST',
      headers: getAuthHeadersJSON(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error disconnecting QuickBooks:', error);
    throw error;
  }
};

export const getCustomerOverviewForDisplay = async () => {
  try {
    console.log('Calling getCustomerOverview API...');
    const response = await fetch('http://44.204.127.27:8095/api/quickbooks/admin/customer-overview', {
      method: 'GET',
      headers: getAuthHeadersJSON(),
    });
    const data = await response.json();
    console.log('Customer overview API response:', data);
    
    // Store customer data in localStorage for QuickbooksIntegration to use
    const customerData = {
      synced_customers: data.syncedToQuickBooks || 0,
      non_synced_customers: data.notSyncedToQuickBooks || 0
    };
    
    localStorage.setItem('customerData', JSON.stringify(customerData));
    
    return customerData;
  } catch (error) {
    console.error('Failed to get customer overview:', error);
    throw error;
  }
};

/**
 * Bulk sync customers to QuickBooks
 * @returns Promise with bulk sync response
 */
export const bulkSyncCustomers = async (): Promise<BulkSyncResponse> => {
  try {
    console.log('Calling bulk sync customers API...');
    const response = await fetch('http://44.204.127.27:8095/api/quickbooks/admin/bulk-sync-customers', {
      method: 'POST',
      headers: getAuthHeadersJSON(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Bulk sync API response:', data);
    return data;
  } catch (error) {
    console.error('Error bulk syncing customers:', error);
    throw error;
  }
};