// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://xfan.xyz',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
