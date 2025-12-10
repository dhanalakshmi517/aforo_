const { By, until, Key } = require('selenium-webdriver');

/**
 * Page Object Model for Rate Plan Creation Wizard
 * Encapsulates all interactions with the 5-step wizard
 */
class RatePlanWizardPage {
    constructor(driver) {
        this.driver = driver;
        this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';

        // Wizard Navigation Selectors
        this.selectors = {
            // Main wizard container
            wizardContainer: By.css('.create-price-plan, [data-testid="create-plan-wizard"]'),

            // Navigation buttons
            nextButton: By.xpath('//button[contains(text(), "Next") or contains(text(), "Save & Next")]'),
            backButton: By.xpath('//button[contains(text(), "Back")]'),
            saveDraftButton: By.xpath('//button[contains(text(), "Save as Draft")]'),
            submitButton: By.xpath('//button[contains(text(), "Submit") or contains(text(), "Confirm")]'),

            // Sidebar steps
            sidebarSteps: By.css('.step, .wizard-step'),
            sidebarStep: (index) => By.css(`.step:nth-child(${index + 1}), .wizard-step:nth-child(${index + 1})`),
            lockedStepIcon: By.css('.lock-icon, svg[aria-label="Locked"]'),

            // Step indicators
            currentStepIndicator: By.css('.step.active, .wizard-step.active'),
            stepTitle: By.css('.section-heading, h2'),

            // STEP 1: Plan Details
            planNameInput: By.id('planName'),
            planDescriptionInput: By.id('planDescription'),
            billingFrequencySelect: By.id('billingFrequency'),
            productSelect: By.id('product'),
            paymentMethodSelect: By.id('paymentMethod'),

            // STEP 2: Billable Metrics
            billableMetricCards: By.css('.billable-metric-card'),
            billableMetricCard: (id) => By.css(`[data-metric-id="${id}"]`),
            billableMetricRadio: By.css('input[type="radio"][name="metric"]'),
            selectedMetric: By.css('.billable-metric-card.selected'),

            // STEP 3: Pricing Model Selection
            pricingModelSelect: By.css('.custom-select, select[class*="pricing"], .pricing-container select'),

            // Flat Fee Model
            flatFeeAmountInput: By.id('flatFeeAmount'),
            flatFeeAPICallsInput: By.id('numberOfApiCalls'),
            flatFeeOverageInput: By.id('overageUnitRate'),
            flatFeeGraceInput: By.id('graceBuffer'),

            // Usage-Based Model
            usagePerUnitInput: By.id('perUnitAmount'),

            // Tiered/Volume Pricing
            addTierButton: By.xpath('//button[contains(text(), "Add Tier") or contains(text(), "Add Row")]'),
            tierRow: (index) => By.css(`.tier-row:nth-child(${index + 1}), .pricing-tier:nth-child(${index + 1})`),
            tierFromInput: (index) => By.css(`.tier-row:nth-child(${index + 1}) input[placeholder*="From"], .tier-row:nth-child(${index + 1}) input:first-of-type`),
            tierToInput: (index) => By.css(`.tier-row:nth-child(${index + 1}) input[placeholder*="To"], .tier-row:nth-child(${index + 1}) input:nth-of-type(2)`),
            tierPriceInput: (index) => By.css(`.tier-row:nth-child(${index + 1}) input[placeholder*="Price"], .tier-row:nth-child(${index + 1}) input:last-of-type`),
            tierDeleteButton: (index) => By.css(`.tier-row:nth-child(${index + 1}) button[aria-label*="Delete"], .tier-row:nth-child(${index + 1}) .delete-btn`),
            tierUnlimitedCheckbox: (index) => By.css(`.tier-row:nth-child(${index + 1}) input[type="checkbox"]`),
            tieredOverageInput: By.id('overageCharge'),
            tieredGraceInput: By.id('graceBuffer'),
            noUpperLimitCheckbox: By.css('input[type="checkbox"][id*="unlimited"], input[type="checkbox"][id*="noUpperLimit"]'),

            // Stairstep Model
            addStairButton: By.xpath('//button[contains(text(), "Add Stair") or contains(text(), "Add Row")]'),
            stairRow: (index) => By.css(`.stair-row:nth-child(${index + 1}), .stairstep-row:nth-child(${index + 1})`),
            stairFromInput: (index) => By.css(`.stair-row:nth-child(${index + 1}) input:first-of-type`),
            stairToInput: (index) => By.css(`.stair-row:nth-child(${index + 1}) input:nth-of-type(2)`),
            stairCostInput: (index) => By.css(`.stair-row:nth-child(${index + 1}) input:last-of-type`),
            stairUnlimitedCheckbox: (index) => By.css(`.stair-row:nth-child(${index + 1}) input[type="checkbox"]`),

            // STEP 4: Extras
            // Setup Fee
            setupFeeSection: By.xpath('//*[contains(text(), "Setup Fee")]'),
            setupFeeInput: By.css('input[placeholder*="$0"], #setupFee'),
            setupTimingInput: By.id('applicationTiming'),
            setupInvoiceDescTextarea: By.css('textarea[placeholder*="Invoice"]'),

            // Discounts
            discountsSection: By.xpath('//*[contains(text(), "Discount")]'),
            discountTypeSelect: By.id('discountType'),
            discountPercentInput: By.id('percentageDiscount'),
            discountFlatInput: By.id('flatDiscount'),
            discountEligibilityInput: By.id('eligibility'),
            discountStartDateInput: By.id('startDate'),
            discountEndDateInput: By.id('endDate'),

            // Freemium
            freemiumSection: By.xpath('//*[contains(text(), "Freemium")]'),
            freemiumTypeSelect: By.id('freemiumType'),
            freemiumUnitsInput: By.id('freeUnits'),
            freemiumTrialDurationInput: By.id('freeTrialDuration'),
            freemiumStartDateInput: By.css('[id*="freemium"] input[type="date"]:first-of-type'),
            freemiumEndDateInput: By.css('[id*="freemium"] input[type="date"]:last-of-type'),

            // Minimum Commitment
            commitmentSection: By.xpath('//*[contains(text(), "Minimum Commitment")]'),
            minimumUsageInput: By.id('minimumUsage'),
            minimumChargeInput: By.id('minimumCharge'),

            // Section expand/collapse
            sectionHeader: (sectionName) => By.xpath(`//*[contains(@class, "section-header") and contains(., "${sectionName}")]`),

            // STEP 5: Review
            reviewContainer: By.css('.review-container'),
            reviewCard: By.css('.card'),
            reviewRow: By.css('.row'),
            estimateRevenueButton: By.xpath('//button[contains(text(), "Estimate")] | //*[@class="estimate-button"]'),
            estimatorModal: By.css('.modal, [role="dialog"]'),

            // Common
            errorMsg: By.css('.error-msg, .inline-error, [class*="error"]'),
            errorMessage: By.css('.error-msg, .inline-error'),
            successNotification: By.css('.notification.success, .toast-success'),
            loadingSpinner: By.css('.spinner, .loading'),

            // Draft management (on main rate plans page)
            ratePlansList: By.css('[data-testid="rate-plans-table"], .rate-plans-table'),
            draftPlanRow: By.xpath('//*[contains(@class, "rate-plan-row") and contains(., "DRAFT")]'),
            resumeDraftButton: (planName) => By.xpath(`//*[contains(text(), "${planName}")]/ancestor::tr//button[contains(text(), "Resume")]`),
        };
    }

