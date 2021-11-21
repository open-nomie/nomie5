import { defineConfig } from 'vite'
import svelte from '@svitejs/vite-plugin-svelte'
import svelteJsx from "vite-svelte-jsx";

export default defineConfig({
  plugins: [
    svelte()
  ]
})