<script lang="ts">
  import type { Widget } from "../../../modules/dashboard/widget";
  import { formatValue } from "../dashboard-helpers";
  import Text from "../../../components/text/text.svelte";
  import { UserStore } from "../../../store/user-store";
  import dayjs from "dayjs";
  import Icon from "../../../components/icon/icon.svelte";
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

  :global(.widget-size-lg .min-max, .widget-size-sm .n-text.xl) {
    font-size: 1.4rem;
  }
  :global(.widget-size-lg .min-max, .widget-size-md .min-max) {
    flex-direction: row;
  }
  :global(.widget-size-lg .min-max .min, .widget-size-md .min-max .min) {
    padding-bottom: 6px;
    padding-left: 12px;
    border-left: solid 1px var(--color-solid-2);
    margin-left: 12px;
  }
</style>

<div class="value min-max">
  <div class="max text-center">
    <Text size={formatValue(widget.stats.max.value, widget).toString().length > 5 ? 'lg' : 'xl'} bold>
      {formatValue(widget.stats.max.value, widget)}
    </Text>
    <Text size="xs" faded style="margin-left:-12px;">
      <Icon name="chevronUp" size="12" />
      {dayjs(widget.stats.max.date).format(dateFormat)}
    </Text>
  </div>
  <div class="min text-center">
    <!-- Max is set on purpose here.. for consistency -->
    <Text size={formatValue(widget.stats.max.value, widget).toString().length > 5 ? 'lg' : 'xl'} bold>
      {formatValue(widget.stats.min.value, widget)}
    </Text>
    <Text size="xs" faded style="margin-right:-12px;">
      {dayjs(widget.stats.min.date).format(dateFormat)}
      <Icon name="chevronDown" size="12" />
    </Text>
  </div>
</div>
