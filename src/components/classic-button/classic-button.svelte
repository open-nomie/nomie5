<script>
  import Icon from "../icon/icon.svelte";

  // svelte
  import { createEventDispatcher } from "svelte";

  // modules
  import Tracker from "../../modules/tracker/tracker";
  import TimeBalls from "../time-balls/time-balls.svelte";

  // Components
  import Counter from "../counter/counter.svelte";
  import { Interact } from "../../store/interact";
  import { TrackerStore } from "../../store/tracker-store";
  import { UserStore } from "../../store/user-store";
  import ScorePill from "./score-pill.svelte";
  import Ball from "./ball.svelte";
  import Text from "../text/text.svelte";
  import Button from "../button/button.svelte";

  // Props
  export let tracker = new Tracker();
  export let value = null;
  // export let refreshing = false;
  export let id = undefined;
  export let className = undefined;
  export let disabled = undefined;
  export let hideMore = false;
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
    color: var(--color-inverse-2) !important;
  }

  :global(.tracker-button-wrapper .more svg) {
    // stroke: var(--color-solid-3) !important;
  }
  .tracker-ball {
    svg {
      display: none;
    }
    .countdown {
      z-index: 202;
      font-size: 1em;
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

  <button
    {id}
    class={`item-ball ${className} ${$UserStore.localSettings.compactButtons == true ? 'item-ball-small' : ''}`}
    on:click={() => {
      dispatch('click', tracker);
    }}>
    <!-- -->
    <div class="avatar-ball">
      {#if tracker.started}
        <div class="center countdown">
          <Counter started={tracker.started} filled />
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
      <ScorePill {positivity} score={value} />
      <Ball
        username={tracker.label}
        emoji={tracker.emoji}
        color={tracker.color}
        size={$UserStore.localSettings.compactButtons ? 80 : 102} />
    </div>

    <Text className="ball-label truncate-2">{tracker.label}</Text>
  </button>
  {#if !hideMore}
    <Button icon size="sm" className="more" on:click={() => dispatch('more', tracker)}>
      <Icon name="more" size={22} className="fill-solid-2" />
    </Button>
  {/if}
</div>
<!-- last.log.end -->
