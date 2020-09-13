<script>
  import Icon from "../../components/icon/icon.svelte";

  // svelte
  import { createEventDispatcher } from "svelte";

  import TrackerBall from "../../components/tracker-ball/tracker-ball.svelte";

  // modules
  import Tracker from "../../modules/tracker/tracker";
  import TimeBalls from "../../components/time-balls/time-balls.svelte";

  // Components
  import Counter from "../../components/counter/counter.svelte";
  import { Interact } from "../../store/interact";
  import { TrackerStore } from "../../store/tracker-store";

  // Props
  export let tracker = new Tracker();
  export let value = null;
  // export let refreshing = false;
  export let id = undefined;
  export let className = undefined;
  export let disabled = undefined;
  export let hoursUsed = [];
  // export let hideMore = false;
  // export let lastUsed = null; // or dayjs object
  export let positivity = 0;

  // Define Dispatch
  const dispatch = createEventDispatcher();

  let data = {
    pressing: false,
  };

  let timeout = null;
  // Functions
  const methods = {
    // Clicked
    click() {
      dispatch("click", {});
    },
    moreClicked(evt) {
      evt.stopPropagation();
      evt.preventDefault();

      methods.longPress();
    },
    rightclick(evt) {
      evt.preventDefault();
      return false;
    },
    longPress() {
      dispatch("longpress", {});
    },
    // On Mouse Release / Touch Stop
    mouseup() {
      data.pressing = false;
    },
    mousedown() {
      data.pressing = true;
    },
  };
</script>

<style lang="scss" type="text/scss">
  :global(.tracker-button-wrapper .more) {
    position: absolute;
    top: 18px;
    right: 20px;
    z-index: 1400;
    padding: 0px;
    height: 25px;
    border-radius: 12px;
  }
  :global(.tracker-button-wrapper .more svg) {
    stroke: var(--color-solid-2) !important;
  }
  .tracker-ball {
    svg {
      display: none;
    }
    .countdown {
      z-index: 202;
      font-size: 1rem;
    }
  }
  .tracker-button-wrapper {
    border-radius: 40px;
    position: relative;
  }
  // Moved to /scss/components/_tracker-button.scss
</style>

<div
  on:click={methods.click}
  on:longtap={methods.longPress}
  on:mousedown={methods.mousedown}
  on:touchend={methods.mouseup}
  on:contextmenu={methods.rightclick}
  on:mouseout={methods.mouseup}
  on:mouseup={methods.mouseup}
  class="tracker-button-wrapper tracker-{tracker.tag}
  {data.pressing ? 'pressing' : ''}
  {className}
  {disabled ? 'disabled' : ''}">
  <!-- <button
    class="btn btn-clear more"
    on:click|preventDefault={(evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      TrackerStore.trackerOptions(tracker);
    }}>
    <Icon name="pieChart" size="16" />
  </button> -->
  <TrackerBall {id} {tracker} score={value} {positivity}>
    {#if tracker.started}
      <div class="center countdown">
        <Counter started={tracker.started} />
      </div>
    {/if}
    {#if hoursUsed.length}
      <div class="balls">
        <TimeBalls hours={hoursUsed} />
      </div>
    {/if}
    {#if tracker.one_tap}
      <div class="one-tap" />
    {/if}
  </TrackerBall>

</div>
<!-- last.log.end -->
