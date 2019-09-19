<script>
  import Modal from "../../components/modal/modal.svelte";

  import TrackerButton from "../../containers/board/tracker-button.svelte";

  // Stores
  import { TrackerStore } from "../../store/trackers";
  import { Lang } from "../../store/lang";
  import { TrackerLibrary } from "../../store/tracker-library";
  import { Interact } from "../../store/interact";

  let installed = {}; // hol der for anything installed during the opening
</script>

<style lang="scss">
  .grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding: 16px 0;
  }
  .tracker-option {
    position: relative;
    .badge {
      position: absolute;
      right: 8px;
      top: 10px;
      z-index: 400;
      width: 22px;
      padding: 0;
      text-align: center;
    }
  }
</style>

<Modal
  type="bottom"
  title={Lang.t('tracker.things-to-track')}
  show={$TrackerLibrary.show}
  className="library-modal">
  <div class="grid">
    {#each $TrackerLibrary.trackers as tracker, index (tracker.tag)}
      <div class="tracker-option">
        {#if TrackerStore.tagExists(tracker.tag) || installed.hasOwnProperty(tracker.tag)}
          <div class="badge badge-green">
            <i class="zmdi zmdi-check" />
          </div>
        {/if}
        <TrackerButton
          {tracker}
          on:click={() => {
            if (!(TrackerStore.tagExists(tracker.tag) || installed.hasOwnProperty(tracker.tag))) {
              Interact.confirm(Lang.t('tracker.install-tracker-question', {
                  tracker: tracker.label
                })).then(answer => {
                if (answer) {
                  TrackerStore.saveTracker(tracker);
                  installed[tracker.tag] = true;
                }
              });
            } else {
              Interact.toast(`${tracker.label} already installed`);
            }
          }} />
      </div>
    {/each}
  </div>
  <button
    slot="footer"
    class="btn btn-primary filler btn-lg"
    on:click={TrackerLibrary.toggle}>
    {Lang.t('general.finished')}
  </button>
</Modal>
