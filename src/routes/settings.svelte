<script>
  //Vendors
  import { navigate, Link } from "svelte-routing";
  import { onMount } from "svelte";

  import SocialShare from "../modules/share/share";
  import Storage from "../modules/storage/storage";
  // Components
  import NItem from "../components/list-item/list-item.svelte";

  import NIcon from "../components/icon/icon.svelte";
  import NButtonGroup from "../components/button-group/button-group.svelte";
  import BlockstackOptions from "../components/storage/blockstack.svelte";
  import LocalstorageOptions from "../components/storage/localstorage.svelte";
  import PouchDBOptions from "../components/storage/pouchdb.svelte";

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
  import Features from "../containers/settings/features.svelte";
  import Tweaks from "../containers/settings/tweaks.svelte";
  import Text from "../components/text/text.svelte";
  import Button from "../components/button/button.svelte";
  import Icon from "../components/icon/icon.svelte";
  import { AppStore } from "../store/app-store";
  import appConfig from "../config/appConfig";
  import Confetti from "../components/confetti/confetti.svelte";
  import tick from "../utils/tick/tick";

  export const location = undefined;
  export const style = undefined;

  // consts
  // const Export = new Exporter();

  let data = {
    signedIn: false,
    files: [],
    showMassEditor: false,
  };

  let showConfetti = false;

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
      Interact.alert("🎁  Patron Only Features Unlocked", "Hey you! Thank you for your continued support. 💘");
      showConfetti = true;
      await tick(6000);
      showConfetti = false;
      return true;
    },
    async tryPatronPin() {
      let pin = await Interact.inputPin("Patron Key");
      console.log({ pin });
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
          title: `${$UserStore.storageType === "blockstack" ? "✓" : ""} ${Lang.t("storage.blockstack_title", "Blockstack")}`,
          description: `${Lang.t(
            "storage.blockstack_description",
            "Sync across multiple devices using Blockstack's free and encrypted storage."
          )}`,
          click() {
            methods.switchStorage("blockstack");
          },
        },
        {
          title: `${$UserStore.storageType === "pouchdb" ? "✓" : ""} ${Lang.t("storage.pouchdb_title", "CouchDB (beta)")}`,
          description: `${Lang.t(
            "storage.pouchdb_description",
            "Sync your data in real to a remote CouchDB server. ⚠️ Not good for multiple devices."
          )}`,
          click() {
            methods.switchStorage("pouchdb");
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

{#if showConfetti}
  <Confetti />
{/if}

<NLayout pageTitle="Settings">

  <div slot="header">
    <div class="n-toolbar-grid container">
      <div class="left" />
      <div class="main">
        <Text bold>{Lang.t('settings.settings', 'Settings')}</Text>
      </div>
      <div class="right">
        <Button type="clear" color="primary" on:click={methods.faq}>{Lang.t('general.faq', 'FAQ')}</Button>
      </div>
    </div>
    <div class="n-toolbar px-2 pb-1 container">
      <NButtonGroup>
        <Button
          className={view == 'features' ? 'active' : ''}
          on:click={() => {
            changeView('features');
          }}>
          {Lang.t('settings.tab-features', 'Features')}
        </Button>
        <Button
          className={view == 'tweaks' ? 'active' : ''}
          on:click={() => {
            changeView('tweaks');
          }}>
          {Lang.t('settings.tab-tweaks', 'Tweaks')}
        </Button>
        <Button
          className={view == 'data' ? 'active' : ''}
          on:click={() => {
            changeView('data');
          }}>
          {Lang.t('settings.tab-data', 'Data')}
        </Button>
        <Button
          className={view == 'about' ? 'active' : ''}
          on:click={() => {
            changeView('about');
          }}>
          {Lang.t('settings.tab-about', 'About')}
        </Button>
      </NButtonGroup>
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
            <div class="n-list pb-2">
              <NItem itemDivider>Storage Location</NItem>
              <NItem on:click={methods.storageMenu}>
                <span slot="left">☁️</span>
                <Text>
                  {#if $UserStore.storageType === 'local'}
                    This device only
                  {:else if $UserStore.storageType === 'pouchdb'}
                    {Lang.t('storage.pouchdb', 'Local + CouchDB')}
                  {:else if $UserStore.storageType === 'blockstack'}{Lang.t('storage.blockstack', 'Blockstack')}{/if}
                </Text>
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

              <NItem
                detail
                title={Lang.t('general.browse-files', 'Browse Files...')}
                on:click={() => {
                  navigate('/files');
                }}>
                <span slot="left">📂</span>
              </NItem>

            </div>

            <div class="n-list pb-2">
              <NItem itemDivider>{Lang.t('settings.import-data', 'Import Data')}</NItem>
              <NItem clickable title={Lang.t('settings.nomie-api', 'Nomie API')} on:click={() => navigate('/api')}>
                <span slot="left">🕸</span>
                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
              </NItem>
              <NItem
                clickable
                title={`${Lang.t('settings.import-from-backup', 'Import from Backup')}`}
                on:click={() => {
                  showImporter = true;
                }}>
                <span slot="left">📦</span>
                <span slot="right">
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
                <input slot="right" class="d-none" type="file" bind:this={fileInput} on:change={methods.onImportFile} />
              </NItem>
              <NItem clickable title={`${Lang.t('settings.import-from-csv', 'Import from CSV ')}`} to="/settings/import/csv">
                <span slot="left">📄</span>
                <span slot="right" class="n-row">
                  <div class="nbtn nbtn-xs nbtn-rounded nbtn-danger">Beta</div>
                  <NIcon name="chevronRight" className="fill-faded-2" />
                </span>
              </NItem>
            </div>
            <div class="n-list pb-2">
              <NItem itemDivider>{Lang.t('settings.export-data', 'Export Data')}</NItem>
              <NItem detail title={Lang.t('settings.generate-backup', 'Generate Backup')} to="/settings/export/backup">
                <span slot="left">📦</span>

              </NItem>
              <NItem detail title={Lang.t('settings.generate-csv', 'Generate CSV')} to="/settings/export/csv">
                <span slot="left">📃</span>
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
          {:else if view == 'about'}
            <!--
              *******************************************
              ABOUT VIEW 
              *******************************************
            -->
            <div class="n-list pb-1">
              <NItem itemDivider>{Lang.t('settings.join-the-community', 'Join the Community')}</NItem>
              <NItem detail title="Learn More" href="https://nomie.app?s=dap">
                <span slot="right" class="text-inverse-3">Nomie.app</span>
              </NItem>
              <NItem title="Become a Patron" detail href="https://www.patreon.com/nomieapp">
                <span slot="right" class="text-inverse-3">Patreon</span>
              </NItem>
              <NItem title="Reddit r/nomie" detail href="https://reddit.com/r/nomie">
                <span slot="right" class="n-row text-inverse-3">/r/nomie</span>
              </NItem>

              <NItem title="Open Source" detail href="https://github.com/open-nomie/nomie">
                <span slot="right" class="n-row text-inverse-3">GitHub</span>
              </NItem>
            </div>

            <div class="n-list pb-1">
              <NItem itemDivider>App Details</NItem>
              <NItem title={Lang.t('general.trackers', 'Tracker Count')}>
                <span slot="right">{TrackerStore.getAsArray().length}</span>
              </NItem>

              <NItem title={Lang.t('general.first_log', 'First Log')}>
                <div class="" slot="right">
                  {#await LedgerStore.getFirstDate()}
                    Loading...
                  {:then date}
                    <div class="text-sm">{date.format('MMM YYYY')}</div>
                  {/await}
                  <!--  -->
                </div>
              </NItem>
              <NItem title={Lang.t('general.launch-count', 'Launch Count')}>
                <div class="n-row" slot="right">
                  <Button icon size="sm" on:click={UserStore.resetLaunchCount}>
                    <NIcon name="delete" className="fill-red" size="18" />
                  </Button>
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
            </div>

            <NItem itemDivider>Version</NItem>
            <NItem title="Version APP_VERSION " description="Built APP_BUILD_DATE ">
              <span slot="right" class="n-row">
                <Button size="xs" on:click={AppStore.reveal} className="ml-2">What's new</Button>
              </span>
            </NItem>
            <NItem
              title="Onboarded"
              on:click={() => {
                navigate('/setup');
              }}>
              <span slot="right" class="text-primary-bright">{Lang.t('settings.redo-setup', 'Redo Setup')}</span>
            </NItem>
          {/if}
          <!-- END Views -->

          <div class="n-list my-3">
            <NItem title={Lang.t('general.patron_only_features', 'Patron Only Features')}>
              <Text size="xs" faded leading2 className="mt-1">
                {Lang.t('settings.become-a-patron-message', 'Patrons help me keep Nomie moving forward with no ads, private, and open.')}
              </Text>
              <div slot="right">
                {#if $UserStore.meta.hiddenFeatures}
                  <Icon name="checkmarkOutline" />
                {:else}
                  <Button
                    size="sm"
                    on:click={() => {
                      methods.tryPatronPin(true);
                    }}>
                    {Lang.t('settings.unlock', 'Unlock')}
                  </Button>
                {/if}
              </div>
            </NItem>

            <NItem
              detail
              compact
              className="text-primary-bright"
              on:click={() => {
                window.open(config.patreon, '_system');
              }}>
              <Text size="xs" color="primary-bright" className="mt-1">
                {#if $UserStore.meta.hiddenFeatures}
                  🥳 Hey Patron! Check out the latest posts
                {:else}{Lang.t('general.become-a-patron', 'Not a Patron?')} Join today for as low as $2{/if}
              </Text>
            </NItem>
          </div>

          <NItem title={Lang.t('general.questions', 'Questions?')}>
            <div slot="right">
              <a href={`mailto:${config.support_email}?subject=Nomie APP_VERSION `}>{config.support_contact}</a>
            </div>
          </NItem>

          <NItem title="Happy Data, LLC">
            <div slot="right">
              <Text size="sm" on:click={specialTap}>&copy; Copyright 2014 - {dayjs().format('YYYY')}</Text>
            </div>
          </NItem>

          <NItem className="bg-transparent my-4" title="⚠️ {Lang.t('settings.danger-zone', 'Danger Zone')}">
            <div slot="right">
              <Button color="danger" size="sm" on:click={methods.deleteEverything}>
                {Lang.t('settings.destroy-all-data', 'Destroy all Data')}
              </Button>
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
