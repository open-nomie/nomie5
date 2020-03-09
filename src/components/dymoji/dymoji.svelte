<script>
  import Dymoji from "./dymoji";

  export let username = "?";
  export let size = 42;
  export let radius = 0.12;
  export let emoji = null;
  export let className = "";

  let svg = null;

  $: if (username) {
    svg = new Dymoji(username, {
      size,
      radius
    }).svg();
  } else {
    svg = new Dymoji("unknown", {
      size,
      radius
    }).svg();
  }
</script>

<style lang="scss">
  bc-dymoji {
    display: flex;
  }
  .dymoji-wrap {
    display: inline-flex;
    vertical-align: middle;
    position: relative;
    align-items: center;
    justify-content: center;
  }
</style>

<div class={`dymoji-wrap ${className}`}>
  {@html svg}
</div>
