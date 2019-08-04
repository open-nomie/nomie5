<script>
  // svelte
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  export let activeIndex = undefined;
  export let activeClass = "active";
  export let className = null;

  // Locals
  let wrapper;
  let scroller;

  // consts
  const dispatch = createEventDispatcher();

  const methods = {
    init() {
      for (let i = 0; i < wrapper.children.length; i++) {
        let child = wrapper.children[i];
        child.addEventListener("click", event => {
          let selectedIndex = Array.prototype.indexOf.call(
            wrapper.children,
            event.target
          );
          methods.selectIndex(selectedIndex);
        });
      }
    },
    clearSelected() {
      if (activeIndex > -1) {
        wrapper.children[activeIndex].classList.remove(activeClass);
      }
    },
    selectIndex(index) {
      methods.clearSelected();
      activeIndex = index;
      try {
        let child = wrapper.children[activeIndex];
        let parentOffset = wrapper.offsetLeft;
        let childEnd = child.offsetLeft - parentOffset;
        scroller.scrollTo(childEnd - child.offsetWidth * 0.5, 0);
        child.classList.add(activeClass);
      } catch (e) {
        console.log("error", e.message);
      }
    }
  };
  onMount(() => {
    methods.init();
    if (activeIndex) {
      methods.selectIndex(activeIndex);
    }
  });
</script>

<style lang="scss">
  .n-hscroller {
    white-space: nowrap;
    overflow: scroll;
    scroll-behavior: smooth;
  }
  .n-hscroller .wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: none;
    align-items: center;
  }
</style>

<div class="n-hscroller {className}" bind:this={scroller}>
  <div class="wrapper" bind:this={wrapper}>
    <slot />
  </div>
</div>
