<script>
  import Spinner from "svelte-spinner";
  export let size = 60;
</script>

<Spinner
  {size}
  speed="750"
  color="#319ed7"
  thickness={Math.round(size * 0.2) + ''}
  gap="40" />
