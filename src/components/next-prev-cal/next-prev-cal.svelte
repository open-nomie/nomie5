<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import Button from "../button/button.svelte";
  import Icon from "../icon/icon.svelte";

  export let isToday: boolean = true;

  const dispatch = createEventDispatcher();
</script>

<style>
  .next-prev-cal {
    max-width: 120px;
  }
</style>

<div class="next-prev-cal n-row w-auto">
  <Button
    color="circle"
    className="tap-icon"
    delay={0}
    on:click={() => {
      dispatch('previous');
    }}>
    <Icon name="chevronLeft" size="24" />
  </Button>
  <Button
    color="none"
    shape="circle"
    delay={0}
    className="tap-icon"
    on:click={() => {
      dispatch('calendar');
    }}>
    <Icon name="calendar" size="24" className={isToday ? '' : 'fill-red'} />
  </Button>
  <Button
    color="none"
    shape="circle"
    delay={0}
    className="tap-icon"
    on:click={() => {
      dispatch('next');
    }}>
    <Icon name="chevronRight" size="24" />
  </Button>
</div>
