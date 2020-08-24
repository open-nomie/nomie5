<script lang="ts">
  //Vendors
  import { onMount } from "svelte";
  import { navigate, Router, Route } from "svelte-routing";
  import dayjs from "dayjs";

  import Spinner from "../components/spinner/spinner.svelte";

  // Modules
  import Tracker from "../modules/tracker/tracker";
  import NLog from "../modules/nomie-log/nomie-log";
  import tick from "../utils/tick/tick";

  // Modules
  import NomieAPICli from "../modules/nomie-api-cli/nomie-api-cli";
  import clipboard from "../utils/clipboard/clipboard";

  // Components
  import NText from "../components/text/text.svelte";
  import NInput from "../components/input/input.svelte";
  import NIcon from "../components/icon/icon.svelte";
  import NButtonGroup from "../components/button-group/button-group.svelte";
  import NToolbar from "../components/toolbar/toolbar.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  import NToggle from "../components/toggle-switch/toggle-switch.svelte";
  import NBackButton from "../components/back-button/back-button.svelte";
  import NLogItem from "../components/list-item-log/list-item-log.svelte";

  import NLayout from "../containers/layout/layout.svelte";

  // containers
  import NPage from "../containers/layout/page.svelte";
  // config
  import faq from "../config/faq";
  // Stores
  import { LedgerStore } from "../store/ledger";
  import { Interact } from "../store/interact";
  import { UserStore } from "../store/user-store";
  import { NomieAPI } from "../store/napi";
  import { Lang } from "../store/lang";

  let NAPI = new NomieAPICli({ domain: "nomieapi.com/.netlify/functions" });

  let state = {
    registered: false,
    message: null,
    ready: false,
    logs: [],
    hidden: [],
    apiKey: null,
    privateKey: null,
    view: "settings",
    capturingId: null,
    apiExample: null,
    showPrivateKey: false,
  };

  $: autoImportAPI = $NomieAPI.autoImport;

  $: if (state.apiKey) {
    state.apiExample = JSON.stringify({ note: "#mood(4)", api_key: state.apiKey }, null, 2);
  }

  function copy(key) {
    clipboard(key);
    Interact.toast("Copied");
  }

  async function installAPI() {
    let apiKey = null;
    let privateKey = null;

    apiKey = await Interact.prompt("API Key", "Paste your API key");
    privateKey = await Interact.prompt("Private Key", "Paste your privatekey", {
      valueType: "textarea",
    });
    let isValue = await NAPI.testAndSave(apiKey, privateKey);

    if (isValue) {
      state.registered = true;
      state.ready = true;
      state.apiKey = NAPI.apiKey;
      state.privateKey = NAPI.privateKey;
      Interact.alert(Lang.t("general.success", "Success"), "API and Private Key are valid");
    } else {
      Interact.alert(Lang.t("general.failure", "Failure"), "Please check that the API and Private Key are valid");
    }
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
    async forget() {
      let confirmed = await Interact.confirm(
        "Are you sure?",
        "If you saved your API key and private key, you can restore it. Otherwise, it will be lost forever."
      );
      if (confirmed) {
        await NAPI.forget();
        state.registered = false;
        state.apiKey = null;
        state.privateKey = null;
      }
    },
    toggleShowPrivateKey() {
      state.showPrivateKey = !state.showPrivateKey;
    },
    async register() {
      Interact.blocker("Requesting an API Key...");
      state.message = "Registering...";
      await NAPI.register();
      Interact.blocker("Installing new API Key");
      await tick(500);
      window.location.reload();
    },
    async getLogs() {
      state.ready = false;
      let logs: Array<any> = await NAPI.logs();
      state.ready = true;
      state.logs = logs.sort((a, b) => {
        return a.date > b.date ? -1 : 1;
      });
      return state.logs;
    },
    async clear() {
      await NAPI.clear();
      state.logs = [];
    },
    async unregister() {
      let confirmed: boolean = await Interact.confirm("Destroy this API Key?", "This cannot be undone");
      if (confirmed === true) {
        try {
          await NAPI.unregister();
          state.registered = false;
        } catch (e) {
          Interact.error(e.message);
        }
      }
    },
    confirmClear() {
      Interact.confirm("Clear Logs?", "This will delete the remaining items and cannot be undone.").then((res) => {
        if (res) {
          methods.clear();
        }
      });
    },
    async capture(log) {
      state.capturingId = log.id;
      await tick(1000);
      let nLog = toLog(log); // convert to log
      let response = LedgerStore.saveLog(nLog);
      state.hidden.push(log.id);
      state.hidden = state.hidden;
      if (state.logs.length == state.hidden.length) {
        // They've done all of them - clear it.
        methods.clear();
      }
    },
    setView(view) {
      state.view = view;
      if (view === "captured") {
        methods.getLogs();
      }
    },
  };

  function toLog(apiLog) {
    let log = new NLog(apiLog);
    log.end = apiLog.date;
    return log;
  }

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

