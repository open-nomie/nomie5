<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import Button from '../button/button.svelte'
  import Icon from '../icon/icon.svelte'

  export let isToday = true
  export let hideCal = false
  export let style = ''

  const dispatch = createEventDispatcher()
</script>

<style>
  .next-prev-cal {
    max-width: 120px;
    flex-shrink: 1;
    flex-grow: 0;
  }
</style>

<div class="flex items-center flex-grow-0 flex-shrink-0 next-prev-cal" {style}>
  <Button
    className="previous-action"
    icon
    delay={0}
    on:click={() => {
      dispatch('previous')
    }}>
    <Icon name="chevronLeft" size={24} className="text-primary-500" />
  </Button>
  {#if !hideCal}
    <Button
      className="calendar-action {isToday ? 'tap-icon' : 'text-white bg-primary-500'}"
      delay={0}
      icon
      color="transparent"
      shape="circle"
      on:click={() => {
        dispatch('calendar')
      }}>
      <Icon name="calendar" size={22} />
    </Button>
  {/if}
  <Button
    className="next-action"
    delay={0}
    icon
    on:click={() => {
      dispatch('next')
    }}>
    <Icon name="chevronRight" size={24} className="text-primary-500" />
  </Button>
</div>
