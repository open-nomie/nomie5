<script>
  import { createEventDispatcher } from "svelte";
  import NButtonGroup from "../button-group/button-group.svelte";

  const dispatch = createEventDispatcher();

  export let score = 0;
  export let className = "";
  export let style = "";
  export let size = "md";

  function onChange() {
    dispatch("change", score);
  }
</script>

<NButtonGroup
  inverse
  {style}
  {className}
  labelClass="text-{size}"
  buttons={[{ label: '😩', active: score === -2, click: () => {
        score = -2;
        onChange();
      } }, { label: '😞', active: score === -1, click: () => {
        score = -1;
        onChange();
      } }, { label: '😐', active: score === 0, click: () => {
        score = 0;
        onChange();
      } }, { label: '🙂', active: score === 1, click: () => {
        score = 1;
        onChange();
      } }, { label: '😁', active: score === 2, click: () => {
        score = 2;
        onChange();
      } }]} />
