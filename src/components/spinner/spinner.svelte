<script>
  import Spinner from "svelte-spinner";
  export let size = 60;
  export let style = "";
</script>

<Spinner {size} {style} speed="750" color="#319ed7" thickness={4} gap="20" />
