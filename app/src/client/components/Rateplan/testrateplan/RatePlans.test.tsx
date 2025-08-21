import React from 'react';
import { render, waitFor, screen, within, fireEvent } from '@testing-library/react';
import RatePlans, { RatePlan } from '../RatePlans';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers as any);

// ---- Mock external dependencies ----
const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

const mockFetchRatePlans = vi.fn();
const mockDeleteRatePlan = vi.fn();

vi.mock('../api', () => ({
  fetchRatePlans: () => mockFetchRatePlans(),
  deleteRatePlan: (id: number) => mockDeleteRatePlan(id),
}));

// Provide a simple stub for the Search component so we can control onSearch
vi.mock('../../Components/Search', () => {
    return {
      default: ({ onSearch }: { onSearch: (value: string) => void }) => (
        <input
          data-testid="search-input"
          placeholder="search"
          onChange={(e) => onSearch(e.target.value)}
        />
      ),
    };
  });
//   ------------------------------------

const samplePlans: RatePlan[] = [
  {
    ratePlanId: 1,
    ratePlanName: 'Basic',
    description: 'Basic plan',
    ratePlanType: 'FIXED',
    billingFrequency: 'MONTHLY',
    productId: 1,
    productName: 'Product A',
    status: 'ACTIVE',
  },
  {
    ratePlanId: 2,
    ratePlanName: 'Pro',
    description: 'Pro plan',
    ratePlanType: 'FIXED',
    billingFrequency: 'YEARLY',
    productId: 2,
    productName: 'Product B',
    status: 'ACTIVE',
  },
];

const setup = () =>
  render(
    <BrowserRouter>
      <RatePlans
        showCreatePlan={false}
        setShowCreatePlan={vi.fn()}  // ✅ vi.fn instead of jest.fn
        ratePlans={samplePlans}
      />
    </BrowserRouter>
  );

