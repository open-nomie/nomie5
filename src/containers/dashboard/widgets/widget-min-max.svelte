<script lang="ts">
  import type { Widget } from "../../../modules/dashboard/widget";
  import { formatValue } from "../dashboard-helpers";
  import Text from "../../../components/text/text.svelte";
  import { UserStore } from "../../../store/user-store";
  import dayjs from "dayjs";
  export let widget: Widget;

  $: dateFormat = $UserStore.meta.is24Hour ? "ddd D MMM YYYY" : "ddd MMM D YYYY";
</script>

<style>
  .min-max {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .max {
    padding-bottom: 6px;
  }
  :global(.widget-size-lg .min-max) {
    flex-direction: row;
  }
  :global(.widget-size-lg .min-max .min) {
    padding-bottom: 6px;
    padding-left: 12px;
  }
</style>

<div class="value min-max">
  <div class="max text-center">
    <Text size="lg" bold>{formatValue(widget.stats.max.value, widget)}</Text>
    <Text size="xs" faded>{dayjs(widget.stats.max.date).format(dateFormat)}</Text>
  </div>
  <div class="min text-center">
    <Text size="lg" bold>{formatValue(widget.stats.min.value, widget)}</Text>
    <Text size="xs" faded>{dayjs(widget.stats.min.date).format(dateFormat)}</Text>
  </div>
</div>
