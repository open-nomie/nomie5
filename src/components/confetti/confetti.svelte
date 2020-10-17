<script lang="ts">
  // Pulled from https://svelte.dev/tutorial/congratulations
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { Interact } from "../../store/interact";

  const characters = ["🥳", "🎉", "✨", "🔅"];

  let confetti: Array<any> = new Array(100)
    .fill(0)
    .map((_, i) => {
      return {
        character: characters[i % characters.length],
        x: Math.random() * 100,
        y: -20 - Math.random() * 100,
        r: 0.1 + Math.random() * 1,
      };
    })
    .sort((a, b) => a.r - b.r);

  onMount(() => {
    let frame;

    function loop() {
      frame = requestAnimationFrame(loop);

      confetti = confetti.map((emoji) => {
        emoji.y += 0.7 * emoji.r;
        if (emoji.y > 120) emoji.y = -20;
        return emoji;
      });
    }

    loop();

    return () => cancelAnimationFrame(frame);
  });
</script>

<style>
  :global(.confetti) {
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

<div class="confetti" transition:fade>
  {#each confetti as c}
    <span style="left: {c.x}%; top: {c.y}%; transform: scale({c.r})">{c.character}</span>
  {/each}
</div>