    // ==================== NAVIGATION ====================

    async dismissCookieConsent() {
        console.log('🍪 Checking for cookie consent popup');
        try {
            // Try multiple common selectors for cookie consent buttons
            const selectors = [
                By.xpath('//button[contains(text(), "Accept all")]'),
                By.xpath('//button[contains(text(), "Accept All")]'),
                By.xpath('//button[contains(text(), "Reject all")]'),
                By.xpath('//button[contains(text(), "Reject All")]'),
                By.css('button[class*="accept"]'),
                By.css('button[class*="reject"]'),
                By.css('[aria-label*="Accept"]'),
                By.css('[aria-label*="Reject"]')
            ];

            for (const selector of selectors) {
                try {
                    const button = await this.driver.findElement(selector);
                    if (await button.isDisplayed()) {
                        await button.click();
                        await this.driver.sleep(1000);
                        console.log('✅ Cookie consent dismissed');
                        return true;
                    }
                } catch (error) {
                    // Try next selector
                    continue;
                }
            }

            console.log('ℹ️ No cookie consent popup found (or already dismissed)');
            return false;
        } catch (error) {
            console.log('⚠️ Error dismissing cookie consent:', error.message);
            return false;
        }
    }

    async navigateToRatePlans() {
        console.log('📋 Navigating to Rate Plans page');
        await this.driver.get(`${this.baseUrl}/get-started/rate-plans`);
        await this.driver.sleep(2000); // Wait for page load

        // Dismiss cookie consent if present
        await this.dismissCookieConsent();
        await this.driver.sleep(500);
    }

