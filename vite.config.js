import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Expose only prefixes intentionally used for public client-side configuration.
  // The existing Vercel project stores the resume link as NEXT_PUBLIC_RESUME_URL.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: { host: '0.0.0.0' },
});
