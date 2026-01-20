# Rate Plan Extras Compatibility Matrix

## Overview
This document outlines which **Extras** (Setup Fee, Discounts, Freemium, Minimum Commitment) are compatible with each **Pricing Model** in the Eswar Company billing platform.

---

## 📊 Compatibility Table

| Extra Feature | Flat Fee | Usage-Based | Tiered Pricing | Volume-Based | Stairstep |
|--------------|----------|-------------|----------------|--------------|-----------|
| **Setup Fee** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Discounts** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Freemium** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Minimum Commitment** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

### ✅ **All Extras Work with All Pricing Models**

---

## 📝 Detailed Breakdown

### 1. **Setup Fee**
- **Applies to**: All pricing models
- **How it works**: One-time charge added to the first invoice
- **Fields**:
  - Setup Fee Amount
  - Application Timing (Immediate/Deferred)
  - Invoice Description
- **Revenue Estimation**: Included in first invoice calculation

**Example**:
- Flat Fee $99/month + $500 setup fee = **$599 first invoice**, then $99/month

---

### 2. **Discounts**
- **Applies to**: All pricing models
- **Types**:
  - **Percentage Discount** (e.g., 10% off)
  - **Flat Discount** (e.g., $50 off)
- **Fields**:
  - Discount Type (Percentage/Flat)
  - Discount Amount
  - Eligibility
  - Start Date / End Date
- **Revenue Estimation**: Applied to subtotal (base amount + setup fee) before minimum commitment

**Example**:
- Usage-Based $0.01/call × 10,000 calls = $100
- 10% discount = **$90 total**

---

### 3. **Freemium**
- **Applies to**: All pricing models
- **Types**:
  - **Free Units** - Specific number of free units per billing period
  - **Free Trial Duration** - Time-based trial (e.g., 14 days)
  - **Free Units Per Duration** - Combination of both
- **Fields**:
  - Freemium Type
  - Free Units (for Free Units/Free Units Per Duration)
  - Free Trial Duration (for Free Trial/Free Units Per Duration)
  - Start Date / End Date
- **Revenue Estimation**: 
  - **Usage-Based/Tiered/Volume**: Deducts free units from total usage before charging
  - **Flat Fee**: Deducts free units from overage charges only
  - **Stairstep**: Deducts free units from usage calculation

**Example - Usage-Based**:
- 10,000 calls × $0.01 = $100
- 1,000 free units
- Billable: (10,000 - 1,000) × $0.01 = **$90**

**Example - Flat Fee**:
- Flat fee $99 for 5,000 calls
- Actual usage: 7,000 calls
- Overage: 2,000 calls × $0.02 = $40
- 500 free units applied to overage
- Billable overage: (2,000 - 500) × $0.02 = $30
- **Total: $99 + $30 = $129**

---

### 4. **Minimum Commitment**
- **Applies to**: All pricing models
- **How it works**: Ensures customer pays at least a minimum amount per billing period
- **Fields**:
  - Minimum Usage (units)
  - Minimum Charge (dollars)
- **Revenue Estimation**: Applied AFTER discounts, ensures total ≥ minimum charge

**Example**:
- Usage-Based: 100 calls × $0.01 = $1
- Minimum commitment: $50
- **Billed amount: $50** (minimum enforced)

---

## 🔄 Revenue Calculation Order

The extras are applied in the following order during revenue estimation:

```
1. Base Amount (from pricing model)
   ↓
2. + Setup Fee (if applicable)
   ↓
3. Subtotal = Base + Setup
   ↓
4. - Freemium Savings (free units deducted)
   ↓
5. - Discount (percentage or flat)
   ↓
6. Before Minimum = Subtotal - Freemium - Discount
   ↓
7. Apply Minimum Commitment (if total < minimum, set to minimum)
   ↓
8. FINAL TOTAL
```

---

## 💡 Key Implementation Notes

### From `EstimateRevenue.tsx`:
- All extras have **toggle switches** in the revenue estimator
- Users can enable/disable each extra to see impact on calculations
- Revenue estimation supports both **frontend** and **backend** calculations
- Freemium is automatically enabled when free units are saved

### From `Extras.tsx`:
- All extras are **optional** - users can expand/collapse each section
- Extras are saved independently via separate API calls:
  - `saveSetupFee()`
  - `saveDiscounts()`
  - `saveFreemiums()`
  - `saveMinimumCommitment()`
- Session storage tracks all extras for persistence across navigation
- Draft functionality preserves all extras data

### Pricing Model Files:
- **No conditional logic** restricts extras based on pricing model
- All pricing models (`Pricing.tsx`, `FlatFee.tsx`, `UsageBased.tsx`, `Tiered.tsx`, `Volume.tsx`, `Stairstep.tsx`) work with all extras
- Revenue estimation adapts calculation based on selected pricing model

---

## 🧪 Testing Recommendations

### Test Scenarios for Each Pricing Model:

1. **Setup Fee**
   - ✅ First invoice includes setup fee
   - ✅ Subsequent invoices exclude setup fee
   - ✅ Setup fee + discount calculation correct

2. **Discounts**
   - ✅ Percentage discount applies to subtotal
   - ✅ Flat discount deducted correctly
   - ✅ Discount respects start/end dates

3. **Freemium**
   - ✅ Free units reduce billable usage
   - ✅ Free trial prevents charges during trial period
   - ✅ Freemium + discount combination works
   - ✅ Freemium savings calculated correctly for each pricing model

4. **Minimum Commitment**
   - ✅ Minimum enforced when usage is low
   - ✅ Minimum not applied when usage exceeds threshold
   - ✅ Minimum + discount interaction correct

5. **Combined Extras**
   - ✅ All 4 extras enabled simultaneously
   - ✅ Calculation order respected
   - ✅ Edge cases (zero usage, negative amounts, etc.)

---

## 📋 Summary

**All extras are universally compatible with all pricing models.** The system is designed to be flexible, allowing any combination of:
- Setup Fee
- Discounts (Percentage or Flat)
- Freemium (Free Units, Free Trial, or Both)
- Minimum Commitment

This provides maximum flexibility for creating diverse pricing strategies for Eswar Company's customers.

---

**Document Version**: 1.0  
**Created**: 2026-01-19  
**Component**: `app/src/client/components/Rateplan/`  
**Key Files**: `Extras.tsx`, `Revenue/EstimateRevenue.tsx`, `Pricing.tsx`
