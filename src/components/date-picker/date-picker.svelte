<script>
  // vendors
  import dayjs from "dayjs";
  // utils
  import { createEventDispatcher } from "svelte";

  // data
  export let date = dayjs().format("YYYY-MM-DD");

  //consts
  const options = {};
  const dispatch = createEventDispatcher();
</script>

<style type="text/scss" lang="scss">

</style>

<div class="n-date-picker p-3">
  <input
    type="date"
    class="form-control"
    bind:value={date}
    on:change={event => {
      dispatch('change', date);
    }} />
</div>
