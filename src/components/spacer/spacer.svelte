<script lang="ts">
  export let className = "";
  export let noFill: boolean = false;
</script>

<div class="{!noFill ? 'filler' : 'no-fill'} {className}" />
