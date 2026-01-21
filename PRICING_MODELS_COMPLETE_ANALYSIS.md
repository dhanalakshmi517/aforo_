# Complete Pricing Models Analysis - Revenue Estimators

## 📋 Three Tier-Based Pricing Models

### **1. TIERED PRICING** (Progressive Per-Tier Rates)
**Concept**: Each block/tier of units is charged at that tier's specific rate.

#### Without Overage:
**Setup**: 
- Tier 1: 0-100 @ $0.10/unit
- Tier 2: 101-200 @ $0.08/unit
- Usage: 150 units

**Calculation**:
```
Tier 1 units: 100 × $0.10 = $10.00
Tier 2 units: 50 × $0.08 = $4.00
Total = $14.00
```

#### With Overage:
**Setup**:
- Tier 1: 0-100 @ $0.10/unit
- Tier 2: 101-200 @ $0.08/unit
- Overage: $0.12/unit
- Usage: 250 units

**Calculation**:
```
Tier 1 units: 100 × $0.10 = $10.00
Tier 2 units: 100 × $0.08 = $8.00
Overage units: 50 × $0.12 = $6.00
Total = $24.00
```

**Formula**: `SUM(unitsInTier[i] × tierRate[i]) + (overageUnits × overageRate)`

---

### **2. VOLUME-BASED PRICING** (All Units at Reached Tier Rate)
**Concept**: ALL units are charged at the rate of the tier your total usage reaches.

#### Without Overage:
**Setup**:
- Tier 1: 0-100 @ $0.10/unit
- Tier 2: 101-200 @ $0.08/unit
- Usage: 150 units

**Calculation**:
```
All units at Tier 2 rate: 150 × $0.08 = $12.00
Total = $12.00
```

#### With Overage:
**Setup**:
- Tier 1: 0-100 @ $0.10/unit
- Tier 2: 101-200 @ $0.08/unit
- Overage: $0.12/unit
- Usage: 250 units

**Calculation**:
```
Units within tiers at highest tier rate: 200 × $0.08 = $16.00
Overage units: 50 × $0.12 = $6.00
Total = $22.00
```

**Formula**: `(allUnitsInTiers × highestTierRate) + (overageUnits × overageRate)`

---

### **3. STAIRSTEP PRICING** (Flat Cost per Range)
**Concept**: Flat fee for the range your usage falls within.

#### Without Overage:
**Setup**:
- Stair 1: 0-100 costs $8
- Stair 2: 101-200 costs $14
- Usage: 150 units

**Calculation**:
```
Stair 2 flat cost = $14.00
Total = $14.00
```

#### With Overage:
**Setup**:
- Stair 1: 0-100 costs $8
- Stair 2: 101-200 costs $14
- Overage: $0.15/unit
- Usage: 250 units

**Calculation**:
```
Highest stair flat cost = $14.00
Overage units: 50 × $0.15 = $7.50
Total = $21.50
```

**Formula**: `highestStairFlatCost + (overageUnits × overageRate)`

---

## 🧪 Test Matrix

### Scenario A: Within Tiers (No Overage)
| Model | Usage | Tier 1 (0-100) | Tier 2 (101-200) | Expected Total |
|-------|-------|----------------|------------------|----------------|
| Tiered | 150 | $0.10/unit | $0.08/unit | $14.00 |
| Volume | 150 | $0.10/unit | $0.08/unit | $12.00 |
| Stairstep | 150 | $8 flat | $14 flat | $14.00 |

### Scenario B: With Overage
| Model | Usage | Last Tier | Overage Rate | Base Charge | Overage Charge | Total |
|-------|-------|-----------|--------------|-------------|----------------|-------|
| Tiered | 250 | 101-200 @ $0.08 | $0.12/unit | $18.00 | $6.00 | $24.00 |
| Volume | 250 | 101-200 @ $0.08 | $0.12/unit | $16.00 | $6.00 | $22.00 |
| Stairstep | 250 | 101-200 costs $14 | $0.15/unit | $14.00 | $7.50 | $21.50 |