describe('RatePlans GET API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls fetchRatePlans on component mount', async () => {
    mockFetchRatePlans.mockResolvedValueOnce(samplePlans);
    setup();
    await waitFor(() => expect(mockFetchRatePlans).toHaveBeenCalled());
  });

  
});
it('renders table with provided plans and headers', () => {
    setup();
  
    expect(screen.getByRole('table')).toBeInTheDocument();
  
    // Headers
    const headerRow = screen.getAllByRole('row')[0];
    const headers = within(headerRow).getAllByRole('columnheader');
    expect(headers.map((h: HTMLElement) => h.textContent)).toEqual([
      'S.No',
      'Rate Plan Name',
      'Product Name',
      'Billing Frequency',
      'Status',
      'Actions',
    ]);
  
    // Rows count = samplePlans length
    const bodyRows = screen.getAllByRole('row').slice(1);
    expect(bodyRows).toHaveLength(2);
  
    // First row contents
    const first = bodyRows[0];
    expect(within(first).getByText('1')).toBeInTheDocument();
    expect(within(first).getByText('Basic')).toBeInTheDocument();
    expect(within(first).getByText('Product A')).toBeInTheDocument();
    expect(within(first).getByText('MONTHLY')).toBeInTheDocument();
    expect(within(first).getByText('ACTIVE')).toBeInTheDocument();
  });
  it('navigates to edit page with correct state when Edit is clicked', () => {
    setup();
  
    // Find the row containing "Pro"
    const proRow = screen.getAllByRole('row').find(r =>
      within(r).queryByText('Pro')
    );
    expect(proRow).toBeTruthy();
  
    // Click its Edit button (has title="Edit")
    const editBtn = within(proRow!).getByTitle('Edit');
    fireEvent.click(editBtn);
  
    // Assert navigation with correct path and state
    expect(mockedNavigate).toHaveBeenCalledWith('/get-started/rate-plans/2/edit', {
      state: { ratePlanName: 'Pro' },
    });
  });

  
  it('opens delete modal and cancels without calling API', () => {
    setup();
  
    // Click Delete on first row (after header)
    const firstRow = screen.getAllByRole('row')[1];
    const deleteBtn = within(firstRow).getByTitle('Delete');
    fireEvent.click(deleteBtn);
  
    // Modal should appear
    expect(
      screen.getByText(/Are you sure you want to delete this/i)
    ).toBeInTheDocument();
  
    // Click Back to cancel
    fireEvent.click(screen.getByText('Back'));
  
    // API should not be called
    expect(mockDeleteRatePlan).not.toHaveBeenCalled();
  
    // Modal should be gone
    expect(
      screen.queryByText(/Are you sure you want to delete this/i)
    ).not.toBeInTheDocument();
  });

  it('deletes a plan successfully and shows success notification', async () => {
    mockDeleteRatePlan.mockResolvedValueOnce(undefined);
  
    setup();
  
    // Open delete modal for first row ("Basic", id=1)
    const firstRow = screen.getAllByRole('row')[1];
    fireEvent.click(within(firstRow).getByTitle('Delete'));
  
    // Confirm delete
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  
    // API called and row removed
    await waitFor(() => expect(mockDeleteRatePlan).toHaveBeenCalledWith(1));
    await waitFor(() => expect(screen.queryByText('Basic')).not.toBeInTheDocument());
  
    // Success toast visible
    expect(screen.getByText('Rate Plan Deleted')).toBeInTheDocument();
    expect(
      screen.getByText(/The rate plan “Basic” was successfully deleted\./i)
    ).toBeInTheDocument();
  });

  
  it('handles delete failure, keeps row, and shows error notification', async () => {
    mockFetchRatePlans.mockResolvedValueOnce(samplePlans);
    mockDeleteRatePlan.mockRejectedValueOnce(new Error('boom'));
  
    setup();
  
    // Open delete modal for "Pro" (id=2)
    const proRow = screen.getAllByRole('row').find(r =>
      within(r).queryByText('Pro')
    )!;
    fireEvent.click(within(proRow).getByTitle('Delete'));
  
    // Confirm delete
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  
    // API called with correct id
    await waitFor(() => expect(mockDeleteRatePlan).toHaveBeenCalledWith(2));
  
    // Row should still be present
    expect(screen.getByText('Pro')).toBeInTheDocument();
  
    // Error toast visible
    expect(screen.getByText('Failed to Delete Rate Plan')).toBeInTheDocument();
    expect(
      screen.getByText(/Failed to delete the rate plan “Pro”. Please try again\./i)
    ).toBeInTheDocument();
  });


  it('clicking "+ New Rate Plan" toggles create mode and navigates', () => {
    const setShowCreatePlan = vi.fn();
  
    render(
      <BrowserRouter>
        <RatePlans
          showCreatePlan={false}
          setShowCreatePlan={setShowCreatePlan}
          ratePlans={samplePlans}
        />
      </BrowserRouter>
    );
  
    fireEvent.click(screen.getByRole('button', { name: '+ New Rate Plan' }));
  
    expect(setShowCreatePlan).toHaveBeenCalledWith(true);
    expect(mockedNavigate).toHaveBeenCalledWith('/get-started/rate-plans');
  });

  
  it('create mode: Cancel opens modal and Confirm closes create mode and navigates', async () => {
    const setShowCreatePlan = vi.fn();
  
    render(
      <BrowserRouter>
        <RatePlans
          showCreatePlan={true}
          setShowCreatePlan={setShowCreatePlan}
          ratePlans={samplePlans}
        />
      </BrowserRouter>
    );
  
    // Click "Cancel" in the create-mode header actions
    fireEvent.click(screen.getByText('Cancel'));
  
    // Modal appears
    expect(
      screen.getByText(/Are you sure you want to cancel/i)
    ).toBeInTheDocument();
  
    // Confirm cancel
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  
    await waitFor(() => {
      expect(setShowCreatePlan).toHaveBeenCalledWith(false);
      expect(mockedNavigate).toHaveBeenCalledWith('/get-started/rate-plans');
    });
  
    // Modal should be gone
    expect(
      screen.queryByText(/Are you sure you want to cancel/i)
    ).not.toBeInTheDocument();
  });
  