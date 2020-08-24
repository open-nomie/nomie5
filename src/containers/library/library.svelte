<script>
  import Modal from "../../components/modal/modal.svelte";

  import TrackerButton from "../../containers/board/tracker-button.svelte";
  import NText from "../../components/text/text.svelte";
  import NIcon from "../../components/icon/icon.svelte";

  // Stores
  import { TrackerStore } from "../../store/tracker-store";
  import { Lang } from "../../store/lang";
  import { TrackerLibrary } from "../../store/tracker-library";
  import { Interact } from "../../store/interact";
  import { UserStore } from "../../store/user-store";
  import tick from "../../utils/tick/tick";

  let installed = {}; // hol der for anything installed during the opening

  let trackers = [];
  let ready = false;

  UserStore.onReady(() => {
    ready = true;
  });

  $: if ($TrackerLibrary && !trackers.length && ready) {
    trackers = $TrackerLibrary.trackers.map((tracker) => {
      if (tracker.uom == "oz" && $UserStore.meta.is24Hour === true) {
        tracker.uom = "milliliter";
        tracker.default = "350";
      }
      return tracker;
    });
  }

  function isInstalled(tracker) {
    return $TrackerStore.trackers.hasOwnProperty(tracker.tag) || installed.hasOwnProperty(tracker.tag);
  }

  async function toggleTrackerInstalled(tracker) {
    if (!isInstalled(tracker)) {
      TrackerStore.saveTracker(tracker);
      installed[tracker.tag] = true;
      Interact.toast(`${tracker.label} added`);
    } else {
      let confirmed = await Interact.confirm(`Remove ${tracker.label}?`, `Data will be untouched`);
      if (confirmed) {
        await TrackerStore.deleteTracker(tracker);
        delete installed[tracker.tag];
        installed = installed;
        Interact.toast(`${tracker.label} removed`);
      }
    }
  }
</script>

<style lang="scss" type="text/scss">
  .grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding: 16px 0;
    flex-grow: 1;
    .tracker-option {
      margin: 4px;
    }
  }

  .intro-message {
    text-align: center;
    margin: 0 16px;
  }
  .tracker-option {
    position: relative;
    // margin: 4px;
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
  type={$TrackerLibrary.first ? 'fullscreen' : 'fullscreen'}
  show={true}
  className="library-modal"
  title={Lang.t('tracker.things-to-track')}>

  {#if $TrackerLibrary.first}
    <div class="px-2 pt-3 intro-message">
      <NText size="sm" tag="div">{Lang.t('tracker.pick-at-least-one')}</NText>
    </div>
  {/if}

  <div class="n-grid">
    {#each trackers as tracker, index (tracker.tag)}
      <div class="tracker-option">
        {#if $TrackerStore.trackers.hasOwnProperty(tracker.tag) || installed.hasOwnProperty(tracker.tag)}
          <div class="badge badge-green">
            <NIcon name="checkmark" className="fill-white" size="16" />
          </div>
        {/if}
        <TrackerButton
          {tracker}
          on:click={() => {
            toggleTrackerInstalled(tracker);
          }} />
      </div>
    {/each}
  </div>
  <button
    slot="footer"
    disabled={Object.keys(installed).length === 0 && $TrackerLibrary.first}
    class="btn btn-primary filler btn-lg"
    on:click={TrackerLibrary.toggle}>
    {Lang.t('general.done')}
  </button>
</Modal>