<NLayout className="stats" pageTitle="Nomie API" showTabs={false}>

  <header slot="header">
    <div class="n-toolbar-grid">
      <div class="left">
        <NBackButton />
      </div>
      <div class="main">
        <h1 class="title">Nomie API</h1>
      </div>
      <div class="right">
        {#if state.registered}
          <button class="btn btn-clear tap-text mr-2" on:click={methods.getLogs}>Check</button>
        {/if}
      </div>
    </div>
    <div class="n-row px-3 container">
      {#if state.ready && state.registered}
        <NButtonGroup
          buttons={[{ label: 'Settings', active: state.view == 'settings', click() {
                methods.setView('settings');
              } }, { label: `Captured (${state.logs.length})`, active: state.view == 'captured', click() {
                methods.setView('captured');
              } }]} />
      {/if}
    </div>
  </header>

  <div class="container">
    <div item-divider class="pt-4" />
    {#if !state.ready}
      <div class="empty-notice">
        <Spinner />
      </div>
    {:else if state.ready && !state.registered}
      <NItem className="clickable text-primary solo text-center mb-3" on:click={methods.register} title="Generate API Key..." />

      <NItem className="just-content">
        <p>
          Generating an API will create a unique public/private key combination. The public key is stored in the Nomie API data store, your
          private key will be stored in Nomie.
        </p>
        <p class="mt-2">
          When you POST data with the provided API, your content is encrypted with the public key. Meaning, only your private key can
          decrypt the content.
        </p>
        <p class="mt-2">
          FREE Plans have 10 slots to hold data. Each time you import into Nomie it will clear all the slots. This will help limit run away
          web service calls.
        </p>
      </NItem>

      <NItem className="clickable text-primary mt-4 solo text-center mb-3" on:click={installAPI} title="Manually set API/Private Key..." />
    {:else if state.view === 'captured'}
      <div class="n-list">
        {#each state.logs as apiLog, index}
          {#if state.hidden.indexOf(apiLog.id) === -1}
            <NLogItem log={toLog(apiLog)} />
            <div class="n-row px-2">

              <button
                class="btn btn-outlined btn-success ml-2 btn-block my-0"
                disabled={state.capturingId === apiLog.id}
                on:click={() => {
                  methods.capture(apiLog);
                }}>
                {#if state.capturingId === apiLog.id}
                  <Spinner color="#FFF" size={24} />
                  Saving
                {:else}
                  <NIcon name="checkmarkOutline" className="fill-white mr-2" />
                  Accept
                {/if}
              </button>
            </div>
          {/if}
          <hr />
        {/each}

      </div>
      {#if state.logs.length > state.hidden.length}
        <NItem className="bg-transparent mb-3">
          <button on:click={methods.confirmClear} class="btn btn-outlined btn-danger mr-1 btn-block my-0">
            <NIcon name="closeOutline" className="fill-white mr-2" />
            Clear Remaining
          </button>
        </NItem>
      {/if}
      {#if !state.logs.length}
        <div class="empty-notice">No recent logs captured</div>
      {/if}
    {:else}
      <!-- We're In the Settings Tab
        -->
      <NItem title="Auto Accept" className="solo py-2 mb-3" description="Auto import and accept API logs">
        <div slot="right">
          <NToggle
            bind:value={autoImportAPI}
            on:change={(event) => {
              if (autoImportAPI === true) {
                NomieAPI.disableAutoImport();
              } else {
                NomieAPI.enableAutoImport();
              }
            }} />
        </div>
      </NItem>

      <div class="n-list solo mt-3 mb-3">
        <NItem className="">
          <NInput label="Your API Key" bind:value={state.apiKey}>
            <button
              class="btn btn-clear tap-icon"
              slot="right"
              on:click={() => {
                copy(state.apiKey);
              }}>
              <NIcon name="copy" className="fill-primary-bright" />
            </button>
          </NInput>
          <!-- <div>
          <input type="text" class="form-control mt-1" value={state.apiKey} />
        </div> -->
        </NItem>
        <NItem title="Private Key" on:click={() => (state.showPrivateKey = !state.showPrivateKey)}>
          <button class="btn btn-clear text-primary-bright" slot="right">
            <NIcon name="chevron{state.showPrivateKey ? 'Up' : 'Down'}" />
          </button>
        </NItem>
        {#if state.showPrivateKey}
          <NItem className="px-3 pb-3">
            <div>
              <textarea type="text" class="form-control text-sm mt-1" style="min-height:100px;" value={state.privateKey} />
              <div
                class="p-2 text-center text-primary-bright text-sm"
                on:click={() => {
                  copy(state.privateKey);
                }}>
                <NIcon name="copy" size={20} className="fill-primary-bright mr-2" />
                Copy Private Key
              </div>
            </div>
          </NItem>
        {/if}
      </div>

      <NItem title="Example POST" className="solo mt-3" on:click={() => (state.showExample = !state.showExample)}>
        <button slot="right" class="btn btn-clear">
          <NIcon name="chevron{state.showExample ? 'Up' : 'Down'}" />
        </button>
      </NItem>
      {#if state.showExample}
        <NItem className="px-3 pb-2 bg-transparent">
          <p class="text-sm">POST JSON to: https://nomieapi.com/log</p>
          <textarea class="form-control" style="height:120px" bind:value={state.apiExample} />
          <p class="text-sm mt-1">fields: note, api_key, lat, lng, date, source</p>
        </NItem>
      {/if}
      <div item-divider />

      <NItem className="text-red text-center solo mt-4" on:click={methods.forget}>Forget API Key...</NItem>
      <div item-divider />
      <NItem className="text-red text-center solo" on:click={methods.unregister}>Destroy API Key...</NItem>
      <div item-divider />
    {/if}
  </div>

</NLayout>
