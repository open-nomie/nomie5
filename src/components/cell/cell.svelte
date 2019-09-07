<script>
  export let direction = "row";
  export let gap = false;
  export let className = null;
</script>

<div
  class="n-cell d-flex flex-{direction} gap-{gap ? 'true' : 'false'}
  {className}">
  <slot />
</div>
