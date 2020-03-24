<script>
  import Dymoji from "../dymoji/dymoji.svelte";
  import { createEventDispatcher } from "svelte";
  import ItemBall from "./item-ball.svelte";
  import dayjs from "dayjs";
  const dispatch = createEventDispatcher();

  // export let count = 0;
  export let person = undefined;
  export let last = undefined;
</script>

{#if person}
  <ItemBall
    on:click={() => {
      dispatch('click', person);
    }}
    label={person.getDisplayName()}
    avatar={person.getAvatar()}
    note={last ? dayjs(last).fromNow() : null}
    username={person.getDisplayName()} />
{/if}
