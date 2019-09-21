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

  // Vendors
  import dayjs from "dayjs";

  // Stores
  import { UserStore } from "../store/user";
  import { LedgerStore } from "../store/ledger";
  import { Interact } from "../store/interact";
  import { TrackerStore } from "../store/trackers";
  import { BoardStore } from "../store/boards";
  import { NomieAPI } from "../store/napi";
  import { Lang } from "../store/lang";
  // Config
  import config from "../../config/global";

  // consts
  // const Export = new Exporter();

  let data = {
    signedIn: false,
    files: [],
    showMassEditor: false
  };

  $: alwaysLocate = $UserStore.alwaysLocate;

  let ledger = null;
  let trackers = null;
  // let user = null;
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

    switchToCloud() {
      let msg = Lang.t("settings.switch-to-cloud-notice");
      Interact.confirm(Lang.t("settings.switch-to-cloud-confirm"), msg).then(
        res => {
          if (res === true) {
            UserStore.setStorage("blockstack");
            window.location.href = "/";
          }
        }
      );
    },
    switchToLocal() {
      let msg = Lang.t("settings.switch-to-local-notice");
      Interact.confirm(Lang.t("settings.switch-to-local-confirm"), msg).then(
        res => {
          if (res === true) {
            UserStore.setStorage("local");
            window.location.href = "/";
          }
        }
      );
    },
    settingChange() {
      UserStore.saveMeta();
    },
    // boardsToggle() {
    //   $UserStore.meta.boardsEnabled = !$UserStore.meta.boardsEnabled;
    //   UserStore.saveMeta();
    // },
    lockToggle() {
      if ($UserStore.meta.lock === true) {
        if (($UserStore.meta.pin || "").length == 0) {
          // TODO: figure out how to handle a cancel in the interact prompt
          Interact.prompt(Lang.t("settings.pin-details"), null, {
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

  // LedgerStore.subscribe(ldgr => {
  //   ledger = ldgr;
  // });

  // UserStore.subscribe(u => {
  //   if (u.signedIn) {
  //     user = u;
  //   }
  // });

  // TrackerStore.subscribe(tkrs => {
  //   trackers = tkrs || {};
  // });

  const setTimeout = setTimeout;
</script>

<NToolbar pinTop>
  <h2>{Lang.t('settings.settings')}</h2>
  <button on:click={methods.faq} class="btn btn-clear text-primary">
    {Lang.t('general.faq')}
  </button>
</NToolbar>
{#if $UserStore.meta}
  <div class="page page-settings with-header">
    <div class="container p-0 n-list">
      {#if $UserStore.storageType === 'blockstack'}
        <div class="n-pop">
          <NItem className="n-item-divider" title="Account" />

          <NItem>
            <div class="title truncate">
              {$UserStore.profile.username || 'Blockstack'}
            </div>
            <div slot="right">
              <button
                class="btn btn-small btn-clear text-primary"
                on:click={methods.sign_out}>
                {Lang.t('settings.sign-out')}
              </button>
            </div>
          </NItem>

        </div>
      {/if}

      <div class="n-pop">
        <NItem title={Lang.t('general.customize')} className="n-item-divider" />
        <NItem title={Lang.t('settings.theme')}>
          <span
            slot="left"
            class="btn-icon zmdi text-primary zmdi-invert-colors" />
          <div slot="right">
            <select
              class="form-control"
              style="min-width:100px;width:100px"
              bind:value={$UserStore.theme}
              on:change={event => {
                console.log('Change!', $UserStore.theme);
                UserStore.setTheme($UserStore.theme);
              }}>
              <option value="auto">Auto</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>

          </div>
        </NItem>
        <NItem title={Lang.t('settings.use-location')}>
          <span
            slot="left"
            class="btn-icon zmdi text-primary zmdi-my-location" />
          <div slot="right">
            <NToggle
              bind:value={$UserStore.alwaysLocate}
              on:change={event => {
                UserStore.setAlwaysLocate(event.detail);
              }} />
          </div>
        </NItem>

        {#if $BoardStore.boards.length == 0}
          <NItem title={Lang.t('settings.enable-boards')}>
            <span slot="left" class="btn-icon zmdi text-primary zmdi-tab" />
            <div slot="right">
              <NToggle
                bind:value={$UserStore.meta.boardsEnabled}
                on:change={methods.settingChange} />
            </div>
          </NItem>
        {:else}
          <NItem title={Lang.t('settings.enable-boards')} className="disabled">
            <span slot="left" class="btn-icon zmdi text-primary zmdi-tab" />
            <div slot="right">
              <NToggle value={true} locked={true} />
            </div>
          </NItem>
        {/if}
        <NItem title={Lang.t('settings.require-pin')}>
          <span slot="left" class="btn-icon zmdi text-primary zmdi-apps" />
          <div slot="right">
            <NToggle
              bind:value={$UserStore.meta.lock}
              on:change={methods.lockToggle} />
          </div>
        </NItem>
        <NItem title={Lang.t('settings.24-hour-clock')}>
          <span slot="left" class="btn-icon zmdi text-primary zmdi-time" />
          <div slot="right">
            <NToggle
              bind:value={$UserStore.meta.is24Hour}
              on:change={methods.settingChange} />
          </div>
        </NItem>

      </div>

      <div class="n-pop">
        <NItem title={Lang.t('settings.data')} className="n-item-divider" />
        <NItem
          className="clickable"
          title={Lang.t('settings.nomie-api')}
          on:click={() => navigate('/api')}>
          <span
            slot="left"
            class="btn-icon zmdi text-primary zmdi-code-setting" />
          <span slot="right" class="icon zmdi zmdi-chevron-right" />
        </NItem>
        <NItem
          className="clickable"
          title={Lang.t('settings.import-from-backup')}
          on:click={() => {
            showImporter = true;
          }}>
          <span
            slot="left"
            class="btn-icon zmdi text-primary zmdi-cloud-download" />
          <span slot="right" class="icon zmdi zmdi-chevron-right" />
          <input
            slot="right"
            class="d-none"
            type="file"
            bind:this={fileInput}
            on:change={methods.onImportFile} />
        </NItem>

        <NItem
          className="clickable"
          title={Lang.t('settings.generate-backup')}
          to="/settings/export/backup">
          <span
            slot="left"
            class="btn-icon zmdi text-primary zmdi-cloud-upload" />
          <span slot="right" class="icon zmdi zmdi-chevron-right" />
        </NItem>
        <NItem
          className="clickable"
          title={Lang.t('settings.generate-csv')}
          to="/settings/export/csv">
          <span slot="left" class="btn-icon zmdi text-primary zmdi-grid" />
          <span slot="right" class="icon zmdi zmdi-chevron-right" />
        </NItem>
        <NItem
          className="clickable"
          title="{Lang.t('settings.find-and-replace')}..."
          on:click={() => {
            data.showMassEditor = true;
          }}>
          <span
            slot="left"
            class="btn-icon zmdi text-primary zmdi-search-replace" />
          <span slot="right" class="icon zmdi zmdi-chevron-right" />
        </NItem>

        <MassEditor
          on:close={methods.closeMassEditor}
          show={data.showMassEditor} />

      </div>
      <div class="n-pop">
        <!-- Stoage List - this is stupid I couldn't find it-->
        <StorageManager />
        <!-- End Storage List-->
        <NItem>
          <div class="title truncate">
            <strong>
              {$UserStore.storageType === 'local' ? 'Local' : 'Cloud'}
            </strong>
          </div>
          <span slot="left" class="btn-icon zmdi text-primary zmdi-storage" />

          <div slot="right">
            {#if $UserStore.storageType === 'local'}
              <button
                class="btn btn-clear text-primary"
                on:click={methods.switchToCloud}>
                {Lang.t('settings.use-cloud')}
              </button>
            {:else}
              <button
                class="btn btn-clear text-primary"
                on:click={methods.switchToLocal}>
                {Lang.t('settings.use-local')}
              </button>
            {/if}
          </div>
        </NItem>

        <!-- <NItem title={Lang.t('settings.first-book')}>
          <span
            slot="left"
            class="btn-icon zmdi text-primary zmdi-book"
             />

          <div slot="right" class="pr-2">
            {#await LedgerStore.firstBook()}
              <span>Loading...</span>
            {:then value}
              <span>{methods.bookAge(value)}</span>
            {:catch error}
              <span>{error}</span>
            {/await}
          </div>
        </NItem> -->
        {#if $UserStore.storageType === 'blockstack'}
          <NItem title={Lang.t('settings.aggressive-sync')}>
            <span
              slot="left"
              class="btn-icon zmdi text-primary {`${$UserStore.meta.aggressiveSync ? 'zmdi-refresh-sync' : 'zmdi-refresh-sync-off'}`}" />
            <div slot="right">
              <NToggle
                bind:value={$UserStore.meta.aggressiveSync}
                on:change={methods.settingChange} />
            </div>
          </NItem>
          <NItem description={Lang.t('settings.aggressive-description')} />
        {/if}
      </div>

      <div class="n-pop">
        <NItem
          title={Lang.t('settings.about-nomie')}
          className="n-item-divider" />
        <NItem title="Learn More">
          <span slot="right">
            <a
              href="https://nomie.app?s=dap"
              class="btn btn-clear text-primary"
              target="_system">
              Website
            </a>
          </span>
        </NItem>
        <NItem title="Reddit r/nomie">
          <span slot="right">
            <a
              href="https://reddit.com/r/nomie"
              class="btn btn-clear text-primary"
              target="_system">
              r/nomie
            </a>
          </span>
        </NItem>

        <NItem title="Open Source">
          <span slot="right">
            <a
              href="https://github.com/open-nomie/nomie"
              class="btn btn-clear text-primary"
              target="_system">
              Github
            </a>
          </span>
        </NItem>

        <NItem className="compact item-divider" />

        <NItem title="Version">
          <span slot="right" class="pr-2 text-sm">APP_VERSION</span>
        </NItem>
        <NItem title="Built">
          <span slot="right" class="pr-2 text-sm">APP_BUILD_DATE</span>
        </NItem>

      </div>

      <div class="n-pop pt-2">
        <NItem title={Lang.t('general.questions')}>
          <span slot="right">
            <a
              class="btn btn-clear text-primary"
              href={`mailto:${config.support_email}?subject=Open Nomie Support`}>
              {config.support_contact}
            </a>
          </span>

        </NItem>
        <NItem className="compact item-divider" />
        <NItem title="Copyright 2019. All Rights Reserved." className="pb-3">
          <NText tag="div" size="sm">
            Nomie&reg; by
            <a href="https://www.happydata.org" traget="_system">
              Happy Data, LLC
            </a>
          </NText>
        </NItem>

      </div>

    </div>
  </div>
{/if}

{#if showImporter}
  <ImporterModal on:dismiss={() => (showImporter = false)} />
{/if}
