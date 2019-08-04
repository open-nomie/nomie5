<script>
  // svelte
  import { onMount } from "svelte";

  export let activeIndex = undefined;
  export let activeClass = "active";
  export let className = null;

  // Locals
  let wrapper;
  let scroller;

  // Methods
  const methods = {
    init() {
      // looop over children - apply a click event
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
    // Clear currently selected index
    clearSelected() {
      if (activeIndex > -1) {
        wrapper.children[activeIndex].classList.remove(activeClass);
      }
    },
    // Select new item
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
  // when component mounts
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
    min-width: 100%;
  }
</style>

<div class="n-hscroller {className}" bind:this={scroller}>
  <div class="wrapper" bind:this={wrapper}>
    <slot />
  </div>
</div>
