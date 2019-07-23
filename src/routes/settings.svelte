<script>
  //Vendors
  import { navigate } from "svelte-routing";

  // Components
  import NItem from "../components/list-item/list-item.svelte";
  import NText from "../components/text/text.svelte";
  import NToggle from "../components/toggle-switch/toggle-switch.svelte";
  import NToolbar from "../components/toolbar/toolbar.svelte";

  // Containers
  import StorageManager from "../containers/storage/storage.svelte";
  import ImporterModal from "../containers/importer/importer.svelte";

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
  // Config
  import config from "../../config/global";

  // consts
  const Export = new Exporter();

  let data = {
    signedIn: false,
    files: []
  };

  $: alwaysLocate = $UserStore.alwaysLocate;

  let ledger = null;
  let trackers = null;
  let user = null;
  let fileInput;
  let showImporter = false;

  let methods = {
    sign_out() {
      blockstack.signUserOut(window.location.origin);
      localStorage.clear();
    },
    sign_in() {
      UserStore.redirectToSignIn();
    },
    bookAge(date) {
      return dayjs(`${date}-01`).fromNow();
    },
    faq() {
      navigate("/faq");
    },
    export() {
      Export.onChange(change => {
        console.log("change", change);
      });
      Export.start().then(() => {
        console.log("Done with export");
      });
    },
    lockToggle() {
      if ($UserStore.meta.lock === true) {
        if (($UserStore.meta.pin || "").length == 0) {
          Interact.prompt("Enter 1 to 6 digit pin", { value: "" }).then(pin => {
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
      <div class="n-pop my-3">
        <NItem className="n-item-divider" borderBottom title="Account" />
        <NItem>
          <div class="title truncate">{$UserStore.profile.username}</div>
          <div slot="right">
            <button
              class="btn btn-small btn-clear text-primary"
              on:click={methods.sign_out}>
              Sign Out
            </button>
          </div>
        </NItem>

      </div>

      <div class="n-pop my-3">
        <NItem title="Use Location">
          <div slot="right">
            <NToggle
              bind:value={$UserStore.alwaysLocate}
              on:change={event => {
                UserStore.setAlwaysLocate(event.detail);
              }} />
          </div>
        </NItem>
        <NItem title="Dark Mode">
          <div slot="right">
            <NToggle
              bind:value={$UserStore.darkMode}
              on:change={event => {
                UserStore.setDarkMode(event.detail);
              }} />
          </div>
        </NItem>
        <NItem title="Require Pin">
          <div slot="right">
            <NToggle
              bind:value={$UserStore.meta.lock}
              on:change={methods.lockToggle} />
          </div>
        </NItem>
      </div>

      <div class="n-pop my-3">
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
        <NItem title="Export as JSON">
          <button
            class="btn-clear btn text-primary"
            on:click={methods.export}
            slot="right">
            Save...
          </button>
        </NItem>
      </div>
      <div class="n-pop my-3">
        <StorageManager />
        <NItem title="First Book Created">
          <div slot="right">
            {#await LedgerStore.firstBook()}
              <span>Loading...</span>
            {:then value}
              <span>{methods.bookAge(value)}</span>
            {:catch error}
              <span>{error}</span>
            {/await}
          </div>
        </NItem>
      </div>

      <div class="n-pop my-3">
        <NItem title="About Nomie" borderBottom className="n-item-divider" />
        <NItem title="Learn More">
          <span slot="right">
            <a href="https://nomie.app?s=dap" target="_system">Nomie Website</a>
          </span>
        </NItem>
        <NItem title="Open Source">
          <span slot="right">
            <a href="https://github.com/open-nomie/nomie" target="_system">
              Github
            </a>
          </span>
        </NItem>
        <NItem title="Version">
          <span slot="right">APP_VERSION</span>
        </NItem>
        <NItem title="Url">
          <span slot="right">APP_URL</span>
        </NItem>
        <NItem title="Built">
          <span slot="right">APP_BUILD_DATE</span>
        </NItem>

      </div>

      <div class="n-pop my-3 pt-2">
        <NItem title="Questions?">
          <a
            slot="right"
            class="btn btn-clear text-primary"
            href={`mailto:${config.support_email}?subject=Open Nomie Support`}>
            {config.support_contact}
          </a>
        </NItem>
        <NItem className="compact item-divider" />
        <NItem title="Copyright 2019 All Rights Reserved.">
          <NText tag="div" size="sm">
            Nomie, and the Elephant are trademarks of Happy Data, LLC.
          </NText>
        </NItem>

      </div>

    </div>
  </div>
{/if}

{#if showImporter}
  <ImporterModal on:dismiss={() => (showImporter = false)} />
{/if}
