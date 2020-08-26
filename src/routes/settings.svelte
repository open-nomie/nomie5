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
  import { UserStore } from "../store/user-store";
  import { LedgerStore } from "../store/ledger";
  import { Interact } from "../store/interact";
  import { TrackerStore } from "../store/tracker-store";
  import { BoardStore } from "../store/boards";
  import { NomieAPI } from "../store/napi";
  import { Lang } from "../store/lang";
  import { PeopleStore } from "../store/people-store";
  import { Device } from "../store/device-store";
  import { ContextStore } from "../store/context-store";

  // Config
  import config from "../config/appConfig";
  import Features from "../containers/settings/features.svelte";
  import Tweaks from "../containers/settings/tweaks.svelte";
  import Text from "../components/text/text.svelte";
  import Button from "../components/button/button.svelte";
  import Icon from "../components/icon/icon.svelte";
  import { AppStore } from "../store/app-store";

  // consts
  // const Export = new Exporter();

  let data = {
    signedIn: false,
    files: [],
    showMassEditor: false,
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
      SocialShare(`I track my life with Nomie! It's free, private, and you get to design what you track. @nomieapp`, "https://nomie.app");
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

    settingChange() {
      UserStore.saveMeta();
    },
    async deleteEverything() {
      try {
        let res = await Interact.confirm("DANGER ZONE!", `This will destroy all of your data in Nomie. Are you sure?`, "Destroy");
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
            files.forEach((file) => {
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
          title: `${$UserStore.storageType === "local" ? "✓" : ""} ${Lang.t("storage.local_title", "This Device Only")}`,
          description: Lang.t("storage.local_description", "Good for getting started, but make sure you backup your data."),
          click() {
            methods.switchStorage("local");
          },
        },
        {
          title: `${$UserStore.storageType === "blockstack" ? "✓" : ""} Blockstack`,
          description: Lang.t(
            "storage.blockstack_description",
            "Sync across multiple devices using Blockstack's free and encrypted storage."
          ),
          click() {
            methods.switchStorage("blockstack");
          },
        },
        {
          title: `${$UserStore.storageType === "pouchdb" ? "✓" : ""} ${Lang.t("storage.pouchdb_title", "CouchDB (beta)")}`,
          description: Lang.t(
            "storage.pouchdb_description",
            "Sync your data in real to a remote CouchDB server. ⚠️ Not good for multiple devices."
          ),
          click() {
            methods.switchStorage("pouchdb");
          },
        },
      ];
      Interact.popmenu({
        title: Lang.t("storage.type_selector_title", `Storage Options`),
        description: Lang.t("storage.type_selector_title", `How would you like your data stored?`),
        buttons: buttons,
      });
    },
    // boardsToggle() {
    //   $UserStore.meta.boardsEnabled = !$UserStore.meta.boardsEnabled;
    //   UserStore.saveMeta();
    // },
  };
  let view = Storage.local.get("settings/view") || "features";
  function changeView(v) {
    view = v;
    Storage.local.put("settings/view", v);
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
        <Text bold>{Lang.t('settings.settings')}</Text>
      </div>
      <div class="right">
        <button on:click={methods.faq} class="btn tap-text">{Lang.t('general.faq')}</button>
      </div>
    </div>
    <div class="n-toolbar px-2 pb-1 container">
      <NButtonGroup
        buttons={[{ label: 'Features', active: view == 'features', click() {
              changeView('features');
            } }, { label: 'Tweaks', active: view == 'tweaks', click() {
              changeView('tweaks');
            } }, { label: 'Data', active: view == 'data', click() {
              changeView('data');
            } }, { label: 'About', active: view == 'about', click() {
              changeView('about');
            } }]} />
    </div>
  </div>

  <div slot="content" class="pt-2">
    {#if $UserStore.meta}
      <div class="page page-settings">
        <div class="container p-0">
          {#if view == 'features'}
            <Features />
          {:else if view == 'tweaks'}
            <Tweaks />
          {:else if view == 'data'}
            <!--
              *******************************************
              DATA VIEW
              *******************************************
            -->
            <div class="n-list mb-3">
              <NItem itemDivider>Import Data</NItem>
              <NItem className="clickable" title={Lang.t('settings.nomie-api')} on:click={() => navigate('/api')}>
                <span slot="left">🕸</span>
                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>

              </NItem>
              <NItem
                className="clickable"
                title={`${Lang.t('settings.import-from-backup')}`}
                on:click={() => {
                  showImporter = true;
                }}>
                <span slot="left">📦</span>
                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
                <input slot="right" class="d-none" type="file" bind:this={fileInput} on:change={methods.onImportFile} />
              </NItem>

              <NItem itemDivider topLine>Export Data</NItem>
              <NItem clickable title={Lang.t('settings.generate-backup')} to="/settings/export/backup">
                <span slot="left">📦</span>
                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
              </NItem>
              <NItem clickable title={Lang.t('settings.generate-csv')} to="/settings/export/csv">
                <span slot="left">📃</span>
                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
              </NItem>

              <NItem itemDivider topLine>Storage Location</NItem>
              <NItem on:click={methods.storageMenu}>
                <span slot="left">☁️</span>
                {#if $UserStore.storageType === 'local'}
                  This device only
                {:else if $UserStore.storageType === 'pouchdb'}
                  {Lang.t('storage.pouchdb', 'Local + CouchDB')}
                {:else if $UserStore.storageType === 'blockstack'}{Lang.t('storage.blockstack', 'Blockstack')}{/if}
                <div slot="right">
                  <Text size="sm" className="text-primary-bright">Change</Text>
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

              <NItem itemDivider topLine>Data Management</NItem>
              <NItem
                title="Browse Files..."
                on:click={() => {
                  navigate('/files');
                }}
                className="clickable">
                <span slot="left">📂</span>
                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
              </NItem>

              <NItem
                clickable
                title="{Lang.t('settings.find-and-replace')}..."
                on:click={() => {
                  data.showMassEditor = true;
                }}>
                <span slot="left">🕵️‍♂️</span>
                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
              </NItem>

            </div>

            <!-- <div class="n-list solo my-2">
              <Text bold className="my-3 mx-3">{Lang.t('general.type', 'Finding old data')}</Text>
              <NItem bottomLine title="Find Context" on:click={ContextStore.searchForContext}>
                <span slot="left">💬</span>
              </NItem>
              <NItem title="Find People" on:click={PeopleStore.searchForPeople}>
                <span slot="left">👨‍👨‍👧‍👧</span>
              </NItem>
            </div> -->

            <NItem className="solo text-red text-center my-4" on:click={methods.deleteEverything}>Reset & Delete all Nomie Data...</NItem>
          {:else if view == 'about'}
            <!--
              *******************************************
              ABOUT VIEW 
              *******************************************
            -->

            <NItem itemDivider>Join the Community</NItem>
            <NItem title="Learn More">
              <span slot="right">
                <a href="https://nomie.app?s=dap" class="btn btn-clear text-primary-bright" target="_system">Nomie.app</a>
              </span>
            </NItem>
            <NItem title="Become a Patron" clickable>
              <span slot="right">
                <a href="https://www.patreon.com/nomieapp" class="btn btn-clear text-primary-bright" target="_system">Patreon</a>
              </span>
            </NItem>
            <NItem title="Reddit r/nomie">
              <span slot="right">
                <a href="https://reddit.com/r/nomie" class="btn btn-clear text-primary-bright" target="_system">r/nomie</a>
              </span>
            </NItem>

            <NItem title="Open Source">
              <span slot="right">
                <a href="https://github.com/open-nomie/nomie" class="btn btn-clear text-primary-bright" target="_system">Github</a>
              </span>
            </NItem>

            <NItem itemDivider topLine>App Details</NItem>
            <NItem title={Lang.t('general.trackers', 'Tracker Count')}>
              <span slot="right">{TrackerStore.getAsArray().length}</span>
            </NItem>

            <NItem title={Lang.t('general.first_log', 'First Log')}>
              <div class="" slot="right">
                {#await LedgerStore.getFirstDate()}
                  Loading...
                {:then date}
                  <div class="text-sm">
                    {date.format('MMMM YYYY')}
                    <br />
                    ({date.fromNow()})
                  </div>
                {/await}
                <!--  -->
              </div>
            </NItem>
            <NItem title={Lang.t('general.launch-count', 'Launch Count')}>
              <div class="n-row" slot="right">
                <button class="btn btn-clear" on:click={UserStore.resetLaunchCount}>
                  <NIcon name="delete" className="fill-red" size="18" />
                </button>
                {$UserStore.launchCount}
              </div>
            </NItem>
            <NItem title={Lang.t('general.device', 'Device')}>
              <span slot="right">{$Device.device}</span>
            </NItem>
            <NItem title={Lang.t('general.platform', 'Platform')}>
              <span slot="right">{$Device.platform}</span>
            </NItem>
            <NItem title={Lang.t('general.pwa', 'PWA')}>
              <span slot="right">{$Device.pwa}</span>
            </NItem>

            <NItem itemDivider topLine>Version Details</NItem>
            <NItem title="Version">
              <span slot="right" class="n-row">
                <span>APP_VERSION</span>
                <Button size="xs" on:click={AppStore.reveal} className="ml-2">What's new</Button>
              </span>
            </NItem>
            <NItem title="Built">
              <span slot="right">APP_BUILD_DATE</span>
            </NItem>
            <NItem
              title="Setup Complete"
              on:click={() => {
                navigate('/setup');
              }}>
              <span slot="right" class="text-primary-bright">Show Again</span>
            </NItem>
          {/if}
          <!-- END Views -->

          <div class="n-list solo mt-3 py-2">
            <NItem title="Nomie needs your help!">

              <Text size="sm" faded>Help keep Nomie development moving forward, free, no ads, and open.</Text>
            </NItem>
            <NItem
              clickable
              title="Become a Patron"
              className="text-primary-bright"
              on:click={() => {
                window.open(config.patreon, '_system');
              }}>

              <Text size="xs" color="inverse-2" className="mt-1">Pick from 1 of 3 Patreon levels</Text>
              <div slot="right" class="pr-2">
                <Icon name="chevronRight" className="fill-primary" />
              </div>
            </NItem>
          </div>

          <NItem className="mt-3">
            <div slot="left">
              <Text>🆘</Text>
            </div>
            {`${Lang.t('general.questions')}`}
            <div slot="right">
              <Text size="sm" className="mr-1">
                <a class="text-primary-bright" href={`mailto:${config.support_email}?subject=Nomie APP_VERSION`}>
                  {config.support_contact}
                </a>
              </Text>
            </div>
          </NItem>

          <NItem className="bg-transparent">
            <div class="px-2 py-4">
              <Text size="sm">&copy; Copyright 2014 - {dayjs().format('YYYY')}</Text>
              <Text size="sm" inline faded>All Rights Reserved</Text>
              <Text size="sm" inline>
                Nomie&reg; by
                <a class="text-primary-bright" href="https://www.happydata.org" traget="_system">Happy Data, LLC</a>
              </Text>
            </div>
          </NItem>

        </div>
        <!-- end container -->

      </div>
    {/if}
  </div>
  <!-- end content slot-->

</NLayout>

<MassEditor on:close={methods.closeMassEditor} show={data.showMassEditor} />

{#if showImporter}
  <ImporterModal on:dismiss={() => (showImporter = false)} />
{/if}
