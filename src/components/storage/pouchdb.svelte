<script>
  import { onMount } from "svelte";
  import NItem from "../list-item/list-item.svelte";
  import NInput from "../input/input.svelte";
  import NSpinner from "../spinner/spinner.svelte";
  import NToggle from "../../components/toggle-switch/toggle-switch.svelte";
  import { UserStore } from "../../store/user";
  import { Lang } from "../../store/lang";
  import { Interact } from "../../store/interact";
  import Storage from "../../modules/storage/storage";
  import Remote from "../../modules/remote/remote";
  import URLParser from "../../utils/url-parser/url-parser"; // Get URL Parser

  let pouchEngine; // Holder for the pouchEngine
  let connecting = false;

  let state = {
    engine: null,
    isValidSyncURL: false,
    form: {
      username: null,
      password: null,
      host: null,
      database: null
    },
    success: false,
    syncing: false
  };

  const methods = {
    // Initialize Pouch DB
    init() {
      // Get Remote from Local STorage.
      if (state.remote.isValid()) {
        state.form.host = state.remote.url.toString();
        state.form.username = state.remote.username;
        state.form.password = state.remote.password;
        state.form.database = state.remote.database;
      }
    },
    isValidURL() {
      let url = URLParser(state.form.host);
      return url.valid;
    },
    isSyncing() {
      return pouchEngine.syncer !== null;
    },
    saveRemote() {
      let remote = new Remote({
        url: state.form.host,
        database: state.form.database,
        username: state.form.username || "".length ? state.form.username : null,
        password: state.form.password || "".length ? state.form.password : null,
        syncEnabled: true
      });
      pouchEngine.saveRemote(remote);
    },
    startSync() {
      state.syncing = true;
      pouchEngine.startSync();
    },
    stopSync() {
      state.syncing = false;
      pouchEngine.stopSync();
    },
    async connect() {
      connecting = true;
      let connection = methods.getConnectionURL();
      // Make a connection to pouch
      let testPouch = new PouchDB(connection, {
        auth: {
          username: state.form.username,
          password: state.form.password
        }
      });
      testPouch
        .info()
        .then(async info => {
          // If we get some data back - we're good
          // See if user wants to save this.
          let shouldSave = await Interact.confirm(
            Lang.t("general.success"),
            "Connected successfully! Would you like to save this connection?"
          );
          // If should save
          if (shouldSave) {
            methods.saveRemote();
            setTimeout(() => {
              methods.startSync();
              state.syncing = true;
            }, 120);
          }
          connecting = false;
        })
        .catch(e => {
          console.log("error connecting", e.message);
          Interact.alert(
            Lang.t("general.error-connecting", "Error Connecting"),
            Lang.t("storage.pouchdb.credentials-failed", e.message)
          );
          connecting = false;
        });
    },
    /**
     * Generate a Connection URL for Pouch
     * offer a mask param to hide the password
     */
    getConnectionURL(mask = false) {
      // Remove Password with Stars
      let dotted = str => {
        return "🔑";
        // return str;
      };
      // Parse the current URL
      try {
        // let urlDetails = new URL(state.form.host);
        let urlDetails = URLParser(state.form.host);
        state.isValidSyncURL = urlDetails.valid;
        let connection = null;
        if (mask) {
          connection = `${urlDetails.protocol}//${state.form.username}:${dotted(
            state.form.password
          )}@${urlDetails.host}${urlDetails.pathname}${state.form.database}`;
        } else {
          connection = `${urlDetails.protocol}//${urlDetails.host}/${state.form.database}`;
        }
        return connection;
      } catch (e) {
        console.log("Thrown error on urlparser", e);
        // alert(e.message);
        // It's an invalid URL
        state.isValidSyncURL = false;
        return "";
      }
    }
  };

  // Watch Form and Connection String
  let connectionString = null;

  let lastHost = null;
  $: if (state.form.host && state.form.host !== lastHost) {
    lastHost = state.form.host;
    connectionString = methods.getConnectionURL(true);
  }

  let lastDatabase = null;
  $: if (state.form.database && state.form.database !== lastDatabase) {
    lastDatabase = state.form.database;
    connectionString = methods.getConnectionURL(true);
  }

  let lastUsername = null;
  $: if (state.form.username && state.form.username !== lastUsername) {
    lastUsername = state.form.username;
    connectionString = methods.getConnectionURL(true);
  }

  let lastPassword = null;
  $: if (state.form.password && state.form.password !== lastPassword) {
    lastPassword = state.form.password;
    connectionString = methods.getConnectionURL(true);
  }

  onMount(async () => {
    // Get Pouch ENgine
    pouchEngine = Storage.getEngine();
    // Get Remote Settings
    state.remote = pouchEngine.getRemote();
    // Wait for it to be ready
    pouchEngine.onReady(() => {
      // Wait for syncer to turn on
      setTimeout(() => {
        // are we syncing?
        state.syncing = pouchEngine.syncer !== null;
      }, 500);
    });
    // Fire of Initialization
    methods.init();
  });
