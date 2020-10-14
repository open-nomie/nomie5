<script lang="ts">
  export let className = "";
  export let style = "";
</script>

<div class="n-row {className}" {style}>
  <slot />
</div>
