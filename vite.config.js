import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: Object.fromEntries(readdirSync('.').filter(file => file.endsWith('.html')).map(file => [file.replace('.html', ''), resolve(file)])),
    },
  },
});
