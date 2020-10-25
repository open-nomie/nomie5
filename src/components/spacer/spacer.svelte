<script lang="ts">
  export let className = "";
  export let noFill: boolean = false;
  export let gap = undefined;
</script>

<div class="{!noFill ? 'filler' : 'no-fill'} {className}">
  {#if gap}
    <div class="gap" style="height:{gap * 4}px; width:{gap * 4}px" />
  {/if}
</div>
