<script>
  //Vendors
  import { navigate, Link } from "svelte-routing";
  import { onMount } from "svelte";

  import SocialShare from "../modules/share/share";
  import Storage from "../modules/storage/storage";

  // Components
  import ListItem from "../components/list-item/list-item.svelte";
  import NIcon from "../components/icon/icon.svelte";
  import NButtonGroup from "../components/button-group/button-group.svelte";
  import BlockstackOptions from "../components/storage/blockstack.svelte";
  import LocalstorageOptions from "../components/storage/localstorage.svelte";
  import PouchDBOptions from "../components/storage/pouchdb.svelte";
  import Spacer from "../components/spacer/spacer.svelte";
  import List from "../components/list/list.svelte";
  import Row from "../components/row/row.svelte";
  import Divider from "../components/divider/divider.svelte";

  // Containers
  import ImporterModal from "../containers/importer/importer.svelte";

  import NLayout from "../containers/layout/layout.svelte";

  // Vendors
  import dayjs from "dayjs";
  import localforage from "localforage";

  // Stores
  import { UserStore } from "../store/user-store";
  import { LedgerStore } from "../store/ledger";
  import { Interact } from "../store/interact";
  import { TrackerStore } from "../store/tracker-store";
  import { Lang } from "../store/lang";
  import { Device } from "../store/device-store";

  // Config
  import config from "../config/appConfig";
  // Comtainers
  import Features from "../containers/settings/features.svelte";
  import Tweaks from "../containers/settings/tweaks.svelte";
  // Components
  import Text from "../components/text/text.svelte";
  import Button from "../components/button/button.svelte";
  import Icon from "../components/icon/icon.svelte";
  import appConfig from "../config/appConfig";

  import tick from "../utils/tick/tick";

  import { LastUsed } from "../store/last-used";
  import { AppStore } from "../store/app-store";
  import Sponsors from "../components/sponsors/sponsors.svelte";
  import ToggleSwitch from "../components/toggle-switch/toggle-switch.svelte";
  import { ApiStore } from "../containers/api/api-store";

  export const location = undefined;
  export const style = undefined;

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

  let st = 0;
  async function specialTap() {
    st = st + 1;
    if (st > 9) {
      methods.unlockFeatures();
    }
  }

  let methods = {
    sign_out() {
      UserStore.signout();
    },
    share() {
      SocialShare(`I track my life with Nomie! It's free, private, and you get to design what you track. @nomieapp`, "https://nomie.app");
    },
    async unlockFeatures() {
      UserStore.unlockHiddenFeatures();
      Interact.confetti({
        show: true,
        title: "🎁  Patron Only Features Unlocked",
        message: "Hey you! Thank you for your continued support. 💘",
        timeout: 5000,
      });
    },
    async tryPatronPin() {
      let pin = await Interact.inputPin("Patron Key", true);

      if (pin === appConfig.patron_pin) {
        methods.unlockFeatures();
      } else {
        Interact.alert(`Invalid Patron Pin`, `Please check the code and try again`);
      }
    },
    locations() {
      Interact.pickLocation();
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
    shop() {
      navigate("/shop");
    },

    settingChange() {
      UserStore.saveMeta();
    },
    async deleteEverything() {
      try {
        let res = await Interact.confirm(
          `${Lang.t("settings.danger-zone")}`,
          `${Lang.t("settings.delete-warning", "This will destroy ALL data in Nomie. Are you absolutely sure?")}`,
          `${Lang.t("settings.destroy", "Destroy")}`
        );
        if (res) {
          await tick(200);
          res = await Interact.confirm(
            `${Lang.t("settings.danger-zone")}`,
            `${Lang.t("settings.delete-warning-again", "So you REALLY want all ALL data in Nomie destroyed?")}`,
            `${Lang.t("settings.destroy", "Destroy")}`
          );

          if (res === true) {
            Interact.blocker(`${Lang.t("settings.deleting-data", "Deleting data...")}`);
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
          title: `${$UserStore.storageType === "pouchdb" ? "✓" : ""} ${Lang.t("storage.pouchdb_title", "CouchDB (beta)")}`,
          description: `${Lang.t(
            "storage.pouchdb_description",
            "Sync your data in real time to a remote CouchDB server. ⚠️ Not good for multiple devices."
          )}`,
          click() {
            methods.switchStorage("pouchdb");
          },
        },
        {
          title: `${$UserStore.storageType === "blockstack" ? "✓" : ""} ⚠️⚠️⚠️ Blockstack`,
          description: `⚠️ NO LONGER SUPPORTED / SHUTTING DOWN, please use Device Only or CouchDB instead.`,
          click() {
            methods.switchStorage("blockstack");
          },
        },
      ];
      Interact.popmenu({
        title: `${Lang.t("storage.type_selector_title", "Storage Options")}`,
        description: `${Lang.t("storage.type_selector_title", "How would you like your data stored?")}`,
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
    Device.scrollToTop();
  }
  // const setTimeout = setTimeout;
  onMount(() => {
    Device.scrollToTop();
  });
</script>

<NLayout pageTitle="Settings">

  <div slot="header">
    <div class="container n-toolbar-grid">
      <div class="left" />
      <div class="main">
        <Text bold>{Lang.t('settings.settings', 'Settings')}</Text>
      </div>
      <div class="right">
        <Button type="clear" color="primary" on:click={methods.faq}>{Lang.t('general.faq', 'FAQ')}</Button>
      </div>
    </div>
    <div class="container px-2 pb-1 n-toolbar">
      <NButtonGroup className="mx-auto" style="max-width:400px;">
        <Button
          className={view == 'features' ? 'active' : ''}
          on:click={() => {
            changeView('features');
          }}
        >
          {Lang.t('settings.tab-features', 'Features')}
        </Button>
        <Button
          className={view == 'tweaks' ? 'active' : ''}
          on:click={() => {
            changeView('tweaks');
          }}
        >
          {Lang.t('settings.tab-tweaks', 'Tweaks')}
        </Button>
        <Button
          className={view == 'data' ? 'active' : ''}
          on:click={() => {
            changeView('data');
          }}
        >
          {Lang.t('settings.tab-data', 'Data')}
          {#if $ApiStore.items.length}
            <div class="notify" />
          {/if}
        </Button>
        <Button
          className={view == 'about' ? 'active' : ''}
          on:click={() => {
            changeView('about');
          }}
        >
          {Lang.t('settings.tab-about', 'About')}
        </Button>
      </NButtonGroup>
    </div>
  </div>

  <div slot="content" class="pt-2">
    {#if $UserStore.meta}
      <div class="page page-settings">
        <div class="container p-0">

          {#if $UserStore.meta.hiddenFeatures}
            <ListItem className="mb-3" href={appConfig.patreonHome} detail compact>
              <div slot="left">
                <Icon name="cake" className="fill-primary-bright" size="28" />
              </div>
              <Text bold>{Lang.t('settings.patron-official', 'Official Nomie Patron')}</Text>
              <div slot="right">
                <Text size="sm">{Lang.t('general.latest', 'Latest')}</Text>
              </div>
            </ListItem>
          {:else}
            <!-- <ListItem compact className="mb-3">
              <div slot="left" style="font-size:28px">🎁</div>
              <Text bold>{Lang.t('settings.become-a-patron', 'Become a Patron')}</Text>
              <Text size="sm" leading2 faded>
                {Lang.t('settings.patron-description', 'Starting at $2/mon for early features, exclusive content, and support.')}
              </Text>
              <Row insetLeft>
                <Button
                  areaLabel="Unlock"
                  text
                  size="sm"
                  on:click={() => {
                    methods.tryPatronPin(true);
                  }}
                >
                  {Lang.t('settings.patron-unlock', 'Unlock')}
                </Button>
                <Button
                  ariaLabel="Join Now"
                  text
                  size="sm"
                  click={() => {
                    Device.open(appConfig.patreon);
                  }}
                >
                  {Lang.t('settings.patron-join-now', 'Join Now')}
                </Button>
                <Spacer />
              </Row>
              <div slot="right" />
            </ListItem> -->
          {/if}

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
            <List className="mb-3" title={Lang.t('settings.storage-location', 'Storage Location')} outside>
              <ListItem on:click={methods.storageMenu}>
                <span slot="left">☁️</span>
                <Text>
                  {#if $UserStore.storageType === 'local'}
                    This device only
                  {:else if $UserStore.storageType === 'pouchdb'}
                    {Lang.t('storage.pouchdb', 'Local + CouchDB')}
                  {:else if $UserStore.storageType === 'blockstack'}{Lang.t('storage.blockstack', 'Blockstack')}{/if}
                </Text>
                <div slot="right">
                  <Text size="sm" className="text-primary-bright">{Lang.t('general.change', 'Change')}</Text>
                </div>
              </ListItem>

              {#if $UserStore.storageType === 'blockstack'}
                <BlockstackOptions />
              {/if}
              {#if $UserStore.storageType === 'local'}
                <LocalstorageOptions />
              {/if}
              {#if $UserStore.storageType === 'pouchdb'}
                <PouchDBOptions />
              {/if}

              <ListItem
                detail
                title={Lang.t('general.browse-files', 'Browse Files...')}
                on:click={() => {
                  navigate('/files');
                }}
              >
                <span slot="left">📂</span>
              </ListItem>

            </List>

            <List className="mb-3" outside title={Lang.t('settings.import-data', 'Import Data')}>
              <ListItem clickable title={Lang.t('settings.nomie-api', 'Nomie API')} on:click={() => navigate('/api')}>
                <span slot="left">🚚</span>
                <span slot="right">
                  {#if $ApiStore.items.length}
                    <div class="nbtn nbtn-xs nbtn-rounded nbtn-danger">{$ApiStore.items.length}</div>
                  {/if}
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
              </ListItem>
              <ListItem
                clickable
                title={`${Lang.t('settings.import-from-backup', 'Import from Backup')}`}
                on:click={() => {
                  showImporter = true;
                }}
              >
                <span slot="left">📦</span>
                <div slot="right">
                  <input class="d-none" type="file" bind:this={fileInput} on:change={methods.onImportFile} />
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </div>
              </ListItem>
              <ListItem clickable title={`${Lang.t('settings.import-from-csv', 'Import from CSV ')}`} to="/settings/import/csv">
                <span slot="left">📄</span>
                <span slot="right" class="flex">
                  <div class="nbtn nbtn-xs nbtn-rounded nbtn-light">Beta</div>
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
              </ListItem>
            </List>

            <List className="mb-3" outside title={Lang.t('settings.export-data', 'Export Data')}>

              <ListItem detail title={Lang.t('settings.generate-backup', 'Generate Backup')} to="/settings/export/backup">
                <span slot="left">📦</span>

              </ListItem>
              <ListItem detail title={Lang.t('settings.generate-csv', 'Generate CSV')} to="/settings/export/csv">
                <span slot="left">📃</span>
              </ListItem>
            </List>

            <ListItem title={Lang.t('settings.hide-backup-reminder', 'Hide backup reminder')}>
              <span slot="left">📕</span>
              <div slot="right">
                <ToggleSwitch bind:value={$UserStore.meta.hideBackup} on:change={methods.settingChange} />
              </div>
            </ListItem>

            <List className="mb-3" outside title={Lang.t('settings.miscellaneous', 'Miscellaneous')}>
              <ListItem
                clickable
                title={Lang.t('settings.update-last-used-date', "Update All Tracker's Last-Used")}
                on:click={LastUsed.updateAll}
              >
                <span slot="left">🕰</span>
              </ListItem>
            </List>

            <List className="mb-3" outside title={Lang.t('settings.danger-zone', 'Danger Zone')}>
              <ListItem detail on:click={methods.deleteEverything} clickable>
                <div slot="left">⚠️</div>
                <Text className="text-red">{Lang.t('settings.destroy-all-data', 'Destroy all Data')}</Text>
              </ListItem>
            </List>

            <!-- <div class="my-2 n-list solo">
              <Text bold className="my-3 mx-3">{Lang.t('general.type', 'Finding old data')}</Text>
              <ListItem bottomLine title="Find Context" on:click={ContextStore.searchForContext}>
                <span slot="left">💬</span>
              </ListItem>
              <ListItem title="Find People" on:click={PeopleStore.searchForPeople}>
                <span slot="left">👨‍👨‍👧‍👧</span>
              </ListItem>
            </div> -->
          {:else if view == 'about'}
            <!--
              *******************************************
              ABOUT VIEW 
              *******************************************
            -->
            <List className=" mb-3" title={Lang.t('settings.join-the-community', 'Join the Community')} outside>
              <ListItem detail title="Learn More" href="https://nomie.app?s=dap">
                <span slot="right" class="text-inverse-3">Nomie.app</span>
              </ListItem>
              <ListItem title="Become a Patron" detail href="https://www.patreon.com/nomieapp">
                <span slot="right" class="text-inverse-3">Patreon</span>
              </ListItem>
              <ListItem title="Reddit r/nomie" detail href="https://reddit.com/r/nomie">
                <span slot="right" class="flex text-inverse-3">/r/nomie</span>
              </ListItem>

              <ListItem title="Open Source" detail href="https://github.com/open-nomie/nomie">
                <span slot="right" class="flex text-inverse-3">GitHub</span>
              </ListItem>
            </List>

            <List className="mb-3" outside title="App">
              <ListItem title={Lang.t('general.tracker-count', 'Tracker Count')}>
                <span slot="right">{TrackerStore.getAsArray().length}</span>
              </ListItem>

              <ListItem title={Lang.t('general.first_log', 'First Log')}>
                <div class="" slot="right">
                  {#await LedgerStore.getFirstDate(true)}
                    Loading...
                  {:then date}
                    <div class="text-sm">{date.format('MMM YYYY')}</div>
                  {/await}
                  <!--  -->
                </div>
              </ListItem>
              <ListItem title={Lang.t('general.launch-count', 'Launch Count')}>
                <div class="flex" slot="right">
                  <Button icon size="sm" on:click={UserStore.resetLaunchCount}>
                    <NIcon name="delete" className="fill-red" size="18" />
                  </Button>
                  {$UserStore.launchCount}
                </div>
              </ListItem>
              <ListItem title={Lang.t('general.device', 'Device')}>
                <span slot="right">{$Device.device}</span>
              </ListItem>
              <ListItem title={Lang.t('general.platform', 'Platform')}>
                <span slot="right">{$Device.platform}</span>
              </ListItem>
              <ListItem title={Lang.t('general.pwa', 'PWA')}>
                <span slot="right">{$Device.pwa}</span>
              </ListItem>
              <Divider center />
              <ListItem title="UI Test" to="/test" detail />
            </List>

            <List title="Version" outside className="mb-3">
              <ListItem title="Version APP_VERSION " description="Built APP_BUILD_DATE " detail on:click={AppStore.reveal}>
                <span slot="right" class="flex">
                  <Button size="xs" className="ml-2">New</Button>
                </span>
              </ListItem>
              <ListItem
                detail
                title="Onboarded"
                on:click={() => {
                  navigate('/setup');
                }}
              >
                <span slot="right" class="text-primary">
                  <Text size="sm">{Lang.t('settings.redo-setup', 'Redo Setup')}</Text>
                </span>
              </ListItem>
            </List>
          {/if}
          <!-- END Views -->

          <List className="mt-3">
            <ListItem title={Lang.t('general.questions', 'Questions')} class="mb-2" detail>
              <span slot="left">🆘</span>
              <div slot="right">
                <Text size="sm">
                  <a class="nbtn nbtn-xs nbtn-rounded nbtn-dark" href={`mailto:${config.support_email}?subject=Nomie APP_VERSION `}>
                    Email
                  </a>
                </Text>
              </div>
            </ListItem>
          </List>

          <Spacer gap={1} />

          <Text size="sm" center className="mt-4 mb-3" on:click={specialTap}>
            Happy Data, LLC &copy; Copyright 2014 - {dayjs().format('YYYY')}
          </Text>

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
