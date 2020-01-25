<script>
  import { onMount } from "svelte";
  import NItem from "../list-item/list-item.svelte";
  import NToggle from "../../components/toggle-switch/toggle-switch.svelte";
  import { UserStore } from "../../store/user";
  import { Lang } from "../../store/lang";
  import { Interact } from "../../store/interact";
  import Storage from "../../modules/storage/storage";
  import Remote from "../../modules/remote/remote";

  let pouchEngine;

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
      let valid = false;
      try {
        let url = new URL(data.form.host);
        valid = true;
      } catch (e) {}
      return valid;
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
    async testConnection() {
      let connection = methods.getConnectionURL();
      let testPouch = new PouchDB(connection);
      testPouch
        .info()
        .then(async info => {
          let shouldSave = Interact.confirm(
            "Success!",
            "Connected successfully! Would you like to save this connection?"
          );
          if (shouldSave) {
            methods.saveRemote();
            setTimeout(() => {
              methods.startSync();
              data.syncing = true;
            }, 120);
          }
        })
        .catch(e => {
          Interact.alert(
            Lang.t("general.error-connecting", "Error Connecting"),
            Lang.t("storage.pouchdb.credentials-failed", e.message)
          );
        });

      //   fetch({
      //     url: data.form.host
      //   });
    },
    getConnectionURL() {
      // Remove Password with Stars
      let dotted = str => {
        if (str && str.length) {
          return new Array(str.length).fill("⭐️").join("");
        } else {
          return "";
        }
      };
      // Parse the current URL
      try {
        let urlDetails = new URL(data.form.host);
        data.isValidSyncURL = true;
        if (lastUsername) {
          return `${urlDetails.protocol}//${data.form.username}:${dotted(
            data.form.password
          )}@${urlDetails.host}${urlDetails.pathname}${pouchEngine.dbKey}`;
        } else {
          return `${urlDetails.protocol}//${urlDetails.host}${urlDetails.pathname}${pouchEngine.dbKey}`;
        }
      } catch (e) {
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
    connectionString = methods.getConnectionURL();
  }

  let lastUsername = null;
  $: if (data.form.username && data.form.username !== lastUsername) {
    lastUsername = data.form.username;
    connectionString = methods.getConnectionURL();
  }

  let lastPassword = null;
  $: if (data.form.password && data.form.password !== lastPassword) {
    lastPassword = data.form.password;
    connectionString = methods.getConnectionURL();
  }

  $: if (pouchEngine && pouchEngine.syncing) {
    data.syncing = pouchEngine.syncing;
  }

  onMount(async () => {
    // Get Pouch ENgine
    pouchEngine = Storage.getEngine();
    // Get Remote Settings
    data.remote = pouchEngine.getRemote();
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
    {#if data.remote.syncEnabled}
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
      {:else}
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
              autocomplete="off" />
            {#if !methods.isValidURL()}
              <div class="n-row text-xs text-red">
                {data.form.host} Invalid URL
              </div>
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
              class="form-control"
              type="text"
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
              className="clickable text-primary"
              on:click={methods.testConnection}>
              Test Connection
            </NItem>
          {/if}

        </div>
      {/if}
      <!-- end data-sync-enabled-->
    {/if}
  </div>
{/if}
