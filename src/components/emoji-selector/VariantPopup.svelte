<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Icon from '../icon/icon.svelte'
  import Emoji from './Emoji.svelte'

  export let variants: any

  const dispatch = createEventDispatcher()

  function onClickClose() {
    dispatch('close')
  }

  function onClickContainer(event?: any) {
    dispatch('close', event)
  }
</script>

<style lang="postcss" global>
  .svelte-emoji-picker__variants-container {
    position: absolute;
    top: 0;
    left: 0;
    @apply w-full;
    @apply h-full;
    @apply flex;
    @apply flex-col;
    @apply justify-center;
  }

  .svelte-emoji-picker__variants {
    @apply relative;
    @apply mx-4;
    @apply p-2;
    @apply text-center;
    @apply rounded-lg;
    @apply bg-white dark:bg-black;
    @apply shadow-xl;
    @apply z-50;
  }

  .svelte-emoji-picker__variants button {
    @apply m-1;
  }

  .svelte-emoji-picker__variants .close-button {
    position: absolute;
    font-size: 1em;
    right: 20px;
    top: 10px;
    cursor: pointer;
  }
</style>

<div
  class="svelte-emoji-picker__variants-container frosted"
  on:click={onClickContainer}>
  <div class="svelte-emoji-picker__variants">
    {#each Object.keys(variants) as variant}
      <Emoji emoji={variants[variant]} on:emojiclick />
    {/each}
    <div class="close-button" role="button" on:click={onClickClose}>
      <Icon name="close" />
    </div>
  </div>
</div>
