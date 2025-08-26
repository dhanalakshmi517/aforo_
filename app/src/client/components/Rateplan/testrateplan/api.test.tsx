// app/src/api/api.test.ts
// Adjust the import path below to where your API file lives.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { fetchBillableMetrics } from '../api';

// Mock axios with the methods we use in this module.
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('API Module - Test 1', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Test 1: fetchBillableMetrics (no productName) calls the base endpoint and returns data', async () => {
    const mockResponse = [
      { metricId: 1, metricName: 'API Calls' },
      { metricId: 2, metricName: 'Tokens' },
    ];

    (axios as any).get.mockResolvedValueOnce({ data: mockResponse } as any);

    const result = await fetchBillableMetrics();

    expect((axios as any).get).toHaveBeenCalledTimes(1);
    expect((axios as any).get).toHaveBeenCalledWith(
      'http://18.182.19.181:8081/api/billable-metrics'
    );
    expect(result).toEqual(mockResponse);
  });
});

// ---- Test 2 ----
describe('API Module - Test 2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Test 2: fetchBillableMetrics (with productName) builds query with encodeURIComponent and returns data', async () => {
    const productName = 'Rapido Pro / Alpha';
    const expectedUrl =
      'http://18.182.19.181:8081/api/billable-metrics?product=Rapido%20Pro%20%2F%20Alpha';

    const mockResponse = [
      { metricId: 10, metricName: 'Requests' },
      { metricId: 20, metricName: 'GB' },
    ];
    (axios as any).get.mockResolvedValueOnce({ data: mockResponse } as any);

    const result = await fetchBillableMetrics(productName);

    expect((axios as any).get).toHaveBeenCalledTimes(1);
    expect((axios as any).get).toHaveBeenCalledWith(expectedUrl);
    expect(result).toEqual(mockResponse);
  });
});

// ---- Test 3 ----
describe('API Module - Test 3', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Test 3: fetchRatePlans calls GET /rateplans and returns data', async () => {
    const mockResponse = [
      { ratePlanId: 1, ratePlanName: 'Basic', description: '', ratePlanType: 'FLAT', billingFrequency: 'MONTHLY', productId: 100 },
      { ratePlanId: 2, ratePlanName: 'Pro', description: '', ratePlanType: 'TIERED', billingFrequency: 'MONTHLY', productId: 101 },
    ];
    (axios as any).get.mockResolvedValueOnce({ data: mockResponse } as any);

    // dynamic import avoids changing the top import line
    const { fetchRatePlans } = await import('../api');
    const result = await fetchRatePlans();

    expect((axios as any).get).toHaveBeenCalledTimes(1);
    expect((axios as any).get).toHaveBeenCalledWith('http://54.238.204.246:8080/api/rateplans');
    expect(result).toEqual(mockResponse);
  });
});
  

// ---- Test 4 ----
describe('API Module - Test 4', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });
  
    it('Test 4: fetchProducts calls GET /products and returns data', async () => {
      const mockResponse = [
        {
          productId: 'p1',
          productName: 'Rapido API',
          productType: 'API',
          version: '1.0',
          productDescription: 'desc',
          tags: {},
          category: 'DEV',
          visibility: true,
          status: 'ACTIVE',
          internalSkuCode: 'SKU1',
          uom: 'transaction',
          effectiveStartDate: '2025-01-01',
          effectiveEndDate: null,
        },
      ];
      (axios as any).get.mockResolvedValueOnce({ data: mockResponse });
  
      const { fetchProducts } = await import('../api');
      const result = await fetchProducts();
  
      expect((axios as any).get).toHaveBeenCalledWith('http://54.238.204.246:8080/api/products');
      expect(result).toEqual(mockResponse);
    });
  });

  // ---- Test 5 ----
  describe('API Module - Test 5', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('Test 5: deleteRatePlan calls DELETE /rateplans/{id}', async () => {
      (axios as any).delete.mockResolvedValueOnce({ status: 204 } as any);

      const { deleteRatePlan } = await import('../api');
      await deleteRatePlan(123);

      expect((axios as any).delete).toHaveBeenCalledTimes(1);
      expect((axios as any).delete).toHaveBeenCalledWith('http://54.238.204.246:8080/api/rateplans/123');
    });
  });


  // ---- Test 6 ----
