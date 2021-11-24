<script lang="ts">
  import { onMount } from 'svelte'
  import Error404 from './routes/Error404.svelte'

  export let route: string
  let dynamicPage = null

  onMount(async () => {
    try {
      dynamicPage = (await import(`./routes/${route}.svelte`)).default
    } catch (e) {
      // Handle errors if the dynamic route doesn't load:
      dynamicPage = Error404
    }
  })
</script>

<svelte:component this={dynamicPage} />