    async clickCreateRatePlan() {
        console.log('➕ Clicking Create Rate Plan button');
        const createButton = await this.driver.findElement(By.xpath('//button[contains(text(), "New Rate Plan") or contains(text(), "Create Rate Plan")]'));
        await createButton.click();
        await this.waitForWizardLoad();
    }

    async waitForWizardLoad() {
        console.log('⏳ Waiting for wizard to load');
        try {
            await this.driver.wait(until.elementLocated(this.selectors.wizardContainer), 10000);
            await this.driver.sleep(1000); // Additional wait for animations
            console.log('✅ Wizard loaded');
            return true;
        } catch (error) {
            console.log('❌ Wizard failed to load:', error.message);
            return false;
        }
    }

    async clickNext() {
        console.log('➡️ Clicking Next button');
        const nextButton = await this.driver.findElement(this.selectors.nextButton);
        await nextButton.click();
        await this.driver.sleep(1500); // Wait for step transition
    }

    async clickBack() {
        console.log('⬅️ Clicking Back button');
        const backButton = await this.driver.findElement(this.selectors.backButton);
        await backButton.click();
        await this.driver.sleep(1500);
    }

    async clickSaveDraft() {
        console.log('💾 Clicking Save as Draft');
        const draftButton = await this.driver.findElement(this.selectors.saveDraftButton);
        await draftButton.click();
        await this.driver.sleep(2000); // Wait for save operation
    }

    async clickSubmit() {
        console.log('✅ Clicking Submit button');
        const submitButton = await this.driver.findElement(this.selectors.submitButton);
        await submitButton.click();
        await this.driver.sleep(3000); // Wait for submission
    }

    async clickSidebarStep(stepIndex) {
        console.log(`🔘 Clicking sidebar step ${stepIndex}`);
        const step = await this.driver.findElement(this.selectors.sidebarStep(stepIndex));
        await step.click();
        await this.driver.sleep(1500);
    }

    async isNextButtonEnabled() {
        try {
            const nextButton = await this.driver.findElement(this.selectors.nextButton);
            return await nextButton.isEnabled();
        } catch (error) {
            return false;
        }
    }

    async isSubmitButtonEnabled() {
        try {
            const submitButton = await this.driver.findElement(this.selectors.submitButton);
            return await submitButton.isEnabled();
        } catch (error) {
            return false;
        }
    }

    async isStepLocked(stepIndex) {
        try {
            const step = await this.driver.findElement(this.selectors.sidebarStep(stepIndex));
            const lockIcon = await step.findElements(this.selectors.lockedStepIcon);
            return lockIcon.length > 0;
        } catch (error) {
            return true; // Assume locked if we can't find the step
        }
    }

    async getCurrentStep() {
        try {
            const title = await this.driver.findElement(this.selectors.stepTitle);
            return await title.getText();
        } catch (error) {
            return null;
        }
    }

    // ==================== STEP 1: PLAN DETAILS ====================

    async fillPlanName(name) {
        console.log(`📝 Filling plan name: ${name}`);
        const input = await this.driver.findElement(this.selectors.planNameInput);
        await input.clear();
        await input.sendKeys(name);
    }

    async fillPlanDescription(desc) {
        console.log(`📝 Filling plan description`);
        const input = await this.driver.findElement(this.selectors.planDescriptionInput);
        await input.clear();
        await input.sendKeys(desc);
    }

