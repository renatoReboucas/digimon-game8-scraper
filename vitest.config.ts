import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const nextSource = fileURLToPath(new URL('./next-app/src', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: 'server-only', replacement: `${nextSource}/test/server-only.ts` },
      { find: /^@\//, replacement: `${nextSource}/` },
    ],
  },
  test: {
    setupFiles: ['./next-app/src/test/setup.ts'],
    include: [
      'scrape/test/**/*.test.js',
      'next-app/src/**/*.{test,spec}.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      all: true,
      include: [
        'scrape/src/**/*.js',
        'next-app/src/**/*.{js,jsx,ts,tsx}',
      ],
      exclude: [
        '**/*.test.*',
        '**/*.spec.*',
        'next-app/src/components/ui/**',
        'next-app/src/test/**',
        'next-app/src/types/**',
      ],
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage/monorepo',
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
})