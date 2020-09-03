<script>
  export let percentage = 0;
  export let className = "";
  export let style = "";
  export let color = "primary-bright";
</script>

<div class="progress {className}" {style}>
  <div class="progress-bar bg-{color}" role="progressbar" style={`width:${percentage}%`} />
</div>
