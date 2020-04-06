<script>
  import Spinner from "svelte-spinner";
  export let size = 60;
  export let style = "";
  export let color = "#319ed7";
</script>

<Spinner {size} {style} speed="750" {color} thickness={4} gap="20" />
