<script>
  //Vendors
  import { navigate, Link } from "svelte-routing";
  import { onMount } from "svelte";

  import SocialShare from "../modules/share/share";
  import Storage from "../modules/storage/storage";
  // Components
  import NItem from "../components/list-item/list-item.svelte";

  import NIcon from "../components/icon/icon.svelte";
  import NToggle from "../components/toggle-switch/toggle-switch.svelte";
  import NToolbar from "../components/toolbar/toolbar.svelte";
  import NButtonGroup from "../components/button-group/button-group.svelte";
  import BlockstackOptions from "../components/storage/blockstack.svelte";
  import LocalstorageOptions from "../components/storage/localstorage.svelte";
  import PouchDBOptions from "../components/storage/pouchdb.svelte";

  // Containers
  import StorageManager from "../containers/storage/storage.svelte";
  import ImporterModal from "../containers/importer/importer.svelte";
  import MassEditor from "../containers/mass-editor/mass-editor.svelte";

  import NLayout from "../containers/layout/layout.svelte";

  // Vendors
  import dayjs from "dayjs";
  import localforage from "localforage";

  // Stores
  import { UserStore } from "../store/user";
  import { LedgerStore } from "../store/ledger";
  import { Interact } from "../store/interact";
  import { TrackerStore } from "../store/tracker-store";
  import { BoardStore } from "../store/boards";
  import { NomieAPI } from "../store/napi";
  import { Lang } from "../store/lang";
  import { PeopleStore } from "../store/people-store";
  import { Browser } from "../store/browser-store";

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
    share() {
      SocialShare(
        `I track my life with Nomie! It's free, private, and you get to design what you track. @nomieapp`,
        "https://nomie.app"
      );
    },
    locations() {
      Interact.pickLocation();
    },
    sign_in() {
      UserStore.redirectToSignIn();
    },
    closeMassEditor() {
      data.showMassEditor = false;
    },
    bookAge(date) {
      return dayjs(`${date}-01`).fromNow();
    },
    faq() {
      navigate("/faq");
    },
    shop() {
      navigate("/shop");
    },

    // switchToCloud() {
    //   let msg = Lang.t("settings.switch-to-cloud-notice");
    //   Interact.confirm(Lang.t("settings.switch-to-cloud-confirm"), msg).then(
    //     res => {
    //       if (res === true) {
    //         UserStore.setStorage("blockstack");
    //         window.location.href = "/";
    //       }
    //     }
    //   );
    // },
    // switchToLocal() {
    //   let msg = Lang.t("settings.switch-to-local-notice");
    //   Interact.confirm(Lang.t("settings.switch-to-local-confirm"), msg).then(
    //     res => {
    //       if (res === true) {
    //         UserStore.setStorage("local");
    //         window.location.href = "/";
    //       }
    //     }
    //   );
    // },
    settingChange() {
      UserStore.saveMeta();
    },
    async deleteEverything() {
      try {
        let res = await Interact.confirm(
          "DANGER ZONE!",
          `This will destroy all of your data in Nomie. Are you sure?`,
          "Destroy"
        );
        if (res) {
          res = await Interact.confirm(
            "Sorry! One last time.. Really?",
            `You will basically be starting over from scratch... You good with that?`,
            "Destroy!"
          );

          if (res === true) {
            Interact.blocker("Deleting data...");
            let files = await Storage.list();

            let promises = [];
            files.forEach(file => {
              promises.push(Storage.delete(file));
            });
            await Promise.all(promises);
            await localforage.clear();
            localStorage.clear();
            Interact.stopBlocker();
            await Interact.alert("Done", "Your data has been destroyed.");

            window.location.href = "/";
          }
        } // end if confirmed
      } catch (e) {
        Interact.alert(Lang.t("general.error"), e.message);
      }
    },
    switchStorage(type) {
      let from = $UserStore.storageType;
      let to = type;
      let conf = confirm(
        `${Lang.t(
          "storage.switch",
          `Switch from ${from} to ${to}? You can always switch back. 

Note: Your data will not automatically move over. You'll first need to export it, then you can import into this new storage.`
        )}`
      );
      if (conf === true) {
        if (["local", "pouchdb", "blockstack"].indexOf(to) > -1) {
          UserStore.setStorage(to);
          Interact.reload();
        } else {
          alert(`Error: ${to} is not valid`);
        }
      }
    },
    storageMenu() {
      let buttons = [
        {
          title: `${$UserStore.storageType === "local" ? "✓" : ""} ${Lang.t(
            "storage.local_title",
            "This Device Only"
          )}`,
          description: Lang.t(
            "storage.local_description",
            "Good for getting started, but make sure you backup your data."
          ),
          click() {
            methods.switchStorage("local");
          }
        },
        {
          title: `${
            $UserStore.storageType === "blockstack" ? "✓" : ""
          } Blockstack`,
          description: Lang.t(
            "storage.blockstack_description",
            "Stored encryted with Blockstack's file storage. FREE"
          ),
          click() {
            methods.switchStorage("blockstack");
          }
        },
        {
          title: `${$UserStore.storageType === "pouchdb" ? "✓" : ""} ${Lang.t(
            "storage.pouchdb_title",
            "Device + My own CouchDB"
          )}`,
          description: Lang.t(
            "storage.pouchdb_description",
            "Have a CouchDB server? Sync in near-real time."
          ),
          click() {
            methods.switchStorage("pouchdb");
          }
        }
      ];
      Interact.popmenu({
        title: Lang.t("storage.type_selector_title", `Storage Options`),
        description: Lang.t(
          "storage.type_selector_title",
          `How would you like your data stored?`
        ),
        buttons: buttons
      });
    },
    // boardsToggle() {
    //   $UserStore.meta.boardsEnabled = !$UserStore.meta.boardsEnabled;
    //   UserStore.saveMeta();
    // },
    async lockToggle() {
      if ($UserStore.meta.lock === true) {
        if (($UserStore.meta.pin || "").length == 0) {
          // TODO: figure out how to handle a cancel in the interact prompt
          let pin = await Interact.prompt(
            Lang.t("settings.pin-details"),
            null,
            {
              value: "",
              valueType: "number"
            }
          );

          if (!pin) {
            $UserStore.meta.lock = false;
            $UserStore.meta.pin = null;
            UserStore.saveMeta();
          } else {
            $UserStore.meta.lock = true;
            $UserStore.meta.pin = pin;
            UserStore.saveMeta();
          }
        }
      } else {
        $UserStore.meta.lock = false;
        $UserStore.meta.pin = null;
        UserStore.saveMeta();
      }
    }
  };
  let view = Storage.local.get("settings/last-view") || "tweaks";
  function changeView(v) {
    view = v;
    Storage.local.put("settings/last-view", v);
  }
  // const setTimeout = setTimeout;
  onMount(() => {
    window.scrollTo(0, 0);
  });
</script>

<NLayout pageTitle="Settings">
  <div slot="header">
    <div class="n-toolbar-grid container">
      <div class="left" />
      <div class="main">
        <h1>{Lang.t('settings.settings')}</h1>
      </div>
      <div class="right">
        <button on:click={methods.faq} class="btn tap-text">
          {Lang.t('general.faq')}
        </button>
      </div>
    </div>
    <div class="n-toolbar-grid container">

      <div class="main">
        <NButtonGroup
          buttons={[{ label: 'Tweaks', active: view == 'tweaks', click() {
                changeView('tweaks');
              } }, { label: 'Data', active: view == 'data', click() {
                changeView('data');
              } }, { label: 'About', active: view == 'about', click() {
                changeView('about');
              } }]} />
      </div>
    </div>
  </div>

  <div slot="content">
    {#if $UserStore.meta}
      <div class="page page-settings">
        <div class="container p-0">

          {#if view == 'tweaks'}
            <!--
              *******************************************
              TWEAKS VIEW 
              *******************************************
            -->
            <div class="n-list solo">
              <NItem title={Lang.t('settings.theme')}>
                <div slot="right">
                  <select
                    class="form-control"
                    style="min-width:100px;width:100px"
                    bind:value={$UserStore.theme}
                    on:change={event => {
                      UserStore.setTheme($UserStore.theme);
                    }}>
                    <option value="auto">Auto</option>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>

                </div>
              </NItem>

              <!-- Use Location -->
              <NItem title={Lang.t('settings.use-location')}>

                <div slot="right">
                  <NToggle
                    bind:value={$UserStore.alwaysLocate}
                    on:change={event => {
                      UserStore.setAlwaysLocate(event.detail);
                    }} />
                </div>
              </NItem>
              <NItem
                title={Lang.t('settings.small-tracker-buttons', 'Small Tracker Buttons')}>
                <div slot="right">
                  <NToggle
                    bind:value={$UserStore.meta.compactTrackerButtons}
                    on:change={methods.settingChange} />
                </div>
              </NItem>
              <!-- Tracker Board Tabs -->
              {#if $BoardStore.boards.length == 0}
                <NItem title={Lang.t('settings.enable-boards')}>
                  <div slot="right">
                    <NToggle
                      bind:value={$UserStore.meta.boardsEnabled}
                      on:change={methods.settingChange} />
                  </div>
                </NItem>
              {/if}
              <!-- Pin Code -->
              <NItem title={Lang.t('settings.require-pin')}>

                <div slot="right">
                  <NToggle
                    bind:value={$UserStore.meta.lock}
                    on:change={methods.lockToggle} />
                </div>
              </NItem>
              <!-- 24 Hour -->
              <NItem title={Lang.t('settings.24-hour-clock')}>

                <div slot="right">
                  <NToggle
                    bind:value={$UserStore.meta.is24Hour}
                    on:change={methods.settingChange} />
                </div>
              </NItem>
              <!-- Language -->
              <NItem title={Lang.t('settings.language')}>

                <div slot="right">
                  <select
                    class="form-control"
                    style="min-width:100px;width:100px"
                    bind:value={$Lang.lang}
                    on:change={event => {
                      Lang.setLang($Lang.lang);
                    }}>
                    {#each Lang.getLangs() as lang}
                      <option value={lang.key}>{lang.label}</option>
                    {/each}
                  </select>

                </div>
              </NItem>

            </div>
          {:else if view == 'data'}
            <!--
              *******************************************
              DATA VIEW
              *******************************************
            -->
            <div class="n-list solo">

              <NItem
                className="clickable"
                title={Lang.t('settings.nomie-api')}
                on:click={() => navigate('/api')}>

                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>

              </NItem>
              <NItem
                className="clickable"
                title={Lang.t('settings.import-from-backup')}
                on:click={() => {
                  showImporter = true;
                }}>

                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
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

                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
              </NItem>
              <NItem
                className="clickable"
                title={Lang.t('settings.generate-csv')}
                to="/settings/export/csv">
                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
              </NItem>
              <NItem
                className="clickable"
                title="{Lang.t('settings.find-and-replace')}..."
                on:click={() => {
                  data.showMassEditor = true;
                }}>
                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
              </NItem>

              <!-- Find and Replace -->
              <MassEditor
                on:close={methods.closeMassEditor}
                show={data.showMassEditor} />

            </div>

            <div class="n-list solo">
              <NItem>
                <div class="title truncate">
                  <strong>{Lang.t('general.type', 'Type')}</strong>
                </div>

                <div slot="right">

                  <button
                    class="btn btn-clear icon-right"
                    on:click={methods.storageMenu}>
                    {#if $UserStore.storageType === 'local'}
                      {Lang.t('storage.local', 'Local')}
                    {:else if $UserStore.storageType === 'pouchdb'}
                      f {Lang.t('storage.pouchdb', 'Local + CouchDB')}
                    {:else if $UserStore.storageType === 'blockstack'}
                      {Lang.t('storage.blockstack', 'Blockstack')}
                    {/if}
                    <NIcon name="chevronDown" size="16" className="ml-2" />
                  </button>
                  <!-- {#if $UserStore.storageType === 'local'}
                <button
                  class="btn btn-clear text-primary-bright"
                  on:click={methods.switchToCloud}>
                  {Lang.t('settings.use-cloud')}
                </button>
              {:else}
                <button
                  class="btn btn-clear text-primary-bright"
                  on:click={methods.switchToLocal}>
                  {Lang.t('settings.use-local')}
                </button>
              {/if} -->
                </div>
              </NItem>

              {#if $UserStore.storageType === 'blockstack'}
                <BlockstackOptions />
              {/if}
              {#if $UserStore.storageType === 'local'}
                <LocalstorageOptions />
              {/if}
              {#if $UserStore.storageType === 'pouchdb'}
                <PouchDBOptions />
              {/if}

              <NItem
                title="Browse Storage..."
                on:click={() => {
                  navigate('/files');
                }}
                className="clickable">
                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
              </NItem>

            </div>
            <NItem
              className="solo text-red text-center mt-4"
              on:click={methods.deleteEverything}>
              Reset & Delete all Nomie Data...
            </NItem>
          {:else if view == 'about'}
            <!--
              *******************************************
              ABOUT VIEW 
              *******************************************
            -->
            <NItem
              className="clickable solo p-2"
              title={Lang.t('settings.shop-and-support', 'Shop and Support')}
              description="Products that work with Nomie"
              on:click={methods.shop}>
              <span slot="left" class="btn-icon tap-icon">
                <NIcon name="share" />
              </span>
              <span slot="right" class="icon">
                <NIcon name="chevron-right" />
              </span>
            </NItem>
            <div class="n-list solo">

              <NItem title="Learn More">
                <span slot="right">
                  <a
                    href="https://nomie.app?s=dap"
                    class="btn btn-clear text-primary-bright"
                    target="_system">
                    Website
                  </a>
                </span>
              </NItem>
              <NItem title="Reddit r/nomie">
                <span slot="right">
                  <a
                    href="https://reddit.com/r/nomie"
                    class="btn btn-clear text-primary-bright"
                    target="_system">
                    r/nomie
                  </a>
                </span>
              </NItem>

              <NItem title="Open Source">
                <span slot="right">
                  <a
                    href="https://github.com/open-nomie/nomie"
                    class="btn btn-clear text-primary-bright"
                    target="_system">
                    Github
                  </a>
                </span>
              </NItem>
            </div>
            <div class="n-list solo">
              <NItem title={Lang.t('general.trackers', 'Tracker Count')}>
                <span slot="right">{TrackerStore.getAsArray().length}</span>
              </NItem>

              <NItem title={Lang.t('general.first_log', 'First Log')}>
                <div class="" slot="right">
                  {#await LedgerStore.getFirstDate()}
                    Loading...
                  {:then date}
                    <div class="text-sm">
                      {date.format('MMMM YYYY')} ({date.fromNow()})
                    </div>
                  {/await}
                  <!--  -->
                </div>
              </NItem>
              <NItem title={Lang.t('general.launch-count', 'Launch Count')}>
                <div class="n-row" slot="right">
                  <button
                    class="btn btn-clear"
                    on:click={UserStore.resetLaunchCount}>
                    <NIcon name="delete" className="fill-red" size="18" />
                  </button>
                  {$UserStore.launchCount}
                </div>
              </NItem>
              <NItem title={Lang.t('general.device', 'Device')}>
                <span slot="right">{$Browser.device}</span>
              </NItem>
              <NItem title={Lang.t('general.platform', 'Platform')}>
                <span slot="right">{$Browser.platform}</span>
              </NItem>
              <NItem title={Lang.t('general.pwa', 'PWA')}>
                <span slot="right">{$Browser.pwa}</span>
              </NItem>
              <NItem title="Version">
                <span slot="right">APP_VERSION</span>
              </NItem>
              <NItem title="Built">
                <span slot="right">APP_BUILD_DATE</span>
              </NItem>
            </div>
          {/if}
          <!-- END Views -->

          <!-- <NItem
            className="clickable solo p-2"
            title={Lang.t('settings.share-nomie', 'Share Nomie w/ Friends')}
            description="It'd be super helpful"
            on:click={methods.share}>
            <span slot="left" class="btn-icon tap-icon">
              <NIcon name="share" />
            </span>
            <span slot="right" class="icon">
              <NIcon name="more" />
            </span>
          </NItem> -->

          <NItem title={Lang.t('general.questions')} className="solo mt-3">
            <span slot="right">
              <a
                class="btn btn-clear text-primary-bright"
                href={`mailto:${config.support_email}?subject=Nomie APP_VERSION`}>
                {config.support_contact}
              </a>
            </span>
          </NItem>

          <NItem className="compact item-divider" />

          <NItem>
            <div class="text-sm pb-2 pt-2">
              &copy; Copyright 2019. All Rights Reserved
            </div>
            <div class="text-sm pb-2">
              Nomie&reg; by
              <a href="https://www.happydata.org" traget="_system">
                Happy Data, LLC
              </a>
            </div>

          </NItem>

        </div>
        <!-- end container -->

      </div>
    {/if}
  </div>
  <!-- end content slot-->

</NLayout>

{#if showImporter}
  <ImporterModal on:dismiss={() => (showImporter = false)} />
{/if}
