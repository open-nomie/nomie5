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
  import Button from "../components/button/button.svelte";
  import appConfig from "../config/appConfig";
  import Text from "../components/text/text.svelte";

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
    showExample: false,
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
      Interact.blocker("Installing new API Key...");
      await tick(500);
      window.location.reload();
    },
    async getLogs() {
      state.ready = false;
      try {
        let logs: Array<any> = await NAPI.logs();
        state.ready = true;
        state.logs = logs.sort((a, b) => {
          return a.date > b.date ? -1 : 1;
        });
      } catch (e) {
        console.error(e);
        state.ready = true;
      }
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

  function toLog(apiLog): NLog {
    let log: NLog = new NLog(apiLog);
    log.end = dayjs(apiLog.date).valueOf();
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

<NLayout className="stats" showTabs={false}>

  <header slot="header">
    <div class="container">
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
            <NLogItem hideDelete log={toLog(apiLog)} />
            <div class="n-row px-2">

              <Button
                color="success"
                block
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
              </Button>
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

      <div class="n-list mb-3">
        <NItem className="">
          <NInput label="Your API Key" bind:value={state.apiKey}>
            <div slot="right">
              <Button
                className="tap-icon"
                color="transparent"
                shape="circle"
                on:click={() => {
                  copy(state.apiKey);
                }}>
                <NIcon name="copy" size="24" className="fill-primary-bright" />
              </Button>
            </div>
          </NInput>
          <!-- <div>
          <input type="text" class="form-control mt-1" value={state.apiKey} />
        </div> -->
        </NItem>
        <NItem
          delay={0}
          compact
          clickable
          title="Private Key"
          className="py-1"
          on:click={() => (state.showPrivateKey = !state.showPrivateKey)}>
          <button class="btn btn-clear text-primary-bright" slot="right">
            <NIcon size="16" name="chevron{state.showPrivateKey ? 'Up' : 'Down'}" />
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

      <div class="n-list mt-2 mb-2">
        <NItem title="Example POST" clickable delay={0} on:click={() => (state.showExample = !state.showExample)}>
          <div slot="right">
            <NIcon name="chevron{state.showExample ? 'Up' : 'Down'}" />
          </div>
        </NItem>
        {#if state.showExample}
          <NItem>
            <textarea class="form-control" style="height:90px; font-size:11px; font-family:monospace" bind:value={state.apiExample} />
          </NItem>
          <NItem compact title="URL" className="py-0">
            <div slot="right" class="n-row">
              {appConfig.api}/log
              <Button
                className="tap-icon"
                color="transparent"
                shape="circle"
                on:click={() => {
                  copy(`${appConfig.api}/log`);
                }}>
                <NIcon name="copy" size="24" className="fill-primary-bright" />
              </Button>
            </div>
          </NItem>
          <NItem compact title="METHOD" className="py-0">
            <span slot="right">POST application/json</span>
          </NItem>
          <NItem itemDivider compact topLine>Fields</NItem>
          <NItem compact title="note (required)" className="py-1">
            <Text size="sm" faded>Accepts any text, including #tracker, @people, etc.</Text>
          </NItem>
          <NItem compact title="api_key (required)" className="py-1">
            <Text size="sm" faded>The api key provided above</Text>
          </NItem>

          <NItem compact title="date (optional)" className="py-1">
            <Text size="sm" faded>Any javascript friend Date format</Text>
          </NItem>

          <NItem compact title="lat (optional)" className="py-1">
            <Text size="sm" faded>Records Latitude</Text>
          </NItem>

          <NItem compact title="lng (optional)" className="py-1">
            <Text size="sm" faded>Records Longitude</Text>
          </NItem>

          <NItem compact title="source (optional)" className="py-1 mb-2">
            <Text size="sm" faded>Source of the request (not currently displayed)</Text>
          </NItem>

          <!-- <p class="text-sm mt-1">
              <strong>FIELDS</strong>
              <br />
              <strong>note *</strong>
              Accepts any text, including #tracker, @people, etc.
              <br />
              <strong>api_key *</strong>
              The api key provided above
              <br />
              <strong>date</strong>
              Any javascript friendly date format
              <br />
              <strong>lat</strong>
              Latitude
              <br />
              <strong>lng</strong>
              Longitude
              <br />
              <strong>source</strong>
              Source of the request (not currently displayed)
              <br />
            </p> -->
        {/if}
      </div>

      <div class="mt-4" />
      <NItem itemDivider>Danger Zone</NItem>
      <NItem title="Forget API Key..." className="text-red" on:click={methods.forget} />
      <NItem title="Destroy API Key..." className="text-red" on:click={methods.unregister} />
    {/if}
  </div>

</NLayout>
