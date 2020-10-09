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
</style>

<div class="n-positivity-selector bg-solid box-shadow n-row {className} size-{size}" {style}>
  {#each appConfig.positivity as posEmoji}
    <Button
      on:click={() => {
        onChange(posEmoji.score);
      }}
      size="lg"
      shape="round"
      color="transparent"
      className={score == posEmoji.score ? 'active' : 'inactive'}
      style="font-size:32px">
      {posEmoji.emoji}
    </Button>
  {/each}
</div>
