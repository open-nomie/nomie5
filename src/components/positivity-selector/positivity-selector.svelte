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

<style global lang="postcss">
  .n-positivity-selector {
    @apply rounded-2xl;
    @apply shadow-2xl;
    @apply z-50;
    @apply bg-white;
    @apply dark:bg-black;
    @apply p-0;
  }

  .n-positivity-selector .nbtn {
    opacity: 0.8;
  }
  .n-positivity-selector .nbtn.active {
    @apply shadow-lg;
    @apply bg-white;
    @apply dark:bg-black;
    @apply opacity-100;
    @apply ring-2;
    @apply ring-blue-500;
    @apply ring-opacity-40;
  }
  .n-positivity-selector .nbtn-sm {
    font-size: 20px;
    width: 30px !important;
    height: 30px !important;
  }
  .n-positivity-selector .nbtn-md {
    font-size: 24px;
    width: 36px !important;
    height: 36px !important;
  }

  .n-positivity-selector .nbtn {
    @apply flex-grow-0;
    @apply flex-shrink-0;
  }

  .n-positivity-selector .nbtn-lg {
    font-size: 30px;
    width: 42px !important;
    height: 42px !important;

  }
</style>

<div {id} class="n-positivity-selector {!transparent ? 'box-shadow bg-solid' : 'bg-transparent'} flex items-center {className} size-{size}" {style}>
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
