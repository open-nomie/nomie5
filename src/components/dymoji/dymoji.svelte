<script>
  import Dymoji from "./dymoji";

  export let username = undefined;
  export let avatar = undefined;
  export let person = undefined;
  export let size = 42;
  export let radius = 0.12;

  export let className = "";

  let svg = null;
  let img = null;

  const getSVG = term => {
    return new Dymoji(term, {
      size,
      radius
    }).svg();
  };

  $: if (username) {
    svg = getSVG(username);
  } else if (avatar) {
    img = avatar;
  } else if (person) {
    if (person.avatar) {
      img = person.avatar;
    } else {
      svg = getSVG(person.username);
    }
  } else {
    svg = getSVG("unknown");
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
    background-size: cover;
    background-position: center;
  }
</style>

<div
  class="dymoji-wrap {className}"
  style="width:{size}px; height:{size}px; border-radius:{size * radius}px; {img ? `background-image:url(${img})` : ``}">
  {#if svg}
    {@html svg}
  {/if}
</div>
