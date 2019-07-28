<script>
  //Vendors
  import { navigate, Route } from "svelte-routing";

  // Components
  import NItem from "../components/list-item/list-item.svelte";
  import NText from "../components/text/text.svelte";
  import NToggle from "../components/toggle-switch/toggle-switch.svelte";
  import NToolbar from "../components/toolbar/toolbar.svelte";
  import NBackButton from "../components/back-button/back-button.svelte";

  // Vendors
  import dayjs from "dayjs";

  // Stores
  import { UserStore } from "../store/user";
  import { LedgerStore } from "../store/ledger";
  import { Interact } from "../store/interact";
  import { TrackerStore } from "../store/trackers";
  import { BoardStore } from "../store/boards";
  // Config
  import config from "../../config/global";

  import Plugins from "../plugins/plugins";

  // consts
  const path = window.location.href.split("/");
  const slashes = path.splice(3, path.length - 1);

  let state = {
    mode: "list", // detail, settings
    plugin: null
  };

  $: if (slashes) {
    let id = slashes[1];
    state.plugin = Plugins.find(p => p.id == id);
    if (slashes.length === 2) {
      state.mode = "detail";
    } else if (slashes[2] == "settings") {
      state.mode = "settings";
    }
    console.log("selected", state.plugin);
    if (state.plugin) {
      state.plugin.emoji = state.plugin.emoji || "🔌";
    }
  }

  let methods = {};
</script>

<NToolbar pinTop>
  {#if state.mode == 'list'}
    <NBackButton to="/" />
    <h2>Plugins</h2>
  {:else if state.mode == 'detail'}
    <NBackButton to="/plugins" />
    <h2>{state.plugin.emoji} {state.plugin.name}</h2>
  {:else if state.mode == 'settings'}
    <NBackButton to="/plugins/{state.plugin.id}" />
    <h2>{state.plugin.emoji} {state.plugin.name} Settings</h2>
  {/if}
  <div class="filler" />
  <!-- <button on:click={methods.faq} class="btn btn-clear text-primary">FAQ</button> -->
</NToolbar>

<div class="page page-plugins with-header">

  <div class="container p-0 n-list">

    {#if state.mode == 'list'}
      <div class="n-pop my-3">
        <NItem className="n-item-divider" borderBottom title="Plugins" />
        {#each Plugins as plugin, index}
          <NItem
            on:click={() => {
              navigate(`/plugins/${plugin.id}`);
            }}
            title={`${plugin.emoji || '🔌'} ${plugin.name}`}
            className="clickable" />
        {/each}
      </div>
    {:else if state.mode == 'detail' && state.plugin.pages.default}
      <svelte:component this={state.plugin.pages.default}>
        <!-- contents go here -->
      </svelte:component>
    {:else if state.mode == 'settings'}
      <h2>{state.plugin.name} Settings</h2>
    {/if}

    <!-- <div class="n-pop my-3">
        <NItem title="Data" borderBottom className="n-item-divider" />
        <NItem title="Import Nomie Backup">
          <button
            class="btn btn-clear text-primary"
            slot="right"
            on:click={() => {
              showImporter = true;
            }}>
            Import
          </button>
          <input
            slot="right"
            class="d-none"
            type="file"
            bind:this={fileInput}
            on:change={methods.onImportFile} />
        </NItem>
        <NItem title="Export Data">
          <button
            class="btn-clear btn text-primary"
            on:click={methods.export}
            slot="right">
            Export
          </button>
        </NItem>
      </div> -->

  </div>
</div>
