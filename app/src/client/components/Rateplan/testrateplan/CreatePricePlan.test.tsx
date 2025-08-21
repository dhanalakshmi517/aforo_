// CreatePricePlan.steps.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import '@testing-library/jest-dom';


import CreatePricePlan from '../CreatePricePlan';

// ---- Child component stubs ----
// Billable exposes a button to simulate selecting a metric
vi.mock('../Billable', () => ({
  default: ({ onSelectMetric }: any) => (
    <div data-testid="billable-step">
      <button onClick={() => onSelectMetric(42)}>Select Metric</button>
    </div>
  ),
}));
vi.mock('../Pricing', () => {
  const saveSpy = vi.fn().mockResolvedValue(true);
  const PricingMock = React.forwardRef((_: any, ref: any) => {
    // expose save() via ref
    React.useImperativeHandle(ref, () => ({ save: saveSpy }));
    return <div data-testid="pricing-step">Pricing</div>;
  });
  return {
    __esModule: true,
    default: PricingMock,
    saveSpy,
  };
});
vi.mock('../Extras', () => ({
  default: () => <div data-testid="extras-step">Extras</div>,
}));
vi.mock('../Review', () => ({
  default: () => <div data-testid="review-step">Review</div>,
}));

// ---- API mocks ----
const mockFetchProducts = vi.fn();
const mockCreateRatePlan = vi.fn();
const mockConfirmRatePlan = vi.fn();

vi.mock('../api', () => ({
  fetchProducts: (...args: any[]) => mockFetchProducts(...args),
  createRatePlan: (...args: any[]) => mockCreateRatePlan(...args),
  confirmRatePlan: (...args: any[]) => mockConfirmRatePlan(...args),
}));

// ---- InputFields stubs ----
vi.mock('../../Components/InputFields', () => ({
  InputField: ({ label, value, onChange }: any) => (
    <input aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} />
  ),
  TextareaField: ({ label, value, onChange }: any) => (
    <textarea aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} />
  ),
  SelectField: ({ label, value, onChange, options }: any) => (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid={label}
    >
      {options.map((o: any, i: number) => (
        <option key={i} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

describe('CreatePricePlan step behavior', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    onClose.mockReset();
    mockCreateRatePlan.mockReset();
    mockConfirmRatePlan.mockReset();
    mockFetchProducts.mockResolvedValue([{ productName: 'ProdA' }]);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('Test 1: validates Step 0 fields and only advances when all are filled', async () => {
    render(<CreatePricePlan onClose={onClose} />);

    const saveNext = await screen.findByRole('button', { name: /save & next/i });

    fireEvent.click(saveNext);
    expect(window.alert).toHaveBeenLastCalledWith('Rate Plan Name is required');

    fireEvent.change(screen.getByLabelText('Rate Plan Name *'), { target: { value: 'My Plan' } });

    fireEvent.click(saveNext);
    expect(window.alert).toHaveBeenLastCalledWith('Rate Plan Description is required');

    fireEvent.change(screen.getByLabelText('Rate Plan Description *'), {
      target: { value: 'Nice plan' },
    });

    fireEvent.click(saveNext);
    expect(window.alert).toHaveBeenLastCalledWith('Billing Frequency is required');

    fireEvent.change(screen.getByTestId('Billing Frequency *'), {
      target: { value: 'MONTHLY' },
    });

    fireEvent.click(saveNext);
    expect(window.alert).toHaveBeenLastCalledWith('Product selection is required');

    fireEvent.change(screen.getByTestId('Select Product *'), {
      target: { value: 'ProdA' },
    });

    fireEvent.click(saveNext);
    expect(window.alert).toHaveBeenLastCalledWith('Payment Method is required');

    fireEvent.change(screen.getByTestId('Payment Method *'), {
      target: { value: 'POSTPAID' },
    });

    fireEvent.click(saveNext);

    expect(await screen.findByTestId('billable-step')).toBeInTheDocument();
    expect(mockCreateRatePlan).not.toHaveBeenCalled();
  });

  it('Test 2: creates rate plan when leaving Billable and goes to Pricing', async () => {
    mockCreateRatePlan.mockResolvedValue({ ratePlanId: 123 });

    render(<CreatePricePlan onClose={onClose} />);

    fireEvent.change(await screen.findByLabelText('Rate Plan Name *'), {
      target: { value: 'My Plan' },
    });
    fireEvent.change(screen.getByLabelText('Rate Plan Description *'), {
      target: { value: 'Desc' },
    });
    fireEvent.change(screen.getByTestId('Billing Frequency *'), {
      target: { value: 'MONTHLY' },
    });
    fireEvent.change(screen.getByTestId('Select Product *'), {
      target: { value: 'ProdA' },
    });
    fireEvent.change(screen.getByTestId('Payment Method *'), {
      target: { value: 'POSTPAID' },
    });

    const saveNext = screen.getByRole('button', { name: /save & next/i });
    fireEvent.click(saveNext);

    expect(await screen.findByTestId('billable-step')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Select Metric'));
    fireEvent.click(saveNext);

    expect(mockCreateRatePlan).toHaveBeenCalledTimes(1);
    expect(mockCreateRatePlan).toHaveBeenCalledWith({
      ratePlanName: 'My Plan',
      productName: 'ProdA',
      description: 'Desc',
      billingFrequency: 'MONTHLY',
      paymentType: 'POSTPAID',
      billableMetricId: 42,
    });

    expect(await screen.findByTestId('pricing-step')).toBeInTheDocument();
  });
});


const onClose = vi.fn();



it('Test 5: does not advance from Pricing when pricingRef.save() returns false', async () => {
  // Use the exported spy from the Pricing mock and force a false result for this test
  const { saveSpy } = (await import('../Pricing')) as any;
  saveSpy.mockResolvedValueOnce(false);

  // Ensure rate plan creation succeeds so we can reach Pricing
  mockCreateRatePlan.mockResolvedValue({ ratePlanId: 555 });

  render(<CreatePricePlan onClose={onClose} />);

  // ---- Step 0: fill details ----
  fireEvent.change(await screen.findByLabelText('Rate Plan Name *'), {
    target: { value: 'My Plan' },
  });
  fireEvent.change(screen.getByLabelText('Rate Plan Description *'), {
    target: { value: 'Desc' },
  });
  fireEvent.change(screen.getByTestId('Billing Frequency *'), {
    target: { value: 'MONTHLY' },
  });
  fireEvent.change(screen.getByTestId('Select Product *'), {
    target: { value: 'ProdA' },
  });
  fireEvent.change(screen.getByTestId('Payment Method *'), {
    target: { value: 'POSTPAID' },
  });

  const saveNext = screen.getByRole('button', { name: /save & next/i });

  // ---- Step 1: Billable ----
  fireEvent.click(saveNext);
  expect(await screen.findByTestId('billable-step')).toBeInTheDocument();

  // Select a metric and proceed (triggers createRatePlan)
  fireEvent.click(screen.getByText('Select Metric'));
  fireEvent.click(saveNext);

  // ---- Step 2: Pricing ----
  expect(await screen.findByTestId('pricing-step')).toBeInTheDocument();

  // Try to leave Pricing -> should call save() but NOT advance because it returns false
  fireEvent.click(saveNext);

  await waitFor(() => expect(saveSpy).toHaveBeenCalledTimes(1));
  expect(screen.getByTestId('pricing-step')).toBeInTheDocument(); // still here
  expect(screen.queryByTestId('extras-step')).not.toBeInTheDocument();
});
