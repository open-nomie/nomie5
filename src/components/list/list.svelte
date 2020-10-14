<script lang="ts">
  export let style: string = "";
  export let solo: boolean = false;
  export let transparent: boolean = false;
  export let className: string = "";
</script>

<div class="n-list {solo ? 'solo' : ''} {transparent ? 'transparent' : ''} {className}" {style}>
  <slot />
</div>
