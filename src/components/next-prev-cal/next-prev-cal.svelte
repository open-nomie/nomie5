<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import Button from "../button/button.svelte";
  import Icon from "../icon/icon.svelte";

  export let isToday: boolean = true;
  export let hideCal: boolean = false;
  export let style: string = "";

  const dispatch = createEventDispatcher();
</script>

<style>
  .next-prev-cal {
    max-width: 120px;
    flex-shrink: 1;
    flex-grow: 0;
  }
  :global(.next-prev-cal .nbtn) {
    /* min-width: 40px; */
  }
</style>

<div class="next-prev-cal n-row w-auto" {style}>
  <Button
    className="previous-action"
    icon
    delay={0}
    on:click={() => {
      dispatch('previous');
    }}>
    <Icon name="chevronLeft" size="24" className="fill-primary-bright" />
  </Button>
  {#if !hideCal}
    <Button
      className="calendar-action {isToday ? 'tap-icon' : ''}"
      delay={0}
      style={isToday ? '' : 'background-color:var(--color-primary); color:#FFF;'}
      icon
      shape="circle"
      on:click={() => {
        dispatch('calendar');
      }}>
      <Icon name="calendar" size="22" />
    </Button>
  {/if}
  <Button
    className="next-action"
    delay={0}
    icon
    on:click={() => {
      dispatch('next');
    }}>
    <Icon name="chevronRight" size="24" className="fill-primary-bright" />
  </Button>
</div>
