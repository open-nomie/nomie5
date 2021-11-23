import { defineConfig } from 'vite'
import svelte from '@svitejs/vite-plugin-svelte'
import sveltePreprocess from "svelte-preprocess";
import { VitePWA } from 'vite-plugin-pwa'
import loadVersion from 'vite-plugin-package-version';
import manifest from './manifest';

export default defineConfig({
  optimizeDeps: { exclude: ["svelte-routing"] },
  plugins: [
    loadVersion(),
    svelte({
      preprocess: sveltePreprocess({
        postcss: true
      })
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: manifest,
    })
  ]
})