<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import NPage from "../../containers/layout/page.svelte";
  import NToolbar from "../../components/toolbar/toolbar.svelte";

  import StepLabel from "./step-label.svelte";
  import StepEmoji from "./step-emoji.svelte";
  import StepType from "./step-type.svelte";
  import StepColor from "./step-color.svelte";
</script>

<main class="n-panel n-panel-fixed vertical">
  <section class="n-panel scroll-y vertical">

    <div class="container container-sm">
      <StepLabel />
      <StepEmoji />
      <StepColor />
      <StepType />
    </div>

  </section>
  <NToolbar>
    <button class="btn btn-block mr-1 my-0">Previous</button>
    <button
      class="btn btn-block ml-1 my-0 btn-primary"
      disabled={!$TrackerDesignerStore.tracker.label.length}>
      Next
    </button>
  </NToolbar>

</main>