describe('API Module - Test 6', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 6: createRatePlan posts payload and returns created RatePlan (response.data)', async () => {
      const payload = {
        ratePlanName: 'Starter',
        productName: 'Rapido API',
        description: 'Starter plan',
        billingFrequency: 'MONTHLY',
        paymentType: 'POSTPAID',
        billableMetricId: 77,
      } as const;
  
      const created = {
        ratePlanId: 456,
        ratePlanName: 'Starter',
        description: 'Starter plan',
        ratePlanType: 'FLAT',
        billingFrequency: 'MONTHLY',
        productId: 999,
        status: 'DRAFT',
      };
  
      (axios as any).post.mockResolvedValueOnce({ data: created });
  
      const { createRatePlan } = await import('../api');
      const result = await createRatePlan(payload);
  
      expect((axios as any).post).toHaveBeenCalledWith(
        'http://54.238.204.246:8080/api/rateplans',
        payload
      );
      expect(result).toEqual(created);
    });
  });
  
  // ---- Test 7 ----
  // Intentionally checks canonical path; will fail if implementation uses a different (duplicated) path.
  describe('API Module - Test 7', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 7: confirmRatePlan posts to /rateplans/{id}/confirm', async () => {
      (axios as any).post.mockResolvedValueOnce({ status: 200 });
  
      const { confirmRatePlan } = await import('../api');
      await confirmRatePlan(456);
  
      expect((axios as any).post).toHaveBeenCalledWith(
        'http://54.238.204.246:8080/api/rateplans/456/confirm'
      );
    });
  });
  
  // ---- Test 8 ----
  describe('API Module - Test 8', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 8: saveVolumePricing posts to /rateplans/{id}/volume-pricing with payload', async () => {
      const payload = {
        tiers: [
          { usageStart: 0, usageEnd: 100, unitPrice: 1.5 },
          { usageStart: 101, usageEnd: null, unitPrice: 1.0 },
        ],
        overageUnitRate: 2.5,
        graceBuffer: 10,
      };
      (axios as any).post.mockResolvedValueOnce({ status: 201 });
  
      const { saveVolumePricing } = await import('../api');
      await saveVolumePricing(789, payload);
  
      expect((axios as any).post).toHaveBeenCalledWith(
        'http://54.238.204.246:8080/api/rateplans/789/volume-pricing',
        payload
      );
    });
  });
  
  // ---- Test 9 ----
  describe('API Module - Test 9', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 9: saveUsageBasedPricing logs payload, posts, and logs success', async () => {
      const payload = { perUnitAmount: 0.05 };
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      (axios as any).post.mockResolvedValueOnce({ status: 201, data: { ok: true } });
  
      const { saveUsageBasedPricing } = await import('../api');
      const res = await saveUsageBasedPricing(321, payload);
  
      expect(logSpy).toHaveBeenCalledWith('Usage-based pricing payload', payload);
      expect((axios as any).post).toHaveBeenCalledWith(
        'http://54.238.204.246:8080/api/rateplans/321/usagebased',
        payload
      );
      expect(logSpy).toHaveBeenCalledWith('Usage-based pricing saved', 201);
      expect(res.status).toBe(201);
  
      logSpy.mockRestore();
    });
  });
  
  // ---- Test 10 ----
  describe('API Module - Test 10', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 10: saveUsageBasedPricing propagates error and logs console.error', async () => {
      const payload = { perUnitAmount: 0.05 };
      const err = new Error('boom');
      (axios as any).post.mockRejectedValueOnce(err);
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
      const { saveUsageBasedPricing } = await import('../api');
  
      await expect(saveUsageBasedPricing(999, payload)).rejects.toThrow('boom');
      expect(errSpy).toHaveBeenCalledTimes(1);
      expect(errSpy.mock.calls[0][0]).toBe('Failed to save usage-based pricing');
      // 2nd arg is the error object
      expect(errSpy.mock.calls[0][1]).toBe(err);
  
      errSpy.mockRestore();
    });
  });
  
  // ---- Test 11 ----
  describe('API Module - Test 11', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 11: saveTieredPricing posts to /rateplans/{id}/tiered with payload', async () => {
      const payload = {
        tiers: [
          { startRange: 0, endRange: 10, unitPrice: 2 },
          { startRange: 11, endRange: null, unitPrice: 1.5 },
        ],
        overageUnitRate: 2.0,
        graceBuffer: 5,
      };
      (axios as any).post.mockResolvedValueOnce({ status: 201 });
  
      const { saveTieredPricing } = await import('../api');
      await saveTieredPricing(111, payload);
  
      expect((axios as any).post).toHaveBeenCalledWith(
        'http://54.238.204.246:8080/api/rateplans/111/tiered',
        payload
      );
    });
  });
  
  // ---- Test 12 ----
  describe('API Module - Test 12', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 12: saveStairStepPricing posts to /rateplans/{id}/stairstep with payload', async () => {
      const payload = {
        tiers: [
          { usageStart: 0, usageEnd: 50, flatCost: 100 },
          { usageStart: 51, usageEnd: null, flatCost: 150 },
        ],
        overageUnitRate: 3.5,
        graceBuffer: 8,
      };
      (axios as any).post.mockResolvedValueOnce({ status: 201 });
  
      const { saveStairStepPricing } = await import('../api');
      await saveStairStepPricing(222, payload);
  
      expect((axios as any).post).toHaveBeenCalledWith(
        'http://54.238.204.246:8080/api/rateplans/222/stairstep',
        payload
      );
    });
  });


  // ---- Test 23 ----
