<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import NItem from "../../components/list-item/list-item.svelte";
  import NInput from "../../components/input/input.svelte";
  import PointsEditor from "../../containers/tracker/points-editor.svelte";
  import { Lang } from "../../store/lang";

  let positivity = "0";

  const pointsChange = evt => {
    setTimeout(() => {
      TrackerDesignerStore.update(state => {
        state.tracker = evt.detail;
        return state;
      });
    }, 120);
  };
</script>

<div
  class="step label n-panel vertical {$TrackerDesignerStore.tracker.score == 'custom' ? 'scroll-y' : 'center-all'}">
  <section class="container-xs">
    <NItem className="mb-2">
      <div class="text-md">
        <strong>{Lang.t('tracker.positivity')}</strong>
        <span class="text-faded-3">
          {Lang.t('tracker.positivity_description')}
        </span>
      </div>

    </NItem>
    <PointsEditor
      tracker={$TrackerDesignerStore.tracker}
      on:trackerChange={pointsChange} />
  </section>
</div>
