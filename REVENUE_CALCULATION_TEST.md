# Revenue Estimation Calculation Test Cases

## Industry Standards Reference

### **Tiered Pricing (Per-Tier Rates)**
- **Units in each tier** charged at that **tier's rate**
- **Example**: 100 units with Tier 1 (0-50 @ $10), Tier 2 (51-100 @ $8)
  - Charge = (50 × $10) + (50 × $8) = $500 + $400 = **$900**

### **Volume-Based Pricing (All Units Same Rate)**
- **ALL units** charged at the **rate of tier reached**
- **Example**: 100 units with Tier 1 (0-50 @ $10), Tier 2 (51-100 @ $8)
  - Charge = 100 × $8 = **$800** (all units at Tier 2 rate)

### **Stairstep Pricing (Flat Cost)**
- **Flat cost** for the **range usage falls in**
- **Example**: 100 units with Stair 1 (0-50 costs $400), Stair 2 (51-100 costs $700)
  - Charge = **$700** (flat cost for Stair 2 range)

---

## Test Scenarios

### **Scenario 1: Within Tiers (No Overage)**

#### Setup:
- **Tiered**: Tier 1 (0-100 @ $0.10), Tier 2 (101-200 @ $0.08)
- **Volume**: Tier 1 (0-100 @ $0.10), Tier 2 (101-200 @ $0.08)
- **Stairstep**: Stair 1 (0-100 costs $8), Stair 2 (101-200 costs $14)
- **Usage**: 150 units

#### Expected Results:
- **Tiered**: (100 × $0.10) + (50 × $0.08) = $10 + $4 = **$14.00**
- **Volume**: 150 × $0.08 = **$12.00** (all units at Tier 2 rate)
- **Stairstep**: **$14.00** (flat cost for Stair 2)

---

### **Scenario 2: With Overage**

#### Setup:
- **Tiered**: Tier 1 (0-100 @ $0.10), Tier 2 (101-200 @ $0.08), Overage @ $0.12
- **Volume**: Tier 1 (0-100 @ $0.10), Tier 2 (101-200 @ $0.08), Overage @ $0.12
- **Stairstep**: Stair 1 (0-100 costs $8), Stair 2 (101-200 costs $14), Overage @ $0.15
- **Usage**: 250 units

#### Expected Results:
- **Tiered**: 
  - Tier charges: (100 × $0.10) + (100 × $0.08) = $10 + $8 = $18
  - Overage: 50 × $0.12 = $6
  - **Total = $24.00**

- **Volume**: 
  - Tier charges: 200 × $0.08 = $16 (all tier units at highest tier rate)
  - Overage: 50 × $0.12 = $6
  - **Total = $22.00**

- **Stairstep**: 
  - Stair charge: $14 (flat cost for highest stair)
  - Overage: 50 × $0.15 = $7.50
  - **Total = $21.50**

---

### **Scenario 3: With All Extras**

#### Setup (Using Tiered):
- Tiers: Tier 1 (0-100 @ $0.10), Tier 2 (101-200 @ $0.08)
- Usage: 150 units
- Setup Fee: $50
- Discount: 10%
- Freemium: 20 units @ $0.10 = $2
- Minimum Commitment: 100 units, $10 minimum charge

#### Expected Calculation:
1. **Tier charges**: (100 × $0.10) + (50 × $0.08) = $14.00
2. **Setup fee**: +$50.00
3. **Freemium**: -$2.00
4. **Subtotal**: $14 + $50 - $2 = $62.00
5. **Discount**: 10% of $62 = -$6.20
6. **After discount**: $62 - $6.20 = $55.80
7. **Minimum check**: Max($55.80, $10) = $55.80
8. **Final Total**: **$55.80**

---

## Current Implementation Status

### ✅ Tiered Pricing
- Progressive unit tracking with `processedUnits` counter
- Each tier charges only units falling in its range
- Overage charges excess units beyond last tier

### ✅ Volume-Based Pricing
- ALL units charged at matched tier rate
- Overage: tier units at highest tier rate + excess at overage rate
- No progressive calculation

### ✅ Stairstep Pricing
- Finds tier where usage falls within from-to range
- Flat cost for matched tier
- Overage charges excess units beyond last tier
- Freemium proportional to stair charge

### ✅ All Models - Extras
- Setup Fee: Added to subtotal
- Discounts: Percentage or flat, applied to subtotal
- Freemium: Reduces charges (per-unit or proportional)
- Minimum Commitment: Both minimum usage and minimum charge enforced

---

## Validation Checklist

- [ ] Tiered: 150 units with 2 tiers = correct progressive charge
- [ ] Tiered: 250 units with overage = correct tier + overage split
- [ ] Volume: 150 units with 2 tiers = all units at Tier 2 rate
- [ ] Volume: 250 units with overage = tier units + overage units
- [ ] Stairstep: 150 units = correct flat cost for Stair 2
- [ ] Stairstep: 250 units with overage = flat cost + overage charge
- [ ] All models: Extras calculated correctly
- [ ] All models: Display formulas match calculations
