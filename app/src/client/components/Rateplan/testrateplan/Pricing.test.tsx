/// <reference types="vitest" />
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import * as api from '../api';


import Pricing, { PricingHandle } from '../Pricing';

// -------------------- Child component mocks --------------------
vi.mock('../FlatFeeForm', () => ({
  default: ({ data, onChange }: any) => (
    <div data-testid="flatfee-form" data-hasdata={!!data} />
  ),
}));
vi.mock('../Tiered', () => ({
  default: () => <div data-testid="tiered-form" />,
}));
vi.mock('../StairStep', () => ({
  default: () => <div data-testid="stairstep-form" />,
}));
vi.mock('../UsageBased', () => ({
  default: ({ onChange }: any) => (
    <button
      data-testid="set-usagebased"
      onClick={() => onChange({ perUnitAmount: 42 })}
    >
      set usage
    </button>
  ),
}));
vi.mock('../Volume', () => ({
  default: (props: any) => <div data-testid="volume-form" />,
}));

// -------------------- API mocks --------------------
vi.mock('../api', () => ({
  saveFlatFeePricing: vi.fn(),
  saveUsageBasedPricing: vi.fn(),
  saveVolumePricing: vi.fn(),
  saveTieredPricing: vi.fn(),
  saveStairStepPricing: vi.fn(),
}));

// -------------------- Global alert stub --------------------
// Use a single stub for all tests to avoid issues with spying on native bound functions
const alertSpy = vi.fn();
beforeAll(() => {
  globalThis.alert = alertSpy;
});
beforeEach(() => {
  alertSpy.mockClear();
});

// ===================================================================
//                            Test 1
// ===================================================================
describe('Pricing - Test 1', () => {
  it('Test 1: save() returns false and alerts when ratePlanId is null', async () => {
    const ref = React.createRef<PricingHandle>();

    render(<Pricing ref={ref} ratePlanId={null} />);

    expect(ref.current).toBeTruthy();

    const result = await ref.current!.save();

    expect(result).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith('Rate plan not yet created');
  });
});

// ===================================================================
//                            Test 2
// ===================================================================
describe('Pricing - Test 2', () => {
  it('Test 2: save() returns false and alerts when no pricing model is selected', async () => {
    const ref = React.createRef<PricingHandle>();

    // Valid ratePlanId, but user hasn't selected any pricing model
    render(<Pricing ref={ref} ratePlanId={123} />);

    expect(ref.current).toBeTruthy();

    const result = await ref.current!.save();

    expect(result).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith('Please select a pricing model.');
  });
});

// ---- Test 3 ----
describe('Pricing - Test 3', () => {
    it('Test 3: Flat Fee – invalid fields cause alert and return false', async () => {
      const ref = React.createRef<PricingHandle>();
      const { getByRole } = render(<Pricing ref={ref} ratePlanId={123} />);
  
      // Select "Flat Fee" in the dropdown
      const select = getByRole('combobox') as HTMLSelectElement;
      // Pricing component uses exact string "Flat Fee"
      fireEvent.change(select, { target: { value: 'Flat Fee' } });
  
      // With default zeros in flatFee state, validation should fail
      const result = await ref.current!.save();
  
      expect(result).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(
        'Please complete all flat-fee fields before saving.'
      );
    });
  });


  // ---- Test 4 ----


describe('Pricing - Test 4', () => {
  it('Test 4: Flat Fee – valid fields should call saveFlatFeePricing and return true', async () => {
    (api.saveFlatFeePricing as any).mockResolvedValueOnce({}); // stub success

    const ref = React.createRef<PricingHandle>();
    const { getByRole } = render(<Pricing ref={ref} ratePlanId={456} />);

    // Select "Flat Fee"
    const select = getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'Flat Fee' } });

    // Provide valid flatFee values using exposed setter
    await act(async () => {
      ref.current!.setFlatFee({
        flatFeeAmount: 100,
        numberOfApiCalls: 1000,
        overageUnitRate: 5,
        graceBuffer: 10,
      });
    });

    const result = await ref.current!.save();

    expect(result).toBe(true);
    expect(api.saveFlatFeePricing).toHaveBeenCalledWith(456, {
      flatFeeAmount: 100,
      numberOfApiCalls: 1000,
      overageUnitRate: 5,
      graceBuffer: 10,
    });
    expect(alertSpy).toHaveBeenCalledWith('Flat-fee pricing saved');
  });
});


// ---- Test 6 ----

describe('Pricing - Test 6', () => {
  it('Test 6: Usage-Based – valid perUnitAmount should call saveUsageBasedPricing and return true', async () => {
    vi.spyOn(api, 'saveUsageBasedPricing').mockResolvedValueOnce({} as any);

    const ref = React.createRef<PricingHandle>();
    const { getByRole, getByTestId } = render(<Pricing ref={ref} ratePlanId={101} />);

    // Select "Usage-Based"
    const select = getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'Usage-Based' } });

    // Trigger our mocked UsageBased component to set perUnitAmount
    fireEvent.click(getByTestId('set-usagebased'));

    const result = await ref.current!.save();

    expect(result).toBe(true);
    expect(api.saveUsageBasedPricing).toHaveBeenCalledWith(101, { perUnitAmount: 42 });
    expect(alertSpy).toHaveBeenCalledWith('Usage-based pricing saved');
  });
});


// ---- Test 7 ----

