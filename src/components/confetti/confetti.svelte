<script lang="ts">
  import { showConfetti } from './ConfettiStore'
  // Pulled from https://svelte.dev/tutorial/congratulations
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'

  onMount(() => {
    showConfetti()
  })
</script>

<style global>
  .confetti {
    pointer-events: none;
    z-index: 5000;
    overflow: hidden;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .confetti span {
    position: absolute;
    font-size: 8vw;
  }
</style>

<canvas class="confetti" id="confetti" transition:fade>
  <!-- {#each confetti as c}
    <span style="left: {c.x}%; top: {c.y}%; transform: scale({c.r})">
      {c.character}
    </span>
  {/each} -->
</canvas>
