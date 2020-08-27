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
  export const size = "md";

  async function onChange(sc) {
    score = sc;
    await tick(200);
    dispatch("change", score);
  }
</script>

<style>
  :global(.n-positivity-selector) {
    height: 50px;
    border-radius: 25px;
    padding: 2px;
    width: 250px;
  }

  :global(.n-positivity-selector .btn) {
    height: 50px;
    width: 50px;
    border-radius: 25px;
    padding: 2px;
    border: solid 1px transparent;
    background-color: var(--color-solid);
  }
  :global(.n-positivity-selector .btn.inactive) {
    transform: scale(0.7);
    opacity: 0.8;
  }
  :global(.n-positivity-selector .btn.active) {
    border: solid 1px var(--color-primary-bright);
    box-shadow: var(--box-shadow-tight);
  }
</style>

<div class="n-positivity-selector bg-solid box-shadow n-row {className}">
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
