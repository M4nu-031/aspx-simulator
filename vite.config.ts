/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// On GitHub Pages the app lives under /<repo-name>/. The deploy workflow sets
// BASE_PATH from the repository name; locally it defaults to "/".
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: { chunkSizeWarningLimit: 3000 },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
