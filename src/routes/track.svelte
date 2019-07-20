<script>
  // svelte
  import { onMount } from "svelte";

  // Components
  import NToolbar from "../components/toolbar/toolbar.svelte";
  import NPage from "../containers/layout/page.svelte";
  import CaptureLog from "../components/capture-log.svelte";

  // containers
  import Board from "../containers/board/board.svelte";

  // Stores
  import { UserStore } from "../store/user";
  import { TrackerStore } from "../store/trackers";

  const data = {
    editMode: false,
    hasTrackers: false
  };

  const methods = {
    toggleEditMode() {
      data.editMode = !data.editMode;
    }
  };

  TrackerStore.subscribe(t => {
    if (Object.keys(t || {}).length) {
      data.hasTrackers = true;
    } else {
      data.hasTrackers = false;
    }
  });
</script>

<style>
  #note-capture {
    position: fixed;
    bottom: 50px;
    left: 0;
    right: 0;
    background-color: var(--color-solid);
  }
  .page-track {
    display: flex;
    justify-content: stretch;
    width: 100vw;
  }
</style>

<div class="page page-track with-header">
  <Board editMode={data.editMode} />
</div>
<div id="note-capture">
  <CaptureLog />
</div>
<!-- {#if data.hasTrackers}
{:else}
  <NPage title="No Trackers">
    <div slot="header" class="n-row">
      <h1>Let's get Started!</h1>
    </div>
  </NPage>
{/if} -->
