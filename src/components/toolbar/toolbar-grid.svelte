<script>
  export let className = "";
  export let style = "";
  import "./toolbar.css";
</script>

<div class="n-toolbar-grid {className}" {style}>
  <div class="left">
    <slot name="left" />
  </div>
  <div class="main truncate">
    <slot name="main" />
    <slot />
  </div>
  <div class="right">
    <slot name="right" />
  </div>
</div>
