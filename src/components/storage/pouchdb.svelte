<script>
  import { onMount } from "svelte";
  import NItem from "../list-item/list-item.svelte";
  import NToggle from "../../components/toggle-switch/toggle-switch.svelte";
  import { UserStore } from "../../store/user";
  import { Lang } from "../../store/lang";
  import { Interact } from "../../store/interact";
  import Storage from "../../modules/storage/storage";
  import Remote from "../../modules/remote/remote";
  import URLParser from "../../utils/url-parser/url-parser"; // Get URL Parser

  let pouchEngine; // Holder for the pouchEngine

  let data = {
    engine: null,
    isValidSyncURL: false,
    form: {
      username: null,
      password: null,
      host: null
    },
    success: false,
    syncing: false
  };

  const methods = {
    // Initialize Pouch DB
    init() {
      // Get Remote from Local STorage.
      if (data.remote.isValid()) {
        data.form.host = data.remote.url.toString();
        data.form.username = data.remote.username;
        data.form.password = data.remote.password;
      }
    },
    isValidURL() {
      let url = URLParser(data.form.host);
      return url.valid;
    },
    isSyncing() {
      return pouchEngine.syncer !== null;
    },
    saveRemote() {
      let remote = new Remote({
        url: data.form.host,
        username: data.form.username || "".length ? data.form.username : null,
        password: data.form.password || "".length ? data.form.password : null,
        syncEnabled: true
      });
      pouchEngine.saveRemote(remote);
    },
    startSync() {
      data.syncing = true;
      pouchEngine.startSync();
    },
    stopSync() {
      data.syncing = false;
      pouchEngine.stopSync();
    },
    async connect() {
      let connection = methods.getConnectionURL();
      // Make a connection to pouch
      let testPouch = new PouchDB(connection);
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
              data.syncing = true;
            }, 120);
          }
        })
        .catch(e => {
          console.log("error connecting", e.message);
          Interact.alert(
            Lang.t("general.error-connecting", "Error Connecting"),
            Lang.t("storage.pouchdb.credentials-failed", e.message)
          );
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
        // let urlDetails = new URL(data.form.host);
        let urlDetails = URLParser(data.form.host);
        data.isValidSyncURL = urlDetails.valid;
        if (mask) {
          return `${urlDetails.protocol}//${data.form.username}:${dotted(
            data.form.password
          )}@${urlDetails.host}${urlDetails.pathname}${pouchEngine.dbKey}`;
        } else {
          return `${urlDetails.protocol}//${data.form.username}:${data.form.password}@${urlDetails.host}${urlDetails.pathname}${pouchEngine.dbKey}`;
        }
      } catch (e) {
        console.log("Thrown error on urlparser", e);
        // alert(e.message);
        // It's an invalid URL
        data.isValidSyncURL = false;
        return "";
      }
    }
  };

  // Watch Form and Connection String
  let connectionString = null;

  let lastHost = null;
  $: if (data.form.host && data.form.host !== lastHost) {
    lastHost = data.form.host;
    connectionString = methods.getConnectionURL(true);
  }

  let lastUsername = null;
  $: if (data.form.username && data.form.username !== lastUsername) {
    lastUsername = data.form.username;
    connectionString = methods.getConnectionURL(true);
  }

  let lastPassword = null;
  $: if (data.form.password && data.form.password !== lastPassword) {
    lastPassword = data.form.password;
    connectionString = methods.getConnectionURL(true);
  }

  onMount(async () => {
    // Get Pouch ENgine
    pouchEngine = Storage.getEngine();
    // Get Remote Settings
    data.remote = pouchEngine.getRemote();
    // Wait for it to be ready
    pouchEngine.onReady(() => {
      // Wait for syncer to turn on
      setTimeout(() => {
        // are we syncing?
        data.syncing = pouchEngine.syncer !== null;
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
          bind:value={data.remote.syncEnabled}
          on:change={event => {
            if (event.detail == false) {
              methods.stopSync();
            } else if (event.detail === true) {
              pouchEngine.startSync();
            }
          }} />
      </div>
    </NItem>

    {#if data.syncing}
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

    {#if data.remote.syncEnabled}
      {#if !data.syncing}
        <div class="data-sync-enabled">
          <NItem
            description="Host your own CouchDB server and to sync your data in
            near-real time across multiple devices." />

          <NItem className="input">
            <input
              class="form-control"
              type="text"
              bind:value={data.form.host}
              placeholder="https://my-couch-server:12345"
              autocomplete="off"
              autocorrect="false"
              autocapitalize="off" />

            {#if !methods.isValidURL()}
              <div class="n-row text-xs text-red">{data.form.host || ''}</div>
            {:else}
              <div class="n-row text-sm">{connectionString}</div>
            {/if}

            {#if data.urlDetails}
              <div class="n-row text-xs" style="flex-wrap:wrap">
                <div class="mr-1">
                  <strong>
                    {data.urlDetails.protocol == 'https:' ? 'Secure' : 'Not Secure'}:
                  </strong>
                  {data.urlDetails.protocol == 'https:' ? '★' : '✗'}
                </div>
                <div class="mr-1">
                  <strong>Host:</strong>
                  {data.urlDetails.hostname}
                </div>
                <div class="mr-1">
                  <strong>Port:</strong>
                  {data.urlDetails.port ? data.urlDetails.port : '80'}
                </div>
                <div class="mr-1">
                  <strong>Path:</strong>
                  {data.urlDetails.pathname}
                </div>
                <div class="filler" />
              </div>
            {/if}
          </NItem>
          <NItem>
            <input
              autocomplete="off"
              autocorrect="false"
              autocapitalize="off"
              class="form-control"
              type="email"
              placeholder="Username"
              bind:value={data.form.username} />
          </NItem>
          <NItem>
            <input
              class="form-control"
              type="password"
              placeholder="Password"
              bind:value={data.form.password} />
          </NItem>
          {#if data.isValidSyncURL}
            <NItem
              className="clickable text-primary text-center"
              on:click={methods.connect}>
              Connect...
            </NItem>
          {/if}

        </div>
      {/if}
      <!-- end data-sync-enabled-->
    {/if}
  </div>
{/if}
