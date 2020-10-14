<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import appConfig from "../../config/appConfig";
  import tick from "../../utils/tick/tick";
  import NButtonGroup from "../button-group/button-group.svelte";
  import Button from "../button/button.svelte";

  const dispatch = createEventDispatcher();

  export let score = 0;
  export let className = "";
  export let style = "";
  export let size = "md";

  async function onChange(sc) {
    score = sc;
    await tick(200);
    dispatch("change", score);
  }
</script>

<style>
  .n-positivity-selector {
    border-radius: 20px;
  }

  :global(.n-positivity-selector .nbtn.active) {
    box-shadow: var(--box-shadow-float);
  }
  :global(.n-positivity-selector .nbtn.sm) {
    font-size: 24px;
  }
  :global(.n-positivity-selector .nbtn.md) {
    font-size: 30px;
  }

  :global(.n-positivity-selector .nbtn.lg) {
    font-size: 36px;
  }
</style>

<div class="n-positivity-selector bg-solid box-shadow n-row {className} size-{size}" {style}>
  {#each appConfig.positivity as posEmoji}
    <Button
      on:click={() => {
        onChange(posEmoji.score);
      }}
      {size}
      style="padding:0"
      shape="circle"
      color="transparent"
      className={score == posEmoji.score ? 'active' : 'inactive'}>
      {posEmoji.emoji}
    </Button>
  {/each}
</div>
