<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import NItem from "../../components/list-item/list-item.svelte";
  import NInput from "../../components/input/input.svelte";
  import PointsEditor from "../../containers/tracker/points-editor.svelte";
  import { Lang } from "../../store/lang";

  let positivity = "0";

  const pointsChange = (evt) => {
    setTimeout(() => {
      TrackerDesignerStore.update((state) => {
        state.tracker = evt.detail;
        return state;
      });
    }, 120);
  };
</script>

<div class="step label n-panel vertical {$TrackerDesignerStore.tracker.score == 'custom' ? 'scroll-y' : 'center-all'}">
  <section class="container-xs">
    <NItem title={Lang.t('tracker.positivity_description')} className=" text-center bg-transparent" />
    <div class="px-2 pb-2">
      <PointsEditor tracker={$TrackerDesignerStore.tracker} on:trackerChange={pointsChange} />
    </div>
  </section>
</div>