describe('API Module - Test 23', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 23: deleteRatePlan propagates error', async () => {
      (axios as any).delete.mockRejectedValueOnce(new Error('no perms'));
  
      const { deleteRatePlan } = await import('../api');
      await expect(deleteRatePlan(9999)).rejects.toThrow('no perms');
  
      expect((axios as any).delete).toHaveBeenCalledWith(
        'http://54.238.204.246:8080/api/rateplans/9999'
      );
    });
  });

  describe('API Module - Test 22', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 22: fetchProducts propagates error', async () => {
      (axios as any).get.mockRejectedValueOnce(new Error('timeout'));
  
      const { fetchProducts } = await import('../api');
      await expect(fetchProducts()).rejects.toThrow('timeout');
  
      expect((axios as any).get).toHaveBeenCalledWith('http://54.238.204.246:8080/api/products');
    });
  });


  describe('API Module - Test 21', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 21: fetchRatePlans propagates error', async () => {
      (axios as any).get.mockRejectedValueOnce(new Error('server down'));
  
      const { fetchRatePlans } = await import('../api');
      await expect(fetchRatePlans()).rejects.toThrow('server down');
  
      expect((axios as any).get).toHaveBeenCalledWith('http://54.238.204.246:8080/api/rateplans');
    });
  });
  

  // ---- Test 14 ----