    async selectBillingFrequency(frequency) {
        console.log(`📅 Selecting billing frequency: ${frequency}`);
        const select = await this.driver.findElement(this.selectors.billingFrequencySelect);
        await select.click();
        const option = await select.findElement(By.css(`option[value="${frequency}"]`));
        await option.click();
    }

    async selectProduct(productName) {
        console.log(`📦 Selecting product: ${productName}`);
        const select = await this.driver.findElement(this.selectors.productSelect);
        await select.click();
        const option = await select.findElement(By.xpath(`//option[contains(text(), "${productName}")]`));
        await option.click();
        await this.driver.sleep(1000); // Wait for product-related updates
    }

    async selectPaymentMethod(method) {
        console.log(`💳 Selecting payment method: ${method}`);
        const select = await this.driver.findElement(this.selectors.paymentMethodSelect);
        await select.click();
        const option = await select.findElement(By.css(`option[value="${method}"]`));
        await option.click();
    }

    // ==================== STEP 2: BILLABLE METRICS ====================

    async getBillableMetrics() {
        console.log('📊 Getting billable metrics');
        const cards = await this.driver.findElements(this.selectors.billableMetricCards);
        const metrics = [];

        for (const card of cards) {
            try {
                const titleElement = await card.findElement(By.css('.billable-metric-title'));
                const title = await titleElement.getText();
                metrics.push(title);
            } catch (error) {
                // Skip cards that don't have the expected structure
            }
        }

        console.log(`Found ${metrics.length} metrics:`, metrics);
        return metrics;
    }

    async selectBillableMetric(metricName) {
        console.log(`📊 Selecting billable metric: ${metricName}`);
        const cards = await this.driver.findElements(this.selectors.billableMetricCards);

        for (const card of cards) {
            try {
                const titleElement = await card.findElement(By.css('.billable-metric-title'));
                const title = await titleElement.getText();

                if (title.includes(metricName)) {
                    await card.click();
                    await this.driver.sleep(500);
                    console.log(`✅ Selected metric: ${metricName}`);
                    return true;
                }
            } catch (error) {
                continue;
            }
        }

        console.log(`❌ Metric not found: ${metricName}`);
        return false;
    }

    async getSelectedMetric() {
        try {
            const selected = await this.driver.findElement(this.selectors.selectedMetric);
            const titleElement = await selected.findElement(By.css('.billable-metric-title'));
            return await titleElement.getText();
        } catch (error) {
            return null;
        }
    }

    // ==================== STEP 3: PRICING MODELS ====================

    async selectPricingModel(modelName) {
        console.log(`💰 Selecting pricing model: ${modelName}`);
        const select = await this.driver.findElement(this.selectors.pricingModelSelect);
        await select.click();
        await this.driver.sleep(500);

        const option = await select.findElement(By.xpath(`//option[contains(text(), "${modelName}")]`));
        await option.click();
        await this.driver.sleep(1000); // Wait for model form to load
    }

    // --- Flat Fee ---

    async fillFlatFeeAmount(amount) {
        console.log(`💵 Filling flat fee amount: ${amount}`);
        const input = await this.driver.findElement(this.selectors.flatFeeAmountInput);
        await input.clear();
        await input.sendKeys(amount.toString());
    }

    async fillFlatFeeAPICalls(calls) {
        console.log(`📞 Filling API calls: ${calls}`);
        const input = await this.driver.findElement(this.selectors.flatFeeAPICallsInput);
        await input.clear();
        await input.sendKeys(calls.toString());
    }

    async fillFlatFeeOverage(rate) {
        console.log(`📈 Filling overage rate: ${rate}`);
        const input = await this.driver.findElement(this.selectors.flatFeeOverageInput);
        await input.clear();
        await input.sendKeys(rate.toString());
    }

    async fillFlatFeeGrace(buffer) {
        console.log(`🎁 Filling grace buffer: ${buffer}`);
        const input = await this.driver.findElement(this.selectors.flatFeeGraceInput);
        await input.clear();
        await input.sendKeys(buffer.toString());
    }

