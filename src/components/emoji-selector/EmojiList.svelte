<script>
  import Emoji from './Emoji.svelte'
  export let name = ''
  export let emojis
</script>

<!-- <h3 class="mb-4 text-xs text-center">{name}</h3> -->
<div class="space-x-1 space-y-1 text-lg">
  {#each emojis as emoji}
    <Emoji {emoji} on:emojihover on:emojiclick />
  {/each}
</div>