describe('API Module - Test 14', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 14: saveFlatFeePricing logs, posts to /flatfee, logs success, and returns response', async () => {
      const payload = {
        flatFeeAmount: 1000,
        numberOfApiCalls: 10000,
        overageUnitRate: 0.5,
        graceBuffer: 25,
      };
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      (axios as any).post.mockResolvedValueOnce({ status: 201, data: { ok: true } });
  
      const { saveFlatFeePricing } = await import('../api');
      const res = await saveFlatFeePricing(456, payload);
  
      expect(logSpy).toHaveBeenCalledWith('Flat-fee pricing payload', payload);
      expect((axios as any).post).toHaveBeenCalledWith(
        'http://54.238.204.246:8080/api/rateplans/456/flatfee',
        payload
      );
      expect(logSpy).toHaveBeenCalledWith('Flat-fee pricing saved', 201);
      expect(res.status).toBe(201);
  
      logSpy.mockRestore();
    });
  });
  
  // ---- Test 15 ----
  describe('API Module - Test 15', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 15: saveFlatFeePricing logs error and rethrows when request fails', async () => {
      const payload = {
        flatFeeAmount: 1000,
        numberOfApiCalls: 10000,
        overageUnitRate: 0.5,
        graceBuffer: 25,
      };
      const err = new Error('boom');
      (axios as any).post.mockRejectedValueOnce(err);
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
      const { saveFlatFeePricing } = await import('../api');
  
      await expect(saveFlatFeePricing(456, payload)).rejects.toThrow('boom');
      expect(errSpy).toHaveBeenCalledTimes(1);
      expect(errSpy.mock.calls[0][0]).toBe('Failed to save flat-fee pricing');
      expect(errSpy.mock.calls[0][1]).toBe(err);
  
      errSpy.mockRestore();
    });
  });
  
  // ---- Test 16 ----
  describe('API Module - Test 16', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 16: saveMinimumCommitment posts to /minimumcommitments with payload', async () => {
      const payload = { minimumUsage: 1000, minimumCharge: 2999 };
      (axios as any).post.mockResolvedValueOnce({ status: 201 });
  
      const { saveMinimumCommitment } = await import('../api');
      await saveMinimumCommitment(123, payload);
  
      expect((axios as any).post).toHaveBeenCalledWith(
        'http://54.238.204.246:8080/api/rateplans/123/minimumcommitments',
        payload
      );
    });
  });
  
  // ---- Test 17 ----
  describe('API Module - Test 17', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 17: saveSetupFee posts to /setupfees with payload', async () => {
      const payload = {
        setupFee: 199,
        applicationTiming: 0,
        invoiceDescription: 'One-time setup',
      };
      (axios as any).post.mockResolvedValueOnce({ status: 201 });
  
      const { saveSetupFee } = await import('../api');
      await saveSetupFee(321, payload);
  
      expect((axios as any).post).toHaveBeenCalledWith(
        'http://54.238.204.246:8080/api/rateplans/321/setupfees',
        payload
      );
    });
  });
  
  // ---- Test 18 ----
  describe('API Module - Test 18', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 18: saveDiscounts posts to /discounts with payload', async () => {
      const payload = {
        discountType: 'PERCENTAGE',
        percentageDiscount: 15,
        flatDiscountAmount: 0,
        eligibility: 'NEW_CUSTOMER',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      } as const;
      (axios as any).post.mockResolvedValueOnce({ status: 201 });
  
      const { saveDiscounts } = await import('../api');
      await saveDiscounts(654, payload);
  
      expect((axios as any).post).toHaveBeenCalledWith(
        'http://54.238.204.246:8080/api/rateplans/654/discounts',
        payload
      );
    });
  });
  
  // ---- Test 19 ----
  describe('API Module - Test 19', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 19: saveFreemiums posts to /freemiums with payload', async () => {
      const payload = {
        freemiumType: 'FREE_TRIAL',
        freeUnits: 0,
        freeTrialDuration: 14,
        startDate: '2025-02-01',
        endDate: '2025-02-15',
      } as const;
      (axios as any).post.mockResolvedValueOnce({ status: 201 });
  
      const { saveFreemiums } = await import('../api');
      await saveFreemiums(987, payload);
  
      expect((axios as any).post).toHaveBeenCalledWith(
        'http://54.238.204.246:8080/api/rateplans/987/freemiums',
        payload
      );
    });
  });
  
  // ---- Test 20 ----
  describe('API Module - Test 20', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 20: fetchBillableMetrics propagates error', async () => {
      (axios as any).get.mockRejectedValueOnce(new Error('fail'));
  
      const { fetchBillableMetrics } = await import('../api');
      await expect(fetchBillableMetrics()).rejects.toThrow('fail');
  
      expect((axios as any).get).toHaveBeenCalledTimes(1);
    });
  });
  

  describe('API Module - Test 13', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });
  
    it('Test 13: confirmRatePlan should POST to /rateplans/{id}/confirm and propagate error', async () => {
      (axios as any).post.mockRejectedValueOnce(new Error('network'));
  
      const { confirmRatePlan } = await import('../api');
  
      await expect(confirmRatePlan(777)).rejects.toThrow('network');
      // canonical URL expectation (will fail until you fix the implementation)
      expect((axios as any).post).toHaveBeenCalledWith(
        'http://54.238.204.246:8080/api/rateplans/777/confirm'
      );
    });
  });