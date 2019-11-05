<script>
  // TODO: Move this to components/tracker-button

  // svelte
  import { createEventDispatcher } from "svelte";

  // modules
  import Tracker from "../../modules/tracker/tracker";
  import TimeBalls from "../../components/time-balls/time-balls.svelte";

  // Components
  import Counter from "../../components/counter/counter.svelte";

  // Props
  export let tracker = new Tracker();
  export let value = null;
  export let refreshing = false;
  export let id = undefined;
  export let className = undefined;
  export let disabled = undefined;
  export let hoursUsed = [];

  // Define Dispatch
  const dispatch = createEventDispatcher();

  let data = {
    pressing: false
  };

  let timeout = null;
  // Functions
  const methods = {
    // Clicked
    click() {
      dispatch("click", {});
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
    }
  };
</script>

<style lang="scss" type="text/scss">
  // Moved to /scss/components/_tracker-button.scss
</style>

<button
  {id}
  on:tap={methods.click}
  on:longtap={methods.longPress}
  on:touchstart={methods.mousedown}
  on:mousedown={methods.mousedown}
  on:touchend={methods.mouseup}
  on:contextmenu={methods.rightclick}
  on:mouseout={methods.mouseup}
  on:mouseup={methods.mouseup}
  {disabled}
  class="n-tracker-button tracker-{tracker.tag}
  {data.pressing ? 'pressing' : ''}
  {className}">
  <header>
    {#if value}
      <span class="value left">{value}</span>
    {/if}
    <div class="filler" />
  </header>
  {#if tracker.started}
    <div class="center countdown">
      <Counter started={tracker.started} />
    </div>
  {/if}
  <i class="emoji">{tracker.emoji}</i>
  <footer>{tracker.label}</footer>
  {#if tracker.one_tap}
    <div class="one-tap" />
  {/if}
  {#if hoursUsed.length}
    <div class="balls">
      <TimeBalls hours={hoursUsed} />
    </div>
  {/if}
</button>
