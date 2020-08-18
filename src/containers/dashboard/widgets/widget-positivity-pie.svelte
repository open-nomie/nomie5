<script lang="ts">
  import { Widget } from "../../../modules/dashboard/widget";
  import Pie from "../../../components/charts/pie.svelte";
  export let widget: Widget;

  let data = [];
  $: if (widget) {
    data = [
      { label: "Positive", value: widget.positivity.positive, color: "#38a83f" },
      { label: "Neutral", value: widget.positivity.neutral, color: "#319ed7" },
      { label: "Negative", value: widget.positivity.negative, color: "#e94151" },
    ];
  }
</script>

<div class="value">
  <Pie {data} />
</div>
