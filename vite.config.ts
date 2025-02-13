import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "./celebrationapp/",  // Wichtig für GitHub Pages!
  build: {
    outDir: "docs", // Hier ändern wir den Build-Ordner auf docs/
  }
});
