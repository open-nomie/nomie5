<script>
  // svelte
  import { onMount } from "svelte";

  export let activeIndex = undefined;
  export let activeClass = "active";
  export let className = null;

  // Locals
  let wrapper;
  let scroller;
  let ready = false;

  $: if (activeIndex && ready) {
    methods.selectIndex(activeIndex);
  }

  // Methods
  const methods = {
    init() {
      // looop over children - apply a click event
      if (wrapper && wrapper.children) {
        for (let i = 0; i < wrapper.children.length; i++) {
          let child = wrapper.children[i];
          child.addEventListener("click", (event) => {
            let selectedIndex = Array.prototype.indexOf.call(wrapper.children, event.target);
            methods.selectIndex(selectedIndex);
          });
        }

        scroller.addEventListener(
          "scroll",
          (evt) => {
            scroller.setAttribute("data-scroll", evt.target.scrollLeft);
          },
          { passive: true }
        );

        ready = true;
      }
    },
    // Clear currently selected index
    clearSelected() {
      if (activeIndex > -1 && wrapper.children[activeIndex]) {
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
        let scrollTo = childEnd - child.offsetWidth * 0.5;
        let scrolledAmount = scroller.scrollLeft;

        if (childEnd > scroller.offsetWidth * 0.5) {
          scroller.scrollTo(scrollTo, 0);
        } else if (scrolledAmount > childEnd) {
          scroller.scrollTo(scrollTo, 0);
        }

        child.classList.add(activeClass);
      } catch (e) {}
      ready = true;
    },
  };
  // when component mounts
  onMount(() => {
    setTimeout(() => {
      methods.init();
    }, 10);
  });
</script>

<style lang="scss">
  ::-webkit-scrollbar {
    width: 0px;
    background: transparent;
    display: none;
  }
  .n-hscroller {
    white-space: nowrap;
    overflow-x: scroll;
    overflow-y: hidden;
    scroll-behavior: smooth;
    min-height: 40px;
    max-width: 100%;
  }
  .n-hscroller .wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: none;
    align-items: center;
    min-width: 100%;
  }
</style>

<div class="n-hscroller {className}" data-scroll="0" bind:this={scroller}>
  <div class="wrapper" bind:this={wrapper}>
    <slot />
  </div>
</div>
