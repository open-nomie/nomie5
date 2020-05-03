<script>
  // svelte
  import { onMount, onDestroy } from "svelte";

  // Components
  import NToolbar from "../components/toolbar/toolbar.svelte";
  import NPage from "../containers/layout/page.svelte";
  import CaptureLog from "../components/capture-log.svelte";

  // containers
  import Board from "../containers/board/board.svelte";

  // Stores
  import { UserStore } from "../store/user";
  import { TrackerStore } from "../store/tracker-store";

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
    if (Object.keys(t.trackers || {}).length) {
      data.hasTrackers = true;
    } else {
      data.hasTrackers = false;
    }
  });
  onMount(() => {
    window.scrollTo(0, 0);
  });
</script>

<style>
  #note-capture {
    position: fixed;
    bottom: 40px;
    bottom: calc(40px + env(safe-area-inset-bottom, 0px));
    left: 0;
    right: 0;
    z-index: 10;
    background-color: var(--color-translucent);
  }
  .page-track {
    display: flex;
    justify-content: stretch;
    width: 100vw;
  }
</style>

<Board />
