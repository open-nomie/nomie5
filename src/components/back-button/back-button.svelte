<script>
  import { createEventDispatcher } from "svelte";
  import { navigate } from "svelte-routing";

  export let to = undefined;

  const dispatch = createEventDispatcher();
  const onClick = event => {
    if (to) {
      navigate(to);
    } else {
      history.back();
    }
    dispatch("click", event);
  };
</script>

<style>
  button {
    margin-left: -4px;
  }
</style>

<button class="btn" on:click={onClick}>
  <i class="zmdi zmdi-arrow-back mr-2 text-lg" />
</button>
