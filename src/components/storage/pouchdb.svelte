<script>
  import { onMount } from "svelte";
  import NItem from "../list-item/list-item.svelte";
  import NToggle from "../../components/toggle-switch/toggle-switch.svelte";
  import { UserStore } from "../../store/user";
  import { Lang } from "../../store/lang";
  import { Interact } from "../../store/interact";
  import Storage from "../../modules/storage/storage";

  let data = {
    engine: null,
    enabled: false,
    remote: null,
    canSave: false,
    invalidURL: true,
    urlDetails: null,
    form: {
      username: null,
      password: null,
      host: null
    },
    request: null,
    requestDisplay: null,
    success: false
  };

  console.log("## pouchDB", data);

  const methods = {
    init() {
      data.remote = Storage.local.get("pouch-remote") || null;
      if (data.engine) {
        if (data.engine.remote) {
          data.remote = data.engine.remote;
          data.form.username;
          data.enabled = data.engine.sync;
          data.syncing = true;
        }
      }
      if (data.remote) {
        data.form = { ...data.remote };
      }
    },
    startSync() {
      data.syncing = true;
      data.engine.startSync();
      data.engine.remote.valid = true;
    },
    stopSync() {
      data.syncing = false;
      data.engine.stopSync();
      data.engine.remote.valid = false;
    },
    testConnection() {
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
            data.form.valid = true;
            Storage.local.put("pouchdb-remote", data.form);
            methods.startSync();
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
      if (data.urlDetails) {
        let auth = btoa(`${data.form.username}:${data.form.password}`);
        return `${data.urlDetails.protocol}//${data.form.username}:${data.form.password}@${data.urlDetails.host}${data.urlDetails.pathname}${data.engine.dbKey}`;
      } else {
        return null;
      }
    }
  };

  //   $: if ((data.engine || {}).sync)  {
  //     console.log("data engine sync change", data.engine.sync);
  //   } else {
  //     console.log("data sync off");
  //   }

  $: if (data.form.username && data.form.password && data.form.host) {
    console.log("Can save!");
    data.form.auth = btoa(data.form.username + ":" + data.form.password);
    data.canSave = true;
  }

  let lastHost = null;

  $: if (data.form.host && data.form.host !== lastHost) {
    lastHost = data.form.host;
    try {
      let url = new URL(data.form.host);
      data.invalidURL = false;
      data.urlDetails = url;
    } catch (e) {
      data.invalidURL = true;
      data.urlDetails = null;
      data.request = null;
      data.requestDisplay = null;
    }
  }

  onMount(async () => {
    console.log("STORAGE", Storage);
    data.engine = Storage.getEngine();
    methods.init();
  });
</script>

{#if data.engine}
  <div class="pouchdb storage-option">
    <NItem>
      <span
        slot="left"
        class="btn-icon zmdi text-primary zmdi-assignment-account" />
      <div class="title truncate">Sync to CouchDB</div>
      <div slot="right">
        <NToggle
          bind:value={data.engine.sync}
          on:change={event => {
            Storage.local.put('pouchdb-sync', event.detail);
            if (event.detail == false) {
              methods.stopSync();
            } else if (event.detail === true) {
              data.engine.startSync();
              data.syncing = true;
            }
          }} />
      </div>
    </NItem>
    {#if data.engine.sync}
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
            {#if data.invalidURL && data.form.host}
              <div class="n-row text-xs text-red">Invalid URL</div>
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
          {#if data.canSave}
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
