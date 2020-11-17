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
  export let transparent = false;
  export let id = undefined;

  async function onChange(sc) {
    score = sc;
    await tick(200);
    dispatch("change", score);
  }
</script>

<style>
  .n-positivity-selector {
    border-radius: 20px;
    padding: 0 6px;
    z-index: 3000;
  }

  :global(.n-positivity-selector .nbtn) {
    opacity: 0.8;
  }
  :global(.n-positivity-selector .nbtn.active) {
    box-shadow: var(--box-shadow-float);
    background-color: var(--color-solid);
    opacity: 1;
  }
  :global(.n-positivity-selector .nbtn-sm) {
    font-size: 20px;
    width: 30px !important;
    height: 30px !important;
    flex-grow: 0;
    flex-shrink: 0;
  }
  :global(.n-positivity-selector .nbtn-md) {
    font-size: 24px;
    width: 36px !important;
    height: 36px !important;
    flex-grow: 0;
    flex-shrink: 0;
  }

  :global(.n-positivity-selector .nbtn-lg) {
    font-size: 30px;
    width: 42px !important;
    height: 42px !important;
    flex-grow: 0;
    flex-shrink: 0;
  }
</style>

<div {id} class="n-positivity-selector {!transparent ? 'box-shadow bg-solid' : 'bg-transparent'} n-row {className} size-{size}" {style}>
  {#each appConfig.positivity as posEmoji}
    <Button
      on:click={() => {
        onChange(posEmoji.score);
      }}
      {size}
      style="padding:0"
      shape="rounded"
      color="transparent"
      className={score == posEmoji.score ? 'active' : 'inactive'}>
      {posEmoji.emoji}
    </Button>
  {/each}
</div>
