<script>
  //Vendors
  import { onMount } from "svelte";
  import { navigate, Router, Route } from "svelte-routing";
  import dayjs from "dayjs";
  import Spinner from "svelte-spinner";

  // Modules
  import Tracker from "../modules/tracker/tracker";
  import NLog from "../modules/nomie-log/nomie-log";
  // Modules
  import NomieAPICli from "../modules/nomie-api-cli/nomie-api-cli";

  // Components
  import NText from "../components/text/text.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  import NToggle from "../components/toggle-switch/toggle-switch.svelte";

  // containers
  import NPage from "../containers/layout/page.svelte";
  // config
  import faq from "../../config/faq";
  // Stores
  import { LedgerStore } from "../store/ledger";
  import { Interact } from "../store/interact";
  import { UserStore } from "../store/user";
  import { NomieAPI } from "../store/napi";

  let NAPI = new NomieAPICli({ domain: "nomieapi.com/.netlify/functions" });

  let state = {
    registered: false,
    ready: false,
    logs: [],
    hidden: [],
    apiKey: null,
    privateKey: null,
    view: "settings",
    capturingId: null,
    apiExample: null,
    showPrivateKey: false
  };

  $: autoImportAPI = $NomieAPI.autoImport;

  $: if (state.apiKey) {
    state.apiExample = JSON.stringify(
      { note: "#mood(4)", api_key: state.apiKey },
      null,
      2
    );
  }

  const methods = {
    init() {
      // Let's look for NomieAPICli

      NAPI.onReady(() => {
        if (NAPI.isRegistered()) {
          methods.getLogs();
          state.registered = true;
          state.ready = true;
          state.apiKey = NAPI.apiKey;
          state.privateKey = NAPI.privateKey;
        } else {
          // capture.register();
          state.registered = false;
          state.ready = true;
        }
      });
    },
    toggleShowPrivateKey() {
      state.showPrivateKey = !state.showPrivateKey;
    },
    register() {
      state.ready = false;
      state.message = "Registering...";
      NAPI.register().then(payload => {
        methods.init();
      });
    },
    getLogs() {
      state.ready = false;
      return NAPI.logs().then(logs => {
        state.ready = true;
        state.logs = logs.sort((a, b) => {
          return a.date > b.date ? -1 : 1;
        });
        return state.logs;
      });
    },
    clear() {
      NAPI.clear().then(() => {
        Interact.toast("Logs cleared");
        state.logs = [];
      });
    },
    unregister() {
      Interact.confirm("Destroy this API Key?", "This cannot be undone").then(
        res => {
          if (res === true) {
            NAPI.unregister()
              .then(() => {
                state.registered = false;
              })
              .catch(e => {
                Interact.alert("Error", e.message);
              });
          }
        }
      );
    },
    confirmClear() {
      Interact.confirm(
        "Clear Logs?",
        "This will delete the remaining items and cannot be undone."
      ).then(res => {
        if (res) {
          methods.clear();
        }
      });
    },
    capture(log) {
      state.capturingId = log.id;
      log.end = new Date(log.date);
      let nLog = new NLog(log);

      LedgerStore.saveLog(nLog).then(res => {
        state.hidden.push(log.id);
        state.hidden = state.hidden;
        if (state.logs.length == state.hidden.length) {
          // They've done all of them - clear it.
          methods.clear();
        }
      });
    },
    setView(view) {
      state.view = view;
      if (view === "captured") {
        methods.getLogs();
      }
    }
  };

  onMount(() => {
    methods.init();
  });
</script>

<style>
  .n-list {
    max-width: 100vw;
    overflow: hidden;
  }
</style>

