/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
        'src/main.tsx',
        // Admin pages have complex integrations - tested via E2E
        'src/components/admin/**',
        'src/pages/admin/**',
        // Complex pages requiring full app context - tested via E2E
        'src/pages/Checkout.tsx',
        'src/components/pages/StyleGuide.tsx',
        // Page components with heavy API integrations - tested via E2E
        'src/components/pages/Home.tsx',
        'src/components/pages/About.tsx',
        'src/components/pages/Contact.tsx',
        'src/components/pages/PillarPage.tsx',
        // Complex layout components requiring auth integration
        'src/components/layout/AuthModal.tsx',
        // Common components with permission system dependencies
        'src/components/common/PermissionGuard.tsx',
        // Admin settings context - tested in admin tests
        'src/contexts/AdminSettingsContext.tsx',
      ],
      thresholds: {
        // Enterprise-grade thresholds (80%+ coverage)
        lines: 80,
        functions: 75,
        branches: 70,
        statements: 80,
      },
    },
    reporters: ['verbose'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
