import { defineConfig } from 'vite'
import svelte from '@svitejs/vite-plugin-svelte'
import svelteJsx from "vite-svelte-jsx";
import sveltePreprocess from "svelte-preprocess";

export default defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        postcss: true
      })
    })
  ]
})