import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, './common'),
    },
  },
  test: {
    include: [
      'client/src/test/**/*.test.ts',
      'server/src/**/*.test.ts',
    ],
  },
});