    // --- Usage-Based ---

    async fillUsagePerUnit(amount) {
        console.log(`💵 Filling per-unit amount: ${amount}`);
        const input = await this.driver.findElement(this.selectors.usagePerUnitInput);
        await input.clear();
        await input.sendKeys(amount.toString());
    }

    // --- Tiered/Volume (shared methods) ---

    async addTier() {
        console.log('➕ Adding tier');
        const addButton = await this.driver.findElement(this.selectors.addTierButton);
        await addButton.click();
        await this.driver.sleep(500);
    }

    async fillTierFrom(index, value) {
        console.log(`📊 Filling tier ${index} from: ${value}`);
        const input = await this.driver.findElement(this.selectors.tierFromInput(index));
        await input.clear();
        await input.sendKeys(value.toString());
    }

    async fillTierTo(index, value) {
        console.log(`📊 Filling tier ${index} to: ${value}`);
        const input = await this.driver.findElement(this.selectors.tierToInput(index));
        await input.clear();
        await input.sendKeys(value.toString());
    }

    async fillTierPrice(index, price) {
        console.log(`💵 Filling tier ${index} price: ${price}`);
        const input = await this.driver.findElement(this.selectors.tierPriceInput(index));
        await input.clear();
        await input.sendKeys(price.toString());
    }

    async deleteTier(index) {
        console.log(`🗑️ Deleting tier ${index}`);
        const deleteButton = await this.driver.findElement(this.selectors.tierDeleteButton(index));
        await deleteButton.click();
        await this.driver.sleep(500);
    }

    async setTierUnlimited(index, checked) {
        console.log(`♾️ Setting tier ${index} unlimited: ${checked}`);
        const checkbox = await this.driver.findElement(this.selectors.tierUnlimitedCheckbox(index));
        const isChecked = await checkbox.isSelected();

        if (isChecked !== checked) {
            await checkbox.click();
            await this.driver.sleep(500);
        }
    }

    async fillTieredOverage(rate) {
        console.log(`📈 Filling tiered overage: ${rate}`);
        const input = await this.driver.findElement(this.selectors.tieredOverageInput);
        await input.clear();
        await input.sendKeys(rate.toString());
    }

    async fillTieredGrace(buffer) {
        console.log(`🎁 Filling tiered grace: ${buffer}`);
        const input = await this.driver.findElement(this.selectors.tieredGraceInput);
        await input.clear();
        await input.sendKeys(buffer.toString());
    }

    async setNoUpperLimit(checked) {
        console.log(`♾️ Setting no upper limit: ${checked}`);
        const checkbox = await this.driver.findElement(this.selectors.noUpperLimitCheckbox);
        const isChecked = await checkbox.isSelected();

        if (isChecked !== checked) {
            await checkbox.click();
            await this.driver.sleep(500);
        }
    }

    // --- Stairstep ---

    async addStair() {
        console.log('➕ Adding stair');
        const addButton = await this.driver.findElement(this.selectors.addStairButton);
        await addButton.click();
        await this.driver.sleep(500);
    }

    async fillStairFrom(index, value) {
        console.log(`🪜 Filling stair ${index} from: ${value}`);
        const input = await this.driver.findElement(this.selectors.stairFromInput(index));
        await input.clear();
        await input.sendKeys(value.toString());
    }

    async fillStairTo(index, value) {
        console.log(`🪜 Filling stair ${index} to: ${value}`);
        const input = await this.driver.findElement(this.selectors.stairToInput(index));
        await input.clear();
        await input.sendKeys(value.toString());
    }

    async fillStairCost(index, cost) {
        console.log(`💵 Filling stair ${index} cost: ${cost}`);
        const input = await this.driver.findElement(this.selectors.stairCostInput(index));
        await input.clear();
        await input.sendKeys(cost.toString());
    }

    async setStairUnlimited(index, checked) {
        console.log(`♾️ Setting stair ${index} unlimited: ${checked}`);
        const checkbox = await this.driver.findElement(this.selectors.stairUnlimitedCheckbox(index));
        const isChecked = await checkbox.isSelected();

        if (isChecked !== checked) {
            await checkbox.click();
            await this.driver.sleep(500);
        }
    }

