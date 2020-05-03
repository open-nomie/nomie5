<script>
  import Spinner from "svelte-spinner";
  export let size = 60;
  export let style = "";
  export let speed = 700;
  export let gap = 20;
  export let color = "#319ed7";
</script>

<Spinner {size} {style} {speed} {color} thickness={4} {gap} />
