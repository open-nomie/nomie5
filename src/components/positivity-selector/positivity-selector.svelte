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

<style>
  :global(.positivity-selector) {
    padding: 0px !important;
    box-shadow: none !important;
  }
  :global(.positivity-selector .text-xl) {
    line-height: 21px;
    font-size: 30px;
  }
  :global(.positivity-selector .btn) {
    opacity: 0.5 !important;
  }
  :global(.positivity-selector .btn.active) {
    opacity: 1 !important;
  }
  :global(.positivity-selector .btn.active) {
    border: none !important;
    transform: scale(1.1) !important;
  }
</style>

<NButtonGroup
  inverse
  {style}
  className={`${className} positivity-selector`}
  labelClass="emoji text-{size}"
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
