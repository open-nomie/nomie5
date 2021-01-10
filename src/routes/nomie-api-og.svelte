<script lang="ts">
	
  //Vendors
  import { onMount } from "svelte";
  import { navigate, Router, Route } from "svelte-routing";
  import dayjs from "dayjs";

  import Spinner from "../components/spinner/spinner.svelte";

  // Modules
  import tick from "../utils/tick/tick";

  // Modules
  import NomieAPICli from "../modules/nomie-api-cli/nomie-api-cli";
  import clipboard from "../utils/clipboard/clipboard";

  // Components
  import NInput from "../components/input/input.svelte";
  import NIcon from "../components/icon/icon.svelte";
  import NButtonGroup from "../components/button-group/button-group.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  import NToggle from "../components/toggle-switch/toggle-switch.svelte";
  import NBackButton from "../components/back-button/back-button.svelte";

  import NLayout from "../containers/layout/layout.svelte";

  // Stores

  import { Interact } from "../store/interact";
  import { NomieAPI } from "../store/napi";
  import { Lang } from "../store/lang";
  import Button from "../components/button/button.svelte";
  import appConfig from "../config/appConfig";
  import Text from "../components/text/text.svelte";

  import List from "../components/list/list.svelte";
  import Divider from "../components/divider/divider.svelte";
  import Captured from "../containers/api/captured.svelte";
  import Archives from "../containers/api/api-archives.svelte";
  import ProgressBar from "../components/progress-bar/progress-bar.svelte";
  import math from "../utils/math/math";
  import Icon from "../components/icon/icon.svelte";

  let NAPI = new NomieAPICli({ domain: "nomieapi.com" });

  let state = {
    registered: false,
    message: null,
    ready: false,
    logs: [],
    hidden: [],
    apiKey: null,
    privateKey: null,
    view: localStorage.getItem('api-view') || 'settings',
    capturingId: null,
    apiExample: null,
    showPrivateKey: false,
    showExample: false,
  };

  $: autoImportAPI = $NomieAPI.autoImport;

  $: if (state.apiKey) {
    state.apiExample = JSON.stringify(
      { note: "#mood(4)", api_key: state.apiKey },
      null,
      2
    );
  }

  function copy(key:string, message?: string) {
    clipboard(key);
    Interact.toast(message || "Copied");
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
      Interact.alert(
        Lang.t("general.success", "Success"),
        "API and Private Key are valid"
      );
    } else {
      Interact.alert(
        Lang.t("general.failure", "Failure"),
        "Please check that the API and Private Key are valid"
      );
    }
  }

  const methods = {
    init() {
      // Let's look for NomieAPICli
      NAPI.onReady(() => {
        if (NAPI.isRegistered()) {
          // methods.getLogs();
          
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
  
    async unregister() {
      let confirmed: boolean = await Interact.confirm(
        "Destroy this API Key?",
        "This cannot be undone"
      );
      if (confirmed === true) {
        try {
          await NAPI.unregister();
          state.registered = false;
        } catch (e) {
          Interact.error(e.message);
        }
      }
    },
    setView(view) {
      state.view = view;
      localStorage.setItem('api-view', view);
    },
  };

  onMount(() => {
    methods.init();
  });
</script>

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
            <Button type="clear" on:click={NomieAPI.getLogsSafe}>Check</Button>
          {/if}
        </div>
      </div>
      <div class="container px-3 n-row">
        {#if state.ready && state.registered}
          <NButtonGroup
            style="max-width:400px"
            className="mx-auto"
            buttons={[{ label: 'Settings', active: state.view == 'settings', click() {
                  methods.setView('settings');
                } }, { label: `${$NomieAPI.items.length} New`, notify: $NomieAPI.items.length ? true : false, active: state.view == 'captured', click() {
                  methods.setView('captured');
                } }, 
                { label: `Archive`, active: state.view == 'archives', click() {
                  methods.setView('archives');
                } }
                ]} />
        {/if}
      </div>
    </div>
  </header>

  <div class="container">

    {#if !state.ready}
      <div class="empty-notice">
        <Spinner />
      </div>
    {:else if state.ready && !state.registered}
      <div item-divider class="pt-4" />
      <div class="row align-items-center">
        <div class="col-12 col-md-6">

          <NItem className="text-center" transparent>
            <Button block on:click={methods.register}>
              {Lang.t('nomie-api.generate-api-key', 'Generate API Key...')}
            </Button>
          </NItem>

          <NItem
            className="clickable text-primary bg-transparent compact text-center
            mb-3"
            on:click={installAPI}>
            <Text size="sm" center>
              {Lang.t('nomie-api.manually-set-keys', 'Manually set API/Private Key...')}
            </Text>
          </NItem>
        </div>
        <div class="col-12 col-md-6">
          <NItem className="just-content mb-3">
            <Text>
              The Nomie API let's you import Note data into Nomie. Generate your
              own unique ID (api key) to send notes to Nomie with tools like
              Zapier, Shortcuts and IFTTT.
            </Text>
            <Text size="sm" className="mt-2" faded>
              When you POST data with the provided API, your content is
              encrypted with the public key. Meaning, only your private key can
              decrypt the content.
            </Text>
            <Text size="sm" className="mt-2" faded>
              FREE Plans have 10 slots to hold data. Each time you import into
              Nomie it will clear all the slots. This will help limit run away
              web service calls.
            </Text>
          </NItem>
        </div>
      </div>
    {:else if state.view === 'captured'}
      <Captured />
    {:else if state.view == 'archives'}
      <Archives />
    {:else}
      <!-- We're In the Settings Tab
        -->
      <List>
        <NItem
          title={Lang.t('nomie-api.auto-import', 'Auto Import')}
          className="py-2"
          description={Lang.t('nomie-api.auto-import-description', 'Automatically import API logs each time Nomie launches')}>
          <div slot="right">
            <NToggle
              bind:value={autoImportAPI}
              on:change={() => {
                if (autoImportAPI === true) {
                  NomieAPI.disableAutoImport();
                } else {
                  NomieAPI.enableAutoImport();
                }
              }} />
          </div>
        </NItem>
        <NItem>
          <div slot="left">
            <Text>{$NomieAPI.inAPI.length}/10</Text>
          </div>
          <div>
            <ProgressBar percentage={math.percentage(10,$NomieAPI.inAPI.length)} />
            <Text size="xs" faded className="pt-1 text-center">Stored on nomieapi.com</Text>
          </div>
          <div slot="right">
            <Button icon><Icon name="delete"></Icon></Button>
          </div>
        </NItem>
      </List>

      

      <List className="mb-3">
        <NItem className="">
          <NInput
            label={Lang.t('nomie-api.api-key', 'API Key')}
            bind:value={state.apiKey}>
            <div slot="right">
              <Button
                className="tap-icon"
                color="transparent"
                shape="circle"
                on:click={() => {
                  copy(state.apiKey, `${Lang.t('nomie-api.api-key-copied', 'API Key Copied')}`);
                }}>
                <NIcon name="copy" size="24" className="fill-primary-bright" />
              </Button>
            </div>
          </NInput>
          <!-- <div>
          <input type="text" class="mt-1 form-control" value={state.apiKey} />
        </div> -->
        </NItem>
        <Divider inset />
        <NItem
          delay={0}
          clickable
          title={Lang.t('nomie-api.private-key', 'Private Key')}
          className="py-1"
          on:click={() => (state.showPrivateKey = !state.showPrivateKey)}>
          <div slot="right">
            <NIcon
              size="16"
              name="chevron{state.showPrivateKey ? 'Up' : 'Down'}" />
          </div>
        </NItem>
        {#if state.showPrivateKey}
          <List className="px-3">
            <NInput
              label={Lang.t('nomie-api.private-key')}
              listItem
              type="textarea"
              rows={5}
              inputStyle="font-size:12px;"
              value={state.privateKey}>
              <div slot="right">
                <Button
                  icon
                  on:click={() => {
                    copy(state.privateKey, `${Lang.t('nomie-api.private-key-copied', 'Private Key Copied')}`);
                  }}>
                  <NIcon
                    size="16"
                    name="copy"
                    className="fill-primary-bright" />
                </Button>
              </div>
            </NInput>
          </List>
        {/if}
      </List>

      <List className="mt-2 mb-2">
        <NItem
          title={Lang.t('nomie-api.example-request', 'Example Request')}
          clickable
          delay={0}
          on:click={() => (state.showExample = !state.showExample)}>
          <div slot="right">
            <NIcon
              name="chevron{state.showExample ? 'Up' : 'Down'}"
              size="16" />
          </div>
        </NItem>
        {#if state.showExample}
          <NItem>
            <textarea
              class="form-control"
              style="height:120px; font-size:0.9em; font-family:monospace"
              bind:value={state.apiExample} />
          </NItem>
          <NItem compact title="URL" className="py-0">
            <div slot="right" class="n-row">

              <Button
                icon
                on:click={() => {
                  copy(`${appConfig.api}/log`);
                }}>
                <NIcon name="copy" size="24" className="fill-primary-bright" />
              </Button>
              <Text size="sm">{appConfig.api}/log</Text>
            </div>
          </NItem>
          <NItem compact title="METHOD" className="py-0">
            <span slot="right">
              <Text size="sm">POST application/json</Text>
            </span>
          </NItem>
          <NItem itemDivider compact topLine>
            {Lang.t('nomie-api.fields', 'Fields')}
          </NItem>
          <NItem compact title="note (required)" className="py-1">
            <Text size="sm" faded>
              Accepts any text, including #tracker, @people, etc.
            </Text>
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
            <Text size="sm" faded>
              Source of the request (not currently displayed)
            </Text>
          </NItem>
        {/if}
      </List>

      <div class="mt-4" />
      <NItem itemDivider>{Lang.t('settings.danger-zone')}</NItem>
      <NItem
        title={Lang.t('nomie-api.forget-api', 'Forget API Key...')}
        className="text-red"
        on:click={methods.forget} />
      <NItem
        title={Lang.t('nomie-api.destroy-api', 'Destroy API Key...')}
        className="text-red"
        on:click={methods.unregister} />
    {/if}
  </div>

</NLayout>