    // ==================== STEP 4: EXTRAS ====================

    async expandSection(sectionName) {
        console.log(`📂 Expanding section: ${sectionName}`);
        const header = await this.driver.findElement(this.selectors.sectionHeader(sectionName));
        await header.click();
        await this.driver.sleep(500);
    }

    // --- Setup Fee ---

    async expandSetupFee() {
        await this.expandSection('Setup Fee');
    }

    async fillSetupFee(amount) {
        console.log(`💵 Filling setup fee: ${amount}`);
        const input = await this.driver.findElement(this.selectors.setupFeeInput);
        await input.clear();
        await input.sendKeys(amount.toString());
    }

    async fillSetupTiming(timing) {
        console.log(`⏰ Filling setup timing: ${timing}`);
        const input = await this.driver.findElement(this.selectors.setupTimingInput);
        await input.clear();
        await input.sendKeys(timing.toString());
    }

    async fillSetupInvoiceDesc(desc) {
        console.log(`📄 Filling setup invoice description`);
        const textarea = await this.driver.findElement(this.selectors.setupInvoiceDescTextarea);
        await textarea.clear();
        await textarea.sendKeys(desc);
    }

    // --- Discounts ---

    async expandDiscounts() {
        await this.expandSection('Discount');
    }

    async selectDiscountType(type) {
        console.log(`🏷️ Selecting discount type: ${type}`);
        const select = await this.driver.findElement(this.selectors.discountTypeSelect);
        await select.click();
        const option = await select.findElement(By.css(`option[value="${type}"]`));
        await option.click();
    }

    async fillDiscountPercent(percent) {
        console.log(`📊 Filling discount percent: ${percent}`);
        const input = await this.driver.findElement(this.selectors.discountPercentInput);
        await input.clear();
        await input.sendKeys(percent.toString());
    }

    async fillDiscountFlat(amount) {
        console.log(`💵 Filling discount flat: ${amount}`);
        const input = await this.driver.findElement(this.selectors.discountFlatInput);
        await input.clear();
        await input.sendKeys(amount.toString());
    }

    async fillDiscountEligibility(text) {
        console.log(`✅ Filling discount eligibility`);
        const input = await this.driver.findElement(this.selectors.discountEligibilityInput);
        await input.clear();
        await input.sendKeys(text);
    }

    async fillDiscountDates(startDate, endDate) {
        console.log(`📅 Filling discount dates: ${startDate} - ${endDate}`);
        const startInput = await this.driver.findElement(this.selectors.discountStartDateInput);
        await startInput.clear();
        await startInput.sendKeys(startDate);

        const endInput = await this.driver.findElement(this.selectors.discountEndDateInput);
        await endInput.clear();
        await endInput.sendKeys(endDate);
    }

    // --- Freemium ---

    async expandFreemium() {
        await this.expandSection('Freemium');
    }

    async selectFreemiumType(type) {
        console.log(`🎁 Selecting freemium type: ${type}`);
        const select = await this.driver.findElement(this.selectors.freemiumTypeSelect);
        await select.click();
        const option = await select.findElement(By.css(`option[value="${type}"]`));
        await option.click();
    }

    async fillFreemiumUnits(units) {
        console.log(`🔢 Filling freemium units: ${units}`);
        const input = await this.driver.findElement(this.selectors.freemiumUnitsInput);
        await input.clear();
        await input.sendKeys(units.toString());
    }

    async fillFreemiumTrialDuration(days) {
        console.log(`📆 Filling trial duration: ${days} days`);
        const input = await this.driver.findElement(this.selectors.freemiumTrialDurationInput);
        await input.clear();
        await input.sendKeys(days.toString());
    }

    async fillFreemiumDates(startDate, endDate) {
        console.log(`📅 Filling freemium dates: ${startDate} - ${endDate}`);
        const startInput = await this.driver.findElement(this.selectors.freemiumStartDateInput);
        await startInput.clear();
        await startInput.sendKeys(startDate);

        const endInput = await this.driver.findElement(this.selectors.freemiumEndDateInput);
        await endInput.clear();
        await endInput.sendKeys(endDate);
    }

