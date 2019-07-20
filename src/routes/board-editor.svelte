<script>
  //Vendors
  import { navigate, Router, Route } from "svelte-routing";

  // Modules
  import Tracker from "../modules/tracker/tracker";
  // Components
  import NText from "../components/text/text.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  // containers
  import NPage from "../containers/layout/page.svelte";

  //store
  import { BoardStore } from "../store/boards";
  import { UserStore } from "../store/user";
  import { TrackerStore } from "../store/trackers";

  let data = {
    board: null,
    trackers: []
  };

  $: if ((data.board || {}).hasOwnProperty("trackers")) {
    data.trackers = data.board.trackers.map(tag => {
      return $TrackerStore[tag] || new Tracker({ tag: tag });
    });
  }

  const methods = {
    initialize() {
      let path = window.location.href.split("/");
      let id = path[path.length - 1];
      let board = BoardStore.get(id);

      if (board) {
        data.board = { ...board };
      }
    },
    save() {
      BoardStore.saveBoard(data.board).then(() => {
        window.history.back();
      });
    }
  };

  // TODO: Make sorting work
  export function dragstart(ev, group, item) {
    console.log({ ev, group, item });
  }
  export function dragover(ev) {
    ev.preventDefault();
  }
  export function drop(ev, new_g, i) {
    console.log({ ev, new_g, i });
  }

  UserStore.onReady(() => {
    BoardStore.subscribe(b => {
      if (b) {
        methods.initialize();
      }
    });
  });
</script>

{#if data.board}
  <NPage className="stats" withBack={true}>

    <div slot="header" class="n-row">
      <div class="filler" />
      <h1>Edit {data.board.label}</h1>
      <div class="filler" />
      <button class="btn btn-sm btn-clear text-primary" on:click={methods.save}>
        Save
      </button>
    </div>

    <div slot="sub-header">
      <NItem className="w-100">
        <div class="input-group mb-2">
          <div class="input-group-prepend">
            <span class="input-group-text">Board Label</span>
          </div>
          <input
            type="text"
            class="form-control"
            placeholder="Board Label"
            aria-label="Board Label"
            bind:value={data.board.label}
            aria-describedby="basic-addon1" />
        </div>
      </NItem>
    </div>

    <div class="container pt-3">
      <div
        class="list"
        on:drop={event => drop(event, 'list')}
        on:dragover={dragover}>
        {#each data.trackers as tracker, i (tracker.tag)}
          <div
            draggable={true}
            on:touchstart={event => dragstart(event, 'list', i)}
            on:dragstart={event => dragstart(event, 'list', i)}>
            <NItem title={tracker.label} borderBottom>
              <span class="text-lg emoji" slot="left">{tracker.emoji}</span>
            </NItem>
          </div>
        {/each}
      </div>
    </div>
  </NPage>
{:else}Loading{/if}