</script>

{#if pouchEngine}
  <div class="pouchdb storage-option">
    <NItem>
      <span
        slot="left"
        class="btn-icon zmdi text-primary zmdi-assignment-account" />
      <div class="title truncate">Sync to CouchDB</div>
      <div slot="right">
        <NToggle
          bind:value={state.remote.syncEnabled}
          on:change={event => {
            if (event.detail == false) {
              methods.stopSync();
            } else if (event.detail === true) {
              pouchEngine.startSync();
            }
          }} />
      </div>
    </NItem>

    {#if state.syncing}
      <div class="data-syncing">
        <NItem
          title="Syncing"
          className="text-red clickable"
          on:click={methods.stopSync}>
          <span
            slot="left"
            class="btn-icon zmdi text-primary zmdi-refresh-sync" />
          <div slot="right">
            <span class="fake-link text-red">Stop Sync</span>
          </div>
        </NItem>
      </div>
    {/if}

    {#if !state.syncing}
      <div class="data-sync-enabled">
        <NItem
          description="Host your own CouchDB server and to sync your data in
          near-real time across multiple devices." />

        <NItem className="input">
          <NInput
            type="text"
            bind:value={state.form.host}
            placeholder="https://my-couch-server:12345"
            autocomplete="off"
            autocorrect="false"
            autocapitalize="off" />

          <!-- {#if state.urlDetails}
            <div class="n-row text-xs" style="flex-wrap:wrap">
              <div class="mr-1">
                <strong>
                  {state.urlDetails.protocol == 'https:' ? 'Secure' : 'Not Secure'}:
                </strong>
                {state.urlDetails.protocol == 'https:' ? '★' : '✗'}
              </div>
              <div class="mr-1">
                <strong>Host:</strong>
                {state.urlDetails.hostname}
              </div>
              <div class="mr-1">
                <strong>Port:</strong>
                {state.urlDetails.port ? state.urlDetails.port : '80'}
              </div>
              <div class="mr-1">
                <strong>Path:</strong>
                {state.urlDetails.pathname}
              </div>
              <div class="filler" />
            </div>
          {/if} -->
        </NItem>

        <NItem>
          <NInput
            type="text"
            bind:value={state.form.database}
            placeholder="Database Name"
            autocomplete="off"
            autocorrect="false"
            autocapitalize="off" />
        </NItem>

        <NItem>
          <div class="n-row">
            <NInput
              className="mr-1 w-50"
              autocomplete="off"
              autocorrect="false"
              autocapitalize="off"
              type="email"
              placeholder="Username"
              bind:value={state.form.username} />
            <NInput
              className="ml-1 w-50"
              type="password"
              placeholder="Password"
              bind:value={state.form.password} />
          </div>
        </NItem>

        <NItem className="text-xs text-faded-3">{connectionString}</NItem>
        {#if state.isValidSyncURL}
          {#if !connecting}
            <NItem
              className="clickable text-primary text-center"
              on:click={methods.connect}>
              Connect...
            </NItem>
          {:else}
            <NItem
              className="clickable text-primary text-center"
              on:click={methods.connect}>
              <NSpinner size={20} />
              Connecting...
            </NItem>
          {/if}
        {/if}

      </div>
    {/if}
    <!-- end data-sync-enabled-->

  </div>
{/if}
