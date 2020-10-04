<script lang="ts">
  import { onMount } from "svelte";
  import type NLog from "../../modules/nomie-log/nomie-log";

  import Text from "../text/text.svelte";
  import _ from "lodash";

  export let log1: NLog;
  export let log2: NLog;

  let diff: number = 0;
  let display: string = ``;

  async function main() {
    diff = log1.endDayjs().startOf("day").diff(log2.endDayjs().startOf("day"), "day");
    if (diff > 365) {
      display = `${_.round(diff / 365, 2)} years later`;
    } else if (diff > 30) {
      display = `${_.round(diff / 30, 2)} months later`;
    } else {
      display = `${diff} ${diff === 1 ? "day" : "days"} later`;
    }
  }

  onMount(main);
</script>

<style lang="scss">
  .time-gap {
    font-size: small;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .time-gap .buffer {
    border-bottom: solid 1px var(--color-solid-2);
  }
</style>

{#if diff > 1}
  <div class="time-gap">
    <span class="buffer filler" />
    <Text center faded size="sm" className="mx-4">{display}</Text>
    <span class="buffer filler" />
  </div>
{/if}
