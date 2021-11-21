<script lang="ts">
	import type { ITracker } from './../../modules/tracker/tracker';
  import Icon from "../icon/icon.svelte";
  import "./classic-button.css";
  // svelte
  import { createEventDispatcher } from "svelte";

  // modules
  import Tracker from "../../modules/tracker/tracker";
  import TimeBalls from "../time-balls/time-balls.svelte";

  // Components
  import Counter from "../counter/counter.svelte";
  import { UserStore } from "../../store/user-store";
  import ScorePill from "./score-pill.svelte";
  import Ball from "./ball.svelte";
  import Text from "../text/text.svelte";
  import Button from "../button/button.svelte";

  // Props
  export let tracker:ITracker = new Tracker({});
  export let value = null;
  // export let refreshing = false;
  export let id = undefined;
  export let className = "";
  export let disabled = undefined;
  export let hideMore = false;
  export let hoursUsed = [];
  // export let hideMore = false;
  // export let lastUsed = null; // or dayjs object
  export let positivity = 0;

  // Define Dispatch
  const dispatch = createEventDispatcher();

  let clickSkip;

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

      // methods.longPress();
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


<div
  {id}
  on:longtap={() => {
    dispatch('longpress');
    clickSkip = true;
  }}
  on:click={() => {
    if (!clickSkip) {
      dispatch('click');
    }
    clickSkip = undefined;
  }}
  style="--tracker-color:{tracker.color}"
  class="tracker-button-wrapper tracker-{tracker.tag}
  {$UserStore.localSettings.compactButtons ? 'compact' : ''}
  {data.pressing ? 'pressing' : ''}
  {className}
  {disabled ? 'disabled' : ''}">

  <button
    class={`item-ball ${className} ${$UserStore.localSettings.compactButtons == true ? 'item-ball-small' : ''}`}>
    <!-- -->
    <div class="avatar-ball ">
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
        size={$UserStore.localSettings.compactButtons ? 80 : 120} />
    </div>

    <Text className="ball-label truncate-2">{tracker.label}</Text>
    {#if tracker.started}
      <div class="center">
        <Counter started={tracker.started} />
      </div>
    {/if}
  </button>
  {#if !hideMore}
    <Button
      icon
      size="sm"
      className="more"
      on:click={() => dispatch('more', tracker)}>
      <Icon name="more" size={22} className="fill-solid-2" />
    </Button>
  {/if}
</div>
<!-- last.log.end -->
