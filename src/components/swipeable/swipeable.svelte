<script lang="ts">
  import { createEventDispatcher } from "svelte";

  /** based on Ionics Item-slider https://github.com/ionic-team/ionic-framework/blob/master/core/src/components/item-sliding/item-sliding.tsx */
  import { pan } from "svelte-hammer";

  const dispatch = createEventDispatcher();
  const SWIPE_MARGIN = 30;
  const ELASTIC_FACTOR = 0.55;

  const enum ItemSide {
    None = 0,
    Start = 1 << 0,
    End = 1 << 1,
    Both = Start | End,
  }

  const enum SlidingState {
    Disabled = 1 << 1,
    Enabled = 1 << 2,
    End = 1 << 3,
    Start = 1 << 4,
    SwipeEnd = 1 << 5,
    SwipeStart = 1 << 6,
  }

  let openSlidingItem: HTMLElement | undefined;
  let item: HTMLElement | null = null;
  let el: HTMLElement | null = null;
  let openAmount = 0;
  let initialOpenAmount = 0;
  let optsWidthRightSide = 70;
  let optsWidthLeftSide = 70;
  let sides = ItemSide.Both;
  let tmr: number | undefined;
  let state: SlidingState = SlidingState.Disabled;
  let leftOptions: any;
  let rightOptions: any;
  let optsDirty = true;

  interface HammerGesture {
    deltaX: number;
    deltaY: number;
    velocityX: number;
  }

  async function closeOpened(): Promise<boolean> {
    if (openSlidingItem !== undefined) {
      // openSlidingItem.close();
      openSlidingItem = undefined;
      return true;
    }
    return false;
  }

  function isLeftOrRight(gesture: HammerGesture) {
    const yabs = Math.abs(gesture.deltaY);
    const xabs = Math.abs(gesture.deltaX);

    const noY = yabs < 5;
    const hasX = xabs > 0;

    return noY && hasX;
  }

  function onStart(gesture: HammerGesture) {
    if (isLeftOrRight(gesture)) {
      openSlidingItem = el;

      if (tmr !== undefined) {
        clearTimeout(tmr);
        tmr = undefined;
      }
      if (openAmount === 0) {
        optsDirty = true;
        state = SlidingState.Enabled;
      }
      initialOpenAmount = openAmount;
      if (item) {
        item.style.transition = "none";
      }
    }
  }

  function getGesture(evt: CustomEvent): HammerGesture {
    return evt.detail;
  }

  function onMove(gesture: HammerGesture) {
    if (isLeftOrRight(gesture)) {
      if (optsDirty) {
        calculateOptsWidth();
      }
      let openAmount = initialOpenAmount - gesture.deltaX;

      // switch (sides) {
      //   case ItemSide.End:
      //     openAmount = Math.max(0, openAmount);
      //     break;
      //   case ItemSide.Start:
      //     openAmount = Math.min(0, openAmount);
      //     break;
      //   case ItemSide.Both:
      //     break;
      //   case ItemSide.None:
      //     return;
      //   default:
      //     break;
      // }

      let optsWidth;
      if (openAmount > optsWidthRightSide) {
        optsWidth = optsWidthRightSide;
        openAmount = optsWidth + (openAmount - optsWidth) * ELASTIC_FACTOR;
      } else if (openAmount < -optsWidthLeftSide) {
        optsWidth = -optsWidthLeftSide;
        openAmount = optsWidth + (openAmount - optsWidth) * ELASTIC_FACTOR;
      }

      setOpenAmount(openAmount, false);
    }
  }

  function onEnd(gesture: HammerGesture) {
    const velocity = gesture.velocityX;
    const deltaX = Math.abs(gesture.deltaX);

    let restingPoint = openAmount > 0 ? optsWidthRightSide : -optsWidthLeftSide;

    // Check if the drag didn't clear the buttons mid-point
    // and we aren't moving fast enough to swipe open
    const isResetDirection = openAmount > 0 === !(velocity < 0);
    const isMovingFast = Math.abs(velocity) > 0.3;
    const isOnCloseZone = Math.abs(openAmount) < Math.abs(restingPoint / 2);
    if (swipeShouldReset(isResetDirection, isMovingFast, isOnCloseZone)) {
      restingPoint = 0;
    }
    const movement = Math.abs(((el.offsetWidth - deltaX) / el.offsetWidth) * 100 - 100);
    const dir = gesture.deltaX < 0 ? "left" : "right";
    setOpenAmount(0, true);
    if (movement > 30) {
      if (dir == "left") {
        dispatch("left");
      } else {
        dispatch("right");
      }
    }
  }

  function calculateOptsWidth() {
    optsWidthRightSide = 70;
    if (rightOptions) {
      rightOptions.style.display = "flex";
      optsWidthRightSide = rightOptions.offsetWidth;
      rightOptions.style.display = "";
    }

    optsWidthLeftSide = 70;
    if (leftOptions) {
      leftOptions.style.display = "flex";
      optsWidthLeftSide = leftOptions.offsetWidth;
      leftOptions.style.display = "";
    }

    optsDirty = false;
  }

  function setOpenAmount(openAmount: number, isFinal: boolean) {
    if (tmr !== undefined) {
      clearTimeout(tmr);
      tmr = undefined;
    }
    if (!el) {
      return;
    }
    const style = el.style;
    openAmount = openAmount;

    if (isFinal) {
      style.transition = "";
    }

    if (openAmount > 0) {
      state = openAmount >= optsWidthRightSide + SWIPE_MARGIN ? SlidingState.End | SlidingState.SwipeEnd : SlidingState.End;
      openAmount = openAmount > 80 ? 80 : openAmount;
    } else if (openAmount < 0) {
      state = openAmount <= -optsWidthLeftSide - SWIPE_MARGIN ? SlidingState.Start | SlidingState.SwipeStart : SlidingState.Start;
      openAmount = openAmount < -80 ? -80 : openAmount;
    } else {
      tmr = setTimeout(() => {
        state = SlidingState.Disabled;
        tmr = undefined;
      }, 600) as any;

      openSlidingItem = undefined;
      style.transform = "";
      style.opacity = "1";
      return;
    }

    style.transform = `translate3d(${-openAmount}px,0,0)`;
    style.opacity = `${(80 - Math.abs(openAmount)) / 80 + 0.3 || 0.3}`;

    // ionDrag.emit({
    //   amount: openAmount,
    //   ratio: getSlidingRatioSync(),
    // });
  }

  function getSlidingRatioSync(): number {
    if (openAmount > 0) {
      return openAmount / optsWidthRightSide;
    } else if (openAmount < 0) {
      return openAmount / optsWidthLeftSide;
    } else {
      return 0;
    }
  }

  const swipeShouldReset = (isResetDirection: boolean, isMovingFast: boolean, isOnResetZone: boolean): boolean => {
    // The logic required to know when the sliding item should close (openAmount=0)
    // depends on three booleans (isResetDirection, isMovingFast, isOnResetZone)
    // and it ended up being too complicated to be written manually without errors
    // so the truth table is attached below: (0=false, 1=true)
    // isResetDirection | isMovingFast | isOnResetZone || shouldClose
    //         0        |       0      |       0       ||    0
    //         0        |       0      |       1       ||    1
    //         0        |       1      |       0       ||    0
    //         0        |       1      |       1       ||    0
    //         1        |       0      |       0       ||    0
    //         1        |       0      |       1       ||    1
    //         1        |       1      |       0       ||    1
    //         1        |       1      |       1       ||    1
    // The resulting expression was generated by resolving the K-map (Karnaugh map):
    return (!isMovingFast && isOnResetZone) || (isResetDirection && isMovingFast);
  };

  /**
   * Given an optional side, return the ion-item-options element.
   *
   * @param side This side of the options to get. If a side is not provided it will
   * return the first one available.
   */
  // function getOptions(side?: string): any | undefined {
  //   if (side === undefined) {
  //     return leftOptions || rightOptions;
  //   } else if (side === "start") {
  //     return leftOptions;
  //   } else {
  //     return rightOptions;
  //   }
  // }

  // async function updateOptions() {
  //   const options = el.querySelectorAll("ion-item-options");

  //   // Reset left and right options in case they were removed
  //   leftOptions = rightOptions = undefined;

  //   for (let i = 0; i < options.length; i++) {
  //     // const option = await options.item(i).componentOnReady();
  //     let side = "start";
  //     let option = undefined;
  //     // const side = isEndSide(option.side) ? 'end' : 'start';

  //     if (side === "start") {
  //       leftOptions = option;
  //       sides |= ItemSide.Start;
  //     } else {
  //       rightOptions = option;
  //       sides |= ItemSide.End;
  //     }
  //   }
  //   optsDirty = true;
  //   sides = sides;
  // }

  // function canStart(gesture: any): boolean {
  //   /**
  //    * If very close to start of the screen
  //    * do not open left side so swipe to go
  //    * back will still work.
  //    */
  //   const rtl = document.dir === "rtl";
  //   const atEdge = rtl ? window.innerWidth - gesture.startX < 15 : gesture.startX < 15;
  //   if (atEdge) {
  //     return false;
  //   }

  //   const selected = openSlidingItem;
  //   if (selected && selected !== el) {
  //     closeOpened();
  //     return false;
  //   }

  //   return !!(rightOptions || leftOptions);
  // }
</script>

<style>
  .swipeable {
    position: relative;
    flex-grow: 1;
    overflow-x: hidden;
  }

  .swipeable .swipeable--item {
    z-index: 120;
    position: relative;
  }
  :global(.swipeable > div[slot="right"]) {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
  }
  :global(.swipeable > div[slot="left"]) {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
  }
</style>

<div
  bind:this={item}
  use:pan
  on:panstart={(evt) => {
    onStart(getGesture(evt));
  }}
  on:panleft={(evt) => {
    onMove(getGesture(evt));
  }}
  on:panright={(evt) => {
    onMove(getGesture(evt));
  }}
  on:panend={(evt) => {
    onEnd(getGesture(evt));
  }}
  class="swipeable {state !== SlidingState.Disabled ? 'item-sliding-active-slide' : ''}">
  <slot name="left" />
  <div class="swipeable--item" bind:this={el}>
    <slot />
  </div>
  <slot name="right" />
</div>
