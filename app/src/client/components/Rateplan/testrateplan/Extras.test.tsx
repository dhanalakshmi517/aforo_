/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';

import Extras from '../Extras';

describe('Extras - Test 1', () => {
  it('Test 1: renders 4 sections and they are collapsed by default', () => {
    render(<Extras ratePlanId={456} noUpperLimit={false} />);

    // headers exist
    expect(screen.getByText('Setup Fee(Optional)')).toBeInTheDocument();
    expect(screen.getByText('Discounts')).toBeInTheDocument();
    expect(screen.getByText('Freemium Setup')).toBeInTheDocument();
    expect(screen.getByText('Minimum Commitment')).toBeInTheDocument();

    // no expanded content initially
    expect(document.querySelector('.section-content')).not.toBeInTheDocument();
  });
});

describe('Extras - Test 2', () => {
    it('Test 2: clicking a section header toggles its content', () => {
      render(<Extras ratePlanId={456} noUpperLimit={false} />);
  
      // Initially collapsed
      expect(document.querySelector('.section-content')).not.toBeInTheDocument();
  
      // Click the actual header container (more reliable than the inner span)
      const header = screen
        .getByText('Setup Fee(Optional)')
        .closest('.section-header') as HTMLElement;
  
      expect(header).toBeInTheDocument();
  
      fireEvent.click(header);
      expect(document.querySelector('.section-content')).toBeInTheDocument();
  
      fireEvent.click(header);
      expect(document.querySelector('.section-content')).not.toBeInTheDocument();
    });
  });
  

  describe('Extras - Test 3', () => {
    it('Test 3: Setup Fee save calls saveSetupFee with correct payload', async () => {
      const api = await import('../api');
      const saveSpy = vi.spyOn(api, 'saveSetupFee').mockResolvedValueOnce({} as any);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  
      render(<Extras ratePlanId={456} noUpperLimit={false} />);
  
      // Open "Setup Fee" section
      const headerEl = screen.getByText('Setup Fee(Optional)');
      const header = headerEl.closest('.section-header') as HTMLElement;
      fireEvent.click(header);
  
      const section = headerEl.closest('.section') as HTMLElement;
  
      // Fill fields
      fireEvent.change(
        section.querySelector('input[placeholder="$0"]') as HTMLInputElement,
        { target: { value: '199' } }
      );
      fireEvent.change(
        section.querySelector('input[placeholder="0"]') as HTMLInputElement,
        { target: { value: '1' } }
      );
      fireEvent.change(
        section.querySelector('textarea[placeholder="Invoice Description"]') as HTMLTextAreaElement,
        { target: { value: 'One-time onboarding' } }
      );
  
      // Save
      fireEvent.click(section.querySelector('button.extras-save-btn') as HTMLButtonElement);
  
      await waitFor(() => {
        expect(saveSpy).toHaveBeenCalledWith(456, {
          setupFee: 199,
          applicationTiming: 1,
          invoiceDescription: 'One-time onboarding',
        });
        expect(alertSpy).toHaveBeenCalledWith('Setup fee saved');
      });
    });
  });
  


  describe('Extras - Test 4', () => {
    it('Test 4: Setup Fee save with null ratePlanId shows alert and does not call API', async () => {
      const api = await import('../api');
      const saveSpy = vi.spyOn(api, 'saveSetupFee').mockResolvedValueOnce({} as any);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  
      render(<Extras ratePlanId={null} noUpperLimit={false} />);
  
      // Open Setup Fee section
      const headerEl = screen.getByText('Setup Fee(Optional)');
      const header = headerEl.closest('.section-header') as HTMLElement;
      fireEvent.click(header);
  
      const section = header.closest('.section') as HTMLElement;
  
      // Click Save without a ratePlanId
      fireEvent.click(section.querySelector('button.extras-save-btn') as HTMLButtonElement);
  
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Rate plan not yet created');
        expect(saveSpy).not.toHaveBeenCalled();
      });
    });
  });
  
  describe('Extras - Test 5', () => {
    it('Test 5: Discounts save (PERCENTAGE) calls saveDiscounts with payload', async () => {
      const api = await import('../api');
      const saveSpy = vi.spyOn(api, 'saveDiscounts').mockResolvedValueOnce({} as any);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  
      render(<Extras ratePlanId={456} noUpperLimit={false} />);
  
      // Open Discounts section
      const headerEl = screen.getByText('Discounts');
      const header = headerEl.closest('.section-header') as HTMLElement;
      fireEvent.click(header);
  
      const section = header.closest('.section') as HTMLElement;
  
      // Ensure type is PERCENTAGE
      const typeSelect = section.querySelector('select') as HTMLSelectElement;
      fireEvent.change(typeSelect, { target: { value: 'PERCENTAGE' } });
  
      // Enter % discount (first number input)
      const numberInputs = section.querySelectorAll('input[type="number"]');
      fireEvent.change(numberInputs[0] as HTMLInputElement, { target: { value: '15' } });
  
      // Eligibility
      const eligibility = section.querySelector(
        'input[placeholder="e.g. new users"]'
      ) as HTMLInputElement;
      fireEvent.change(eligibility, { target: { value: 'new users' } });
  
      // Dates
      const dateInputs = section.querySelectorAll('input[type="date"]');
      fireEvent.change(dateInputs[0] as HTMLInputElement, { target: { value: '2025-08-01' } });
      fireEvent.change(dateInputs[1] as HTMLInputElement, { target: { value: '2025-09-01' } });
  
      // Save
      const saveBtn = section.querySelector('button.extras-save-btn') as HTMLButtonElement;
      fireEvent.click(saveBtn);
  
      await waitFor(() => {
        expect(saveSpy).toHaveBeenCalledWith(456, {
          discountType: 'PERCENTAGE',
          percentageDiscount: 15,
          flatDiscountAmount: 0,
          eligibility: 'new users',
          startDate: '2025-08-01',
          endDate: '2025-09-01',
        });
        expect(alertSpy).toHaveBeenCalledWith('Discount saved');
      });
    });
  });


  describe('Extras - Test 6', () => {
    it('Test 6: Discounts save with null ratePlanId shows alert and does not call API', async () => {
      const api = await import('../api');
      const saveSpy = vi.spyOn(api, 'saveDiscounts').mockResolvedValueOnce({} as any);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  
      render(<Extras ratePlanId={null} noUpperLimit={false} />);
  
      // Open Discounts section
      const headerEl = screen.getByText('Discounts');
      const header = headerEl.closest('.section-header') as HTMLElement;
      fireEvent.click(header);
  
      const section = header.closest('.section') as HTMLElement;
  
      // Click Save without a ratePlanId
      const saveBtn = section.querySelector('button.extras-save-btn') as HTMLButtonElement;
      fireEvent.click(saveBtn);
  
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Rate plan not yet created');
        expect(saveSpy).not.toHaveBeenCalled();
      });
    });
  });



  describe('Extras - Test 7', () => {
    it('Test 7: Freemium save (FREE_UNITS) calls saveFreemiums with payload', async () => {
      const api = await import('../api');
      const saveSpy = vi.spyOn(api, 'saveFreemiums').mockResolvedValueOnce({} as any);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  
      render(<Extras ratePlanId={456} noUpperLimit={false} />);
  
      // Open Freemium section
      const headerEl = screen.getByText('Freemium Setup');
      const header = headerEl.closest('.section-header') as HTMLElement;
      fireEvent.click(header);
  
      const section = header.closest('.section') as HTMLElement;
  
      // Select FREE_UNITS
      const typeSelect = section.querySelector('select') as HTMLSelectElement;
      fireEvent.change(typeSelect, { target: { value: 'FREE_UNITS' } });
  
      // Enter free units
      const unitsInput = section.querySelector(
        'input[placeholder="Enter Free Units"]'
      ) as HTMLInputElement;
      fireEvent.change(unitsInput, { target: { value: '1000' } });
  
      // Dates
      const dateInputs = section.querySelectorAll('input[type="date"]');
      fireEvent.change(dateInputs[0] as HTMLInputElement, { target: { value: '2025-08-10' } });
      fireEvent.change(dateInputs[1] as HTMLInputElement, { target: { value: '2025-09-10' } });
  
      // Save
      fireEvent.click(section.querySelector('button.extras-save-btn') as HTMLButtonElement);
  
      await waitFor(() => {
        expect(saveSpy).toHaveBeenCalledWith(456, {
          freemiumType: 'FREE_UNITS',
          freeUnits: 1000,
          freeTrialDuration: 0,
          startDate: '2025-08-10',
          endDate: '2025-09-10',
        });
        expect(alertSpy).toHaveBeenCalledWith('Freemium saved');
      });
    });
  });
  
  
  describe('Extras - Test 8', () => {
    it('Test 8: Freemium save (FREE_TRIAL_DURATION) calls saveFreemiums with payload', async () => {
      const api = await import('../api');
      const saveSpy = vi.spyOn(api, 'saveFreemiums').mockResolvedValueOnce({} as any);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  
      render(<Extras ratePlanId={456} noUpperLimit={false} />);
  
      // Open Freemium section
      const headerEl = screen.getByText('Freemium Setup');
      const header = headerEl.closest('.section-header') as HTMLElement;
      fireEvent.click(header);
  
      const section = header.closest('.section') as HTMLElement;
  
      // Choose FREE_TRIAL_DURATION
      const typeSelect = section.querySelector('select') as HTMLSelectElement;
      fireEvent.change(typeSelect, { target: { value: 'FREE_TRIAL_DURATION' } });
  
      // Enter trial duration
      const durationInput = section.querySelector(
        'input[placeholder="Enter Trial Duration"]'
      ) as HTMLInputElement;
      fireEvent.change(durationInput, { target: { value: '14' } });
  
      // Save
      fireEvent.click(section.querySelector('button.extras-save-btn') as HTMLButtonElement);
  
      await waitFor(() => {
        expect(saveSpy).toHaveBeenCalledWith(456, {
          freemiumType: 'FREE_TRIAL_DURATION',
          freeUnits: 0,
          freeTrialDuration: 14,
          startDate: '',
          endDate: '',
        });
        expect(alertSpy).toHaveBeenCalledWith('Freemium saved');
      });
    });
  });

  describe('Extras - Test 9', () => {
    it('Test 9: Minimum Commitment - entering usage disables charge and saves correct payload', async () => {
      const api = await import('../api');
      const saveSpy = vi.spyOn(api, 'saveMinimumCommitment').mockResolvedValueOnce({} as any);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  
      render(<Extras ratePlanId={456} noUpperLimit={false} />);
  
      // Open Minimum Commitment section
      const headerEl = screen.getByText('Minimum Commitment');
      const header = headerEl.closest('.section-header') as HTMLElement;
      fireEvent.click(header);
  
      const section = header.closest('.section') as HTMLElement;
  
      // Enter minimum usage; charge should be disabled
      const usageInput = section.querySelector(
        'input[placeholder="Enter usage"]'
      ) as HTMLInputElement;
      const chargeInput = section.querySelector(
        'input[placeholder="Enter charge"]'
      ) as HTMLInputElement;
  
      fireEvent.change(usageInput, { target: { value: '200' } });
      expect(chargeInput).toBeDisabled();
  
      // Save
      const saveBtn = section.querySelector('button.extras-save-btn') as HTMLButtonElement;
      fireEvent.click(saveBtn);
  
      await waitFor(() => {
        expect(saveSpy).toHaveBeenCalledWith(456, {
          minimumUsage: 200,
          minimumCharge: 0,
        });
        expect(alertSpy).toHaveBeenCalledWith('Minimum commitment saved');
      });
    });
  });
  

  describe('Extras - Test 10', () => {
    it('Test 10: Minimum Commitment - entering charge disables usage and saves correct payload', async () => {
      const api = await import('../api');
      const saveSpy = vi.spyOn(api, 'saveMinimumCommitment').mockResolvedValueOnce({} as any);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  
      render(<Extras ratePlanId={456} noUpperLimit={false} />);
  
      // Open Minimum Commitment section
      const headerEl = screen.getByText('Minimum Commitment');
      const header = headerEl.closest('.section-header') as HTMLElement;
      fireEvent.click(header);
  
      const section = header.closest('.section') as HTMLElement;
  
      const usageInput = section.querySelector('input[placeholder="Enter usage"]') as HTMLInputElement;
      const chargeInput = section.querySelector('input[placeholder="Enter charge"]') as HTMLInputElement;
  
      // Enter charge; usage should get disabled
      fireEvent.change(chargeInput, { target: { value: '999' } });
      expect(usageInput).toBeDisabled();
  
      // Save
      const saveBtn = section.querySelector('button.extras-save-btn') as HTMLButtonElement;
      fireEvent.click(saveBtn);
  
      await waitFor(() => {
        expect(saveSpy).toHaveBeenCalledWith(456, {
          minimumUsage: 0,
          minimumCharge: 999,
        });
        expect(alertSpy).toHaveBeenCalledWith('Minimum commitment saved');
      });
    });
  });
  

  describe('Extras - Test 11', () => {
    it('Discounts: selecting FLAT disables % discount input', () => {
      render(<Extras ratePlanId={456} noUpperLimit={false} />);
  
      // Open Discounts section
      const header = screen.getByText('Discounts').closest('.section-header') as HTMLElement;
      fireEvent.click(header);
      const section = header.closest('.section') as HTMLElement;
  
      // Switch to FLAT
      const typeSelect = section.querySelector('select') as HTMLSelectElement;
      fireEvent.change(typeSelect, { target: { value: 'FLAT' } });
  
      // The percentage input (first number input) should be disabled
      const numberInputs = section.querySelectorAll('input[type="number"]');
      const percentInput = numberInputs[0] as HTMLInputElement;
      expect(percentInput).toBeDisabled();
    });
  });

  

  describe('Extras - Test 12', () => {
    it('Discounts: selecting PERCENTAGE disables flat amount input', () => {
      render(<Extras ratePlanId={456} noUpperLimit={false} />);
  
      const header = screen.getByText('Discounts').closest('.section-header') as HTMLElement;
      fireEvent.click(header);
      const section = header.closest('.section') as HTMLElement;
  
      const typeSelect = section.querySelector('select') as HTMLSelectElement;
      fireEvent.change(typeSelect, { target: { value: 'PERCENTAGE' } });
  
      const numberInputs = section.querySelectorAll('input[type="number"]');
      const flatAmountInput = numberInputs[1] as HTMLInputElement;
      expect(flatAmountInput).toBeDisabled();
    });
  });
  