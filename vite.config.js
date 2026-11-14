import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Expose only prefixes intentionally used for public client-side configuration.
  // The existing Vercel project stores the resume link as NEXT_PUBLIC_RESUME_URL.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: { host: '0.0.0.0' },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'three-bundle';
          }
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) {
            return 'motion-bundle';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
});
