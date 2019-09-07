<script>
  //Vendors
  import { navigate, Link } from "svelte-routing";

  // Components
  import NItem from "../components/list-item/list-item.svelte";
  import NText from "../components/text/text.svelte";
  import NToggle from "../components/toggle-switch/toggle-switch.svelte";
  import NToolbar from "../components/toolbar/toolbar.svelte";

  // Containers
  import StorageManager from "../containers/storage/storage.svelte";
  import ImporterModal from "../containers/importer/importer.svelte";
  import MassEditor from "../containers/mass-editor/mass-editor.svelte";

  //Modules
  import Exporter from "../modules/export/export";

  // Vendors
  import dayjs from "dayjs";

  // Stores
  import { UserStore } from "../store/user";
  import { LedgerStore } from "../store/ledger";
  import { Interact } from "../store/interact";
  import { TrackerStore } from "../store/trackers";
  import { BoardStore } from "../store/boards";
  import { NomieAPI } from "../store/napi";
  // Config
  import config from "../../config/global";

  // consts
  const Export = new Exporter();

  let data = {
    signedIn: false,
    files: [],
    showMassEditor: false
  };

  $: alwaysLocate = $UserStore.alwaysLocate;

  let ledger = null;
  let trackers = null;
  let user = null;
  let fileInput;
  let showImporter = false;

  let methods = {
    sign_out() {
      UserStore.signout();
    },
    sign_in() {
      UserStore.redirectToSignIn();
    },
    closeMassEditor() {
      console.log("closing");
      data.showMassEditor = false;
    },
    bookAge(date) {
      return dayjs(`${date}-01`).fromNow();
    },
    faq() {
      navigate("/faq");
    },
    export() {
      Interact.confirm(
        `Continue?`,
        `This process might take a couple minutes. 
        If you have a lot of data, it will seem like it gets hung up. 
        Have patience.`
      ).then(res => {
        if (res === true) {
          Export.onChange(change => {
            Interact.toast(`Export: ${change}`, true);
          });
          Export.start().then(() => {
            Interact.toast("Export Done!");
          });
        }
      });
    },
    switchToCloud() {
      let msg = `Data is not automatically migrated to the cloud.
                You should export your local data first, then import it once the switch is complete. 
                You can always switch back`;
      Interact.confirm("Switch to Blockstack - Are you sure?", msg).then(
        res => {
          if (res === true) {
            UserStore.setStorage("blockstack");
            window.location.href = "/";
          }
        }
      );
    },
    switchToLocal() {
      let msg = `Data is not automatically migrated FROM the cloud.
                You should export your data first, then import it once the switch is complete. 
                You can always switch back`;
      Interact.confirm("Switch to Local - Are you sure?", msg).then(res => {
        if (res === true) {
          UserStore.setStorage("local");
          window.location.href = "/";
        }
      });
    },
    settingChange() {
      UserStore.saveMeta();
    },
    lockToggle() {
      if ($UserStore.meta.lock === true) {
        if (($UserStore.meta.pin || "").length == 0) {
          // TODO: figure out how to handle a cancel in the interact prompt
          Interact.prompt("Enter 1 to 6 digit pin", {
            value: "",
            valueType: "number"
          }).then(pin => {
            if (!pin) {
              $UserStore.meta.lock = false;
              $UserStore.meta.pin = null;
              UserStore.saveMeta();
            } else {
              $UserStore.meta.lock = true;
              $UserStore.meta.pin = pin;
              UserStore.saveMeta();
            }
          });
        }
      } else {
        $UserStore.meta.lock = false;
        $UserStore.meta.pin = null;
        UserStore.saveMeta();
      }
    }
  };

  LedgerStore.subscribe(ldgr => {
    ledger = ldgr;
  });

  UserStore.subscribe(u => {
    if (u.signedIn) {
      user = u;
    }
  });

  TrackerStore.subscribe(tkrs => {
    trackers = tkrs || {};
  });

  const setTimeout = setTimeout;
</script>

<NToolbar pinTop>
  <h2>Settings</h2>
  <button on:click={methods.faq} class="btn btn-clear text-primary">FAQ</button>
