<script lang="ts">
  // svelte
  import { onDestroy, onMount } from "svelte";
  import { Device } from "../../store/device-store";

  export let activeIndex = undefined;
  export let activeClass: string = "active";
  export let className: string = "";
  export let centerIfPossible: boolean = false;

  // Locals
  let wrapper;
  let scroller;
  let ready = false;
  let centered = false;

  $: if (activeIndex && ready) {
    methods.selectIndex(activeIndex);
  }

  $: if ($Device.width) {
    console.log("Check For Center? Now?");
    methods.checkForCenter();
  }

  let scrollUnsub;

  // Methods
  const methods = {
    checkForCenter() {
      if (centerIfPossible && wrapper) {
        console.log("Checking for center");
        let width = wrapper.offsetWidth;
        let scrollWidth = wrapper.scrollWidth;
        if (scrollWidth > width) {
          centered = false;
        } else {
          centered = true;
        }
      } else {
        centered = false;
      }
    },
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

      methods.checkForCenter();
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

        setTimeout(() => {
          if (scroller) {
            if (childEnd > scroller.offsetWidth * 0.5) {
              scroller.scrollTo(scrollTo, 0);
            } else if (scrolledAmount > childEnd) {
              scroller.scrollTo(scrollTo, 0);
            }
            child.classList.add(activeClass);
          }
          methods.checkForCenter();
        }, 60);
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

  onDestroy(() => {
    scroller.removeEventListener("scroll", () => {});
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
    height: 40px;
    max-width: 100%;
  }
  .n-hscroller .wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: none;
    align-items: center;
    min-width: 100%;
    height: 100%;
  }
  .n-hscroller .wrapper.force-center {
    justify-content: center;
    align-items: center;
  }
</style>

<div class="n-hscroller {className}" data-scroll="0" bind:this={scroller}>
  <div class="wrapper {centered ? 'force-center' : 'no-force'}" bind:this={wrapper}>
    <slot />
  </div>
</div>