    // --- Minimum Commitment ---

    async expandMinimumCommitment() {
        await this.expandSection('Minimum Commitment');
    }

    async fillMinimumUsage(usage) {
        console.log(`📊 Filling minimum usage: ${usage}`);
        const input = await this.driver.findElement(this.selectors.minimumUsageInput);
        await input.clear();
        await input.sendKeys(usage.toString());
    }

    async fillMinimumCharge(charge) {
        console.log(`💵 Filling minimum charge: ${charge}`);
        const input = await this.driver.findElement(this.selectors.minimumChargeInput);
        await input.clear();
        await input.sendKeys(charge.toString());
    }

    // ==================== STEP 5: REVIEW ====================

    async getReviewSummary() {
        console.log('📋 Getting review summary');
        const cards = await this.driver.findElements(this.selectors.reviewCard);
        const summary = [];

        for (const card of cards) {
            try {
                const rows = await card.findElements(this.selectors.reviewRow);
                const cardData = {};

                for (const row of rows) {
                    const label = await row.findElement(By.css('label'));
                    const span = await row.findElement(By.css('span'));
                    const key = await label.getText();
                    const value = await span.getText();
                    cardData[key] = value;
                }

                summary.push(cardData);
            } catch (error) {
                continue;
            }
        }

        return summary;
    }

    async clickEstimateRevenue() {
        console.log('💹 Clicking Estimate Revenue');
        const button = await this.driver.findElement(this.selectors.estimateRevenueButton);
        await button.click();
        await this.driver.sleep(1000);
    }

    async isEstimatorModalOpen() {
        try {
            await this.driver.findElement(this.selectors.estimatorModal);
            return true;
        } catch (error) {
            return false;
        }
    }

    // ==================== VALIDATION ====================

    async getErrors() {
        const elements = await this.driver.findElements(this.selectors.errorMsg);
        const errors = [];

        for (const el of elements) {
            try {
                const text = await el.getText();
                if (text && text.trim()) {
                    errors.push(text.trim());
                }
            } catch (error) {
                continue;
            }
        }

        return errors;
    }

    async hasError(message) {
        const errors = await this.getErrors();
        return errors.some(err => err.includes(message));
    }

    async waitForError() {
        try {
            await this.driver.wait(until.elementLocated(this.selectors.errorMsg), 3000);
            return true;
        } catch (error) {
            return false;
        }
    }

    // ==================== DRAFT MANAGEMENT ====================

    async resumeDraft(planName) {
        console.log(`📂 Resuming draft: ${planName}`);
        const resumeButton = await this.driver.findElement(this.selectors.resumeDraftButton(planName));
        await resumeButton.click();
        await this.waitForWizardLoad();
    }

    async getDraftPlans() {
        console.log('📋 Getting draft plans');
        const draftRows = await this.driver.findElements(this.selectors.draftPlanRow);
        const drafts = [];

        for (const row of draftRows) {
            try {
                const nameElement = await row.findElement(By.css('.rate-plan-name'));
                const name = await nameElement.getText();
                drafts.push(name);
            } catch (error) {
                continue;
            }
        }

        return drafts;
    }

    // ==================== UTILITY ====================

    async takeScreenshot(filename) {
        try {
            const fs = require('fs');
            const path = require('path');
            const screenshot = await this.driver.takeScreenshot();
            const dir = path.join(__dirname, '..', 'screenshots');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, filename), screenshot, 'base64');
            console.log(`📸 Screenshot saved: ${filename}`);
        } catch (error) {
            console.log('❌ Failed to take screenshot:', error.message);
        }
    }

    async getCurrentUrl() {
        return await this.driver.getCurrentUrl();
    }

    async getPageTitle() {
        return await this.driver.getTitle();
    }

    async waitForNotification(type = 'success') {
        try {
            await this.driver.wait(until.elementLocated(this.selectors.successNotification), 5000);
            const notification = await this.driver.findElement(this.selectors.successNotification);
            return await notification.getText();
        } catch (error) {
            return null;
        }
    }
}

module.exports = RatePlanWizardPage;
