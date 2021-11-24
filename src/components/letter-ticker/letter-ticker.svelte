<script lang="ts">
  export let text: string = "";
  export let className: string = "";
  export let style: string = "";

  let items: Array<string> = [];
  let lastItems: Array<string> = [];

  $: if(text) {
    lastItems = items || [];
    items = `${text || ""}`.split("");
  }
</script>

<style lang="postcss" global>
  .letter-ticker {
    white-space: nowrap;
  }
  @keyframes letterUp {
    from {
      transform: translateY(8px);
      opacity: 0.6;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  .letter-up {
    display: inline-block;
    animation: letterUp 0.1s cubic-bezier(0.19, -0.33, 0.78, 1.32);
    -webkit-animation: letterUp 0.1s cubic-bezier(0.19, -0.33, 0.78, 1.32);
  }
</style>

{#if text}
  <span class="letter-ticker {className}" {style}>
    {#each items as bit, index (Math.random())}
      <span
        class={lastItems[index] == bit ? 'letter-stay' : 'letter-up'}>{bit}</span>
    {/each}
  </span>
{/if}
