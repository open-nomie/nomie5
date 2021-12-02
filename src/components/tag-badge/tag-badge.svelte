<script>
  export let label = undefined;
  export let value = undefined;
  // export let color = undefined;
  export let emoji = undefined;
  export let className = "light";
</script>

<div class="n-tag-badge badge badge-sm {className}">
  {#if emoji}
    <div class="emoji">{emoji}</div>
  {/if}
  {#if label}
    <div class="label">{label}</div>
  {/if}
  {#if value}
    <div class="value">{value}</div>
  {/if}
</div>

<style lang="postcss" global>
  .n-tag-badge {
    @apply inline-flex;
    @apply items-center;

    @apply rounded-full;
    @apply shadow-md;
    @apply px-3;
    @apply py-1;
    @apply text-xs;
  }
  .n-tag-badge.light {
    @apply bg-gray-100 dark:bg-black;
  }

  .n-tag-badge .value {
    display: inline-block;
    padding: 2px 4px 2px;
    background-color: rgba(255, 255, 255, 0.2);
    min-width: 20px;
    border-radius: 20px;
    text-align: center;
    margin-left: 4px;
  }
  .n-tag-badge .emoji {
    margin-right: 3px;
    opacity: 0.7;
  }
</style>
