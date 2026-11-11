import { defineConfig } from 'astro/config';

// 'file' output, as in the solvers, so Workers static assets serve pages without trailing-slash redirects.
export default defineConfig({ build: { format: 'file' } });
