import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

export default defineConfig({
  site: 'https://yura9011.github.io',
  base: '/promptfolio',
  output: 'static',
  integrations: [react()],
});