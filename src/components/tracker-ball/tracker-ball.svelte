<script>
  import Dymoji from "../dymoji/dymoji.svelte";
  import { createEventDispatcher } from "svelte";
  import ItemBall from "./item-ball.svelte";
  import ScorePill from "./score-pill.svelte";
  import { UserStore } from "../../store/user";
  import dayjs from "dayjs";
  const dispatch = createEventDispatcher();

  export let id = undefined;
  export let score = undefined;
  export let positivity = undefined;
  export let note = undefined;
  export let className = "";
  export let tracker = null;
  export let small = true;
</script>

<style lang="scss">

</style>

{#if tracker}
  <ItemBall
    {id}
    {className}
    label={tracker.label}
    emoji={tracker.emoji}
    small={$UserStore.meta.compactTrackerButtons == true}
    {note}
    color={tracker.color}
    on:click={() => {
      dispatch('click', tracker);
    }}>
    <ScorePill {positivity} {score} />
    <slot />
  </ItemBall>
{/if}