describe('Pricing - Test 7', () => {
  it('Test 7: Volume-Based – no valid tiers should alert and return false', async () => {
    const ref = React.createRef<PricingHandle>();
    const { getByRole } = render(<Pricing ref={ref} ratePlanId={202} />);

    // Select "Volume-Based"
    const select = getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'Volume-Based' } });

    // Default internal tiers = [{from:0,to:0,price:0}] -> filtered validTiers = []
    const result = await ref.current!.save();

    expect(result).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith('Please enter at least one usage tier.');
  });
});

// Replace previous Volume mock with this interactive one:
vi.mock('../Volume', () => ({
    default: (props: any) => (
      <div data-testid="volume-form">
        {/* Makes the first tier valid by setting price > 0 */}
        <button
          data-testid="volume-set-valid-tier"
          onClick={() => props.onChange(0, 'price', '5')}
        >
          set-tier
        </button>
  
        {/* Optional helpers for other tests */}
        <button
          data-testid="volume-set-no-upper"
          onClick={() => props.setNoUpperLimit(true)}
        >
          set-no-upper
        </button>
        <button
          data-testid="volume-set-overage"
          onClick={() => props.setOverageUnitRate(9)}
        >
          set-overage
        </button>
      </div>
    ),
  }));

  

  // ---- Test 9 ----


describe('Pricing - Test 9', () => {
  it('Test 9: Volume-Based – valid tiers and overage should call saveVolumePricing and return true', async () => {
    vi.spyOn(api, 'saveVolumePricing').mockResolvedValueOnce({} as any);

    const ref = React.createRef<PricingHandle>();
    const { getByRole, getByTestId } = render(<Pricing ref={ref} ratePlanId={404} />);

    // Select "Volume-Based"
    const select = getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'Volume-Based' } });

    // Make first tier valid (price > 0)
    fireEvent.click(getByTestId('volume-set-valid-tier'));

    // Set overage rate since noUpperLimit=false by default
    fireEvent.click(getByTestId('volume-set-overage'));

    const result = await ref.current!.save();

    expect(result).toBe(true);
    expect(api.saveVolumePricing).toHaveBeenCalledWith(404, {
      tiers: [
        {
          usageStart: 0,      // default 'from'
          usageEnd: null,     // default 'to' is 0 -> becomes null by implementation
          unitPrice: 5,       // set by mock button
        },
      ],
      overageUnitRate: 9,    // set by mock button
      graceBuffer: 0,        // default is fine
    });
    expect(alertSpy).toHaveBeenCalledWith('Volume-based pricing saved');
  });
});


// ---- Test 10 ----

describe('Pricing - Test 10', () => {
  it('Test 10: Tiered – no tiers should alert and return false', async () => {
    // Ensure no stored tiers/values
    localStorage.removeItem('tieredTiers');
    localStorage.removeItem('tieredOverage');
    localStorage.removeItem('tieredGrace');

    const ref = React.createRef<PricingHandle>();
    const { getByRole } = render(<Pricing ref={ref} ratePlanId={505} />);

    // Select "Tiered Pricing"
    const select = getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'Tiered Pricing' } });

    const result = await ref.current!.save();

    expect(result).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith('Please enter at least one tier.');
  });
});


// ---- Test 11 ----

describe('Pricing - Test 11', () => {
  it('Test 11: Tiered – missing overage when no unlimited tier should alert and return false', async () => {
    // Set one valid tier, but no unlimited, and no overage set
    localStorage.setItem(
      'tieredTiers',
      JSON.stringify([{ from: '0', to: '10', price: '5', isUnlimited: false }])
    );
    localStorage.removeItem('tieredOverage');
    localStorage.removeItem('tieredGrace');

    const ref = React.createRef<PricingHandle>();
    const { getByRole } = render(<Pricing ref={ref} ratePlanId={606} />);

    // Select "Tiered Pricing"
    const select = getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'Tiered Pricing' } });

    const result = await ref.current!.save();

    expect(result).toBe(false);
    expect(alertSpy).toHaveBeenCalledWith('Please enter a valid overage charge.');

    // cleanup
    localStorage.removeItem('tieredTiers');
    localStorage.removeItem('tieredOverage');
    localStorage.removeItem('tieredGrace');
  });
});

// ---- Test 12 ----


describe('Pricing - Test 12', () => {
  it('Test 12: Tiered – unlimited tier present (no overage needed) should call saveTieredPricing and return true', async () => {
    // Set tiers with one unlimited tier; no overage required
    localStorage.setItem(
      'tieredTiers',
      JSON.stringify([
        { from: '0', to: '10', price: '2', isUnlimited: false },
        { from: '11', to: '', price: '5', isUnlimited: true },
      ])
    );
    localStorage.removeItem('tieredOverage'); // not needed when unlimited tier exists
    localStorage.removeItem('tieredGrace');

    vi.spyOn(api, 'saveTieredPricing').mockResolvedValueOnce({} as any);

    const ref = React.createRef<PricingHandle>();
    const { getByRole } = render(<Pricing ref={ref} ratePlanId={707} />);

    // Select "Tiered Pricing"
    const select = getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'Tiered Pricing' } });

    const result = await ref.current!.save();

    expect(result).toBe(true);
    expect(api.saveTieredPricing).toHaveBeenCalledWith(707, {
      tiers: [
        { startRange: 0, endRange: 10, unitPrice: 2 },
        { startRange: 11, endRange: null, unitPrice: 5 },
      ],
      overageUnitRate: 0, // default when not set
      graceBuffer: 0,     // default when not set
    });
    expect(alertSpy).toHaveBeenCalledWith('Tiered pricing saved');

    // cleanup
    localStorage.removeItem('tieredTiers');
    localStorage.removeItem('tieredOverage');
    localStorage.removeItem('tieredGrace');
  });
});




  