---

## ✅ Current Implementation Verification

### **Tiered Pricing** (`TieredEstimation.tsx`)
```typescript
// Progressive tier charging with processedUnits tracker
let processedUnits = 0;
for (const tier of tiers) {
  const tierEnd = tier.usageEnd === null ? Infinity : tier.usageEnd;
  const unitsInTier = Math.max(0, Math.min(tierEnd, units) - processedUnits);
  
  if (unitsInTier > 0) {
    total += unitsInTier * tier.pricePerUnit;
    processedUnits += unitsInTier;
  }
}

// Overage calculation
const isOver = lastTierEnd !== null && effectiveUsage > lastTierEnd;
const overCharge = isOver ? (effectiveUsage - lastTierEnd) * overageRate : 0;

// Final total
subtotal = tieredCharge + overCharge + setupFee - freemium;
```
**Status**: ✅ CORRECT

---

### **Volume-Based Pricing** (`VolumeEstimation.tsx`)
```typescript
if (matchedTier) {
  // ALL units at matched tier rate
  tierCharge = effectiveUsage * matchedTier.pricePerUnit;
} else if (isOver) {
  // Units within tiers at highest tier rate
  tierCharge = lastTierEnd * highestTier.pricePerUnit;
  // ONLY excess at overage
  overCharge = (effectiveUsage - lastTierEnd) * overageRate;
}

// Final total
subtotal = tierCharge + overCharge + setupFee - freemium;
```
**Status**: ✅ CORRECT

---

### **Stairstep Pricing** (`StairEstimation.tsx`)
```typescript
// Find matching stair
const matchedStair = stairs.find((stair) => {
  return effectiveUsage >= from && (to === MAX || effectiveUsage <= to);
});

// Overage handling
const isOverage = highestStair && effectiveUsage > highestStair.max;
const overageAmount = isOverage ? (effectiveUsage - highestStair.max) * overageRate : 0;

// CRITICAL: Charge highest stair even in overage
const stairCharge = isOverage && highestStair 
  ? highestStair.amount  // Highest stair flat cost
  : matchedStair ? matchedStair.amount : 0;

// Final total
subtotal = stairCharge + overageAmount + setupFee - freemium;
```
**Status**: ✅ CORRECT (after latest fix)

---

## 📊 Extras Handling (All Models)

### Calculation Order:
1. **Base Charge** = Tier/Volume/Stair charge
2. **+ Setup Fee** (if enabled)
3. **- Freemium** (if enabled)
4. **= Subtotal**
5. **- Discount** (percentage of subtotal OR flat amount)
6. **= After Discount**
7. **Apply Minimum Charge** (if enabled): `Max(afterDiscount, minimumCharge)`

### Example with All Extras:
```
Tiered Pricing: 150 units
Tier 1 (0-100 @ $0.10) = $10
Tier 2 (101-200 @ $0.08) = $4
Base charge = $14

+ Setup Fee = $50
- Freemium (20 units @ $0.10) = $2
= Subtotal = $62

- Discount (10% of $62) = $6.20
= After Discount = $55.80

Minimum Charge ($10) - Already exceeded
= Final Total = $55.80
```

---

## 🎯 Summary

### Tiered Pricing:
- **Without Overage**: Progressive per-tier charging
- **With Overage**: Progressive tiers + overage for excess
- **Formula**: `Σ(tierUnits × tierRate) + (overageUnits × overageRate)`

### Volume-Based Pricing:
- **Without Overage**: All units at matched tier rate
- **With Overage**: All tier units at highest rate + overage for excess
- **Formula**: `(tierUnits × highestTierRate) + (overageUnits × overageRate)`

### Stairstep Pricing:
- **Without Overage**: Flat cost for matched stair
- **With Overage**: Highest stair flat cost + overage for excess
- **Formula**: `highestStairCost + (overageUnits × overageRate)`

**All three models now handle overage correctly!** ✅