<NPage className="stats" withBack={true}>

  <div slot="header" class="n-row">
    <h1 class="text-inverse">Nomie API</h1>
    <div class="filler" />
    {#if state.registered}
      <button class="btn btn-clear btn-icon btn-sm" on:click={methods.getLogs}>
        <i class="zmdi zmdi-refresh text-inverse-3" />
      </button>
    {/if}
  </div>

  <div class="container">
    {#if !state.ready}
      <div class="empty-notice">
        <Spinner size="50" speed="750" color="#666" thickness="8" gap="40" />
      </div>
    {:else if state.ready && !state.registered}
      <div item-divider />

      <NItem
        className="py-2"
        title={`Nomie API Setup`}
        description={`Pull in content from external services like IFTTT or Zapier.`} />

      <div item-divider />
      <NItem
        className="clickable text-primary"
        on:click={methods.register}
        title="Generate API Key..." />

      <NItem className="just-content">
        <p>
          Registering will create a unique public private key combination. The
          public key is stored in the Nomie API data store. Your private key
          will be stored in Nomie. When you POST data with the provided API,
          your content is encrypted with the public key. Only your private key
          can decrypt the content.
        </p>
        <p>
          FREE Plans have 10 slots to hold data. Each time you import into Nomie
          it will clear all the slots. This will help limit run away web service
          calls.
        </p>
      </NItem>
    {:else}
      <div class="d-flex justify-content-center p-3">
        <div class="btn-group flex-grow flex-shrink">
          <button
            on:click={() => methods.setView('settings')}
            class="btn btn-sm btn-white-pop {state.view === 'settings' ? 'active' : ''}">
            Settings
          </button>
          <button
            on:click={() => methods.setView('captured')}
            class="btn btn-sm btn-white-pop {state.view === 'captured' ? 'active' : ''}">
            Captured
          </button>

        </div>
      </div>
      {#if state.view === 'captured'}
        {state.hidden}
        <div class="n-list">
          {#each state.logs as log, index}
            {#if state.hidden.indexOf(log.id) === -1}
              <NItem className="py-2">
                <h3 class="n-title truncate-2">{log.note}</h3>
                <div>
                  <small class="text-faded-3">
                    {dayjs(log.date).format('ddd MMM D YYYY h:mm A')} from
                    <strong>{log.source}</strong>
                  </small>
                </div>
                <button
                  class="btn-circle btn btn-primary"
                  slot="right"
                  disabled={state.capturingId === log.id}
                  on:click={() => {
                    methods.capture(log);
                  }}>
                  {#if state.capturingId === log.id}
                    <Spinner
                      size="30"
                      speed="750"
                      color="#FFF"
                      thickness="6"
                      gap="40" />
                  {:else}
                    <span class="zmdi zmdi-download" />
                  {/if}
                </button>
              </NItem>
            {/if}
          {/each}

        </div>
        {#if state.logs.length > state.hidden.length}
          <NItem
            title="Clear Remaining Logs"
            className="text-red"
            on:click={methods.confirmClear} />
        {/if}
        {#if !state.logs.length}
          <div class="empty-notice">No recent logs captured</div>
        {/if}
      {:else}
        <!-- We're In the Settings Tab
        -->
        <NItem
          title="Auto Import"
          className="p-3"
          description="Automatically import captured logs">
          <div slot="right">
            <NToggle
              bind:value={autoImportAPI}
              on:change={event => {
                if (autoImportAPI === true) {
                  NomieAPI.disableAutoImport();
                } else {
                  NomieAPI.enableAutoImport();
                }
              }} />
          </div>
        </NItem>
        <div item-divider />
        <NItem title="API Key" className="p-3">
          <div>
            <input type="text" class="form-control mt-1" value={state.apiKey} />
          </div>
        </NItem>

        <div item-divider />
        {#if state.showExample}
          <NItem title="Example POST">
            <button
              slot="right"
              class="btn btn-clear"
              on:click={() => (state.showExample = !state.showExample)}>
              Close
            </button>
          </NItem>
          <NItem className="py-2">
            <p class="text-sm">POST JSON to: https://nomieapi.com/log</p>
            <textarea
              class="form-control"
              style="height:120px"
              bind:value={state.apiExample} />
            <p class="text-sm mt-1">
              fields: note, api_key, lat, lng, date, source
            </p>
          </NItem>
        {:else}
          <NItem title="Example POST">
            <button
              class="btn btn-clear"
              slot="right"
              on:click={() => (state.showExample = !state.showExample)}>
              Show
            </button>
          </NItem>
        {/if}
        <div item-divider />
        {#if state.showPrivateKey}
          <NItem title="Private Key">
            <button
              class="btn btn-clear"
              slot="right"
              on:click={() => (state.showPrivateKey = !state.showPrivateKey)}>
              Hide
            </button>
          </NItem>
          <NItem className="py-2 pb-3">
            <div>
              <textarea
                type="text"
                class="form-control text-sm mt-1"
                style="min-height:100px;"
                bind:value={state.privateKey} />
            </div>
          </NItem>
        {:else}
          <NItem title="Private Key">
            <button
              class="btn btn-clear"
              slot="right"
              on:click={() => (state.showPrivateKey = !state.showPrivateKey)}>
              Show
            </button>
          </NItem>
        {/if}
        <div item-divider />
        <NItem
          className="text-red"
          title="Unregister this API"
          on:click={methods.unregister} />
        <div item-divider />
      {/if}
    {/if}
  </div>

</NPage>
