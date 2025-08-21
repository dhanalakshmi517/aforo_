import { defineConfig } from 'vitest/config';

// Exclude e2e Cypress/Playwright-style specs so Vitest only runs unit tests
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['app/src/**/*.test.{ts,tsx}'], // only our unit tests
    exclude: [
      '**/node_modules/**', // skip all node_modules anywhere
      'e2e-tests/**',
    ],
    globals: true,
  },
});