</NToolbar>
{#if $UserStore.meta}
  <div class="page page-settings with-header">
    <div class="container p-0 n-list">
      {#if $UserStore.storageType === 'blockstack'}
        <div class="n-pop my-3">
          <NItem className="n-item-divider" borderBottom title="Account" />

          <NItem>
            <div class="title truncate">
              {$UserStore.profile.username || 'Blockstack'}
            </div>
            <div slot="right">
              <button
                class="btn btn-small btn-clear text-primary"
                on:click={methods.sign_out}>
                Sign Out
              </button>
            </div>
          </NItem>

        </div>
      {/if}

      <div class="n-pop my-3">
        <NItem title="Use Location">
          <span
            slot="left"
            class="btn-icon zmdi zmdi-my-location"
            style="color:#F03A47" />
          <div slot="right">
            <NToggle
              bind:value={$UserStore.alwaysLocate}
              on:change={event => {
                UserStore.setAlwaysLocate(event.detail);
              }} />
          </div>
        </NItem>
        <NItem title="Dark Mode">
          <span
            slot="left"
            class="btn-icon zmdi zmdi-brightness-2"
            style="color:#666" />
          <div slot="right">
            <NToggle
              bind:value={$UserStore.darkMode}
              on:change={event => {
                UserStore.setDarkMode(event.detail);
              }} />
          </div>
        </NItem>
        <NItem title="Require Pin">
          <span
            slot="left"
            class="btn-icon zmdi zmdi-apps"
            style="color:#71A2B6" />
          <div slot="right">
            <NToggle
              bind:value={$UserStore.meta.lock}
              on:change={methods.lockToggle} />
          </div>
        </NItem>
        <NItem title="24 Hour Clock">
          <span
            slot="left"
            class="btn-icon zmdi zmdi-time"
            style="color:#666" />
          <div slot="right">
            <NToggle
              bind:value={$UserStore.meta.is24Hour}
              on:change={methods.settingChange} />
          </div>
        </NItem>

      </div>

      <div class="n-pop my-3">
        <NItem title="Data" borderBottom className="n-item-divider" />
        <NItem title="Nomie API" on:click={() => navigate('/api')}>
          <span
            slot="left"
            class="btn-icon zmdi zmdi-code-setting"
            style="color:#600047" />
          <span slot="right" class="icon zmdi zmdi-chevron-right" />
        </NItem>
        <NItem
          title="Import from Backup"
          on:click={() => {
            showImporter = true;
          }}>
          <span
            slot="left"
            class="btn-icon zmdi zmdi-cloud-download"
            style="color:#00487C" />
          <span slot="right" class="icon zmdi zmdi-chevron-right" />
          <input
            slot="right"
            class="d-none"
            type="file"
            bind:this={fileInput}
            on:change={methods.onImportFile} />
        </NItem>
        <NItem title="Generate Backup" on:click={methods.export}>
          <span
            slot="left"
            class="btn-icon zmdi zmdi-cloud-upload"
            style="color:#9E0031" />
          <span slot="right" class="icon zmdi zmdi-chevron-right" />
        </NItem>
        <NItem
          title="Find and Replace..."
          on:click={() => {
            data.showMassEditor = true;
          }}>
          <span
            slot="left"
            class="btn-icon zmdi zmdi-search-replace"
            style="color:#0CCA4A" />
          <span slot="right" class="icon zmdi zmdi-chevron-right" />
        </NItem>

        <MassEditor
          on:close={methods.closeMassEditor}
          show={data.showMassEditor} />

      </div>
      <div class="n-pop my-3">
        <!-- Stoage List - this is stupid I couldn't find it-->
        <StorageManager />
        <!-- End Storage List-->
        <NItem>
          <div class="title truncate">
            <strong>
              {$UserStore.storageType === 'local' ? 'Local' : 'Cloud'}
            </strong>
          </div>
          <span
            slot="left"
            class="btn-icon zmdi zmdi-storage"
            style="color:#F18F01" />

          <div slot="right">
            {#if $UserStore.storageType === 'local'}
              <button
                class="btn btn-clear text-primary"
                on:click={methods.switchToCloud}>
                Use Cloud
              </button>
            {:else}
              <button
                class="btn btn-clear text-primary"
                on:click={methods.switchToLocal}>
                Use Local
              </button>
            {/if}
          </div>
        </NItem>

        <NItem title="First Book Created">
          <span
            slot="left"
            class="btn-icon zmdi zmdi-book"
            style="color:#D741A7" />

          <div slot="right" class="pr-2">
            {#await LedgerStore.firstBook()}
              <span>Loading...</span>
            {:then value}
              <span>{methods.bookAge(value)}</span>
            {:catch error}
              <span>{error}</span>
            {/await}
          </div>
        </NItem>
        {#if $UserStore.storageType === 'blockstack'}
          <NItem title="Aggressive Sync">
            <span
              slot="left"
              class="btn-icon zmdi {`${$UserStore.meta.aggressiveSync ? 'zmdi-refresh-sync' : 'zmdi-refresh-sync-off'}`}"
              style="color:#A2AEBB" />
            <div slot="right">
              <NToggle
                bind:value={$UserStore.meta.aggressiveSync}
                on:change={methods.settingChange} />
            </div>
          </NItem>
          <NItem
            description="Using Nomie on multiple devices? Enable Aggressive Sync
            to sync more frequently" />
        {/if}
      </div>

      <div class="n-pop my-3">
        <NItem title="About Nomie" borderBottom className="n-item-divider" />
        <NItem title="Learn More">
          <span slot="right" class="pr-2">
            <a href="https://nomie.app?s=dap" target="_system">Website</a>
          </span>
        </NItem>
        <NItem title="Reddit r/nomie">
          <span slot="right" class="pr-2">
            <a href="https://reddit.com/r/nomie" target="_system">r/nomie</a>
          </span>
        </NItem>

        <NItem title="Open Source">
          <span slot="right" class="pr-2">
            <a href="https://github.com/open-nomie/nomie" target="_system">
              Github
            </a>
          </span>
        </NItem>

        <NItem className="compact item-divider" />

        <NItem title="Version">
          <span slot="right" class="pr-2">APP_VERSION</span>
        </NItem>
        <NItem title="Url">
          <span slot="right" class="pr-2">APP_URL</span>
        </NItem>
        <NItem title="Built">
          <span slot="right" class="pr-2">APP_BUILD_DATE</span>
        </NItem>

      </div>

      <div class="n-pop my-3 pt-2">
        <NItem title="Questions?">
          <span slot="right" class="pr-2">
            <a
              href={`mailto:${config.support_email}?subject=Open Nomie Support`}>
              {config.support_contact}
            </a>
          </span>

        </NItem>
        <NItem className="compact item-divider" />
        <NItem title="Copyright 2019 All Rights Reserved." className="pb-3">
          <NText tag="div" size="sm">
            Nomie & Elephant are trademarks of
            <a href="https://www.happydata.org">Happy Data, LLC</a>
          </NText>
        </NItem>

      </div>

    </div>
  </div>
{/if}

{#if showImporter}
  <ImporterModal on:dismiss={() => (showImporter = false)} />
{/if}
