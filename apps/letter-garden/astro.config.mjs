import { defineConfig } from 'astro/config';

// 'file' output emits results.html so Workers static assets serve /results without a trailing-slash redirect.
export default defineConfig({ build: { format: 'file' } });
