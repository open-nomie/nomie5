<script lang="ts">
	import SettingsTweakList from './settings-tweak-list.svelte';
	import Container from './../../components/container/container.svelte';
  import ToolbarGrid from './../../components/toolbar/toolbar-grid.svelte'
  //Vendors
  import { navigate } from 'svelte-routing'
  import { onMount } from 'svelte'

  import SocialShare from '../../modules/share/share'
  import Storage from '../../modules/storage/storage'

  // Components
  import ListItem from '../../components/list-item/list-item.svelte'
  import NIcon from '../../components/icon/icon.svelte'
  import NButtonGroup from '../../components/button-group/button-group.svelte'
  import BlockstackOptions from '../../components/storage/blockstack.svelte'
  import LocalstorageOptions from '../../components/storage/localstorage.svelte'
  import PouchDBOptions from '../../components/storage/pouchdb.svelte'
  import Spacer from '../../components/spacer/spacer.svelte'
  import List from '../../components/list/list.svelte'
  
  import Divider from '../../components/divider/divider.svelte'

  // Containers
  import ImporterModal from '../../containers/importer/importer.svelte'

  import NLayout from '../../containers/layout/layout.svelte'

  // Vendors
  import dayjs from 'dayjs'
  import localforage from 'localforage'

  // Stores
  import { UserStore } from '../../store/user-store'
  import { LedgerStore } from '../../store/ledger'
  import { Interact } from '../../store/interact'
  import { TrackerStore } from '../../store/tracker-store'
  import { Lang } from '../../store/lang'
  import { Device } from '../../store/device-store'

  // Config
  import config from '../../config/appConfig'
  // Comtainers

  // Components
  import Text from '../../components/text/text.svelte'
  import Button from '../../components/button/button.svelte'
  import Icon from '../../components/icon/icon.svelte'
  import appConfig from '../../config/appConfig'

  import tick from '../../utils/tick/tick'

  import { LastUsed } from '../../store/last-used'
  import { AppStore } from '../../store/app-store'
  
  import ToggleSwitch from '../../components/toggle-switch/toggle-switch.svelte'
  import { ApiStore } from '../../containers/api/api-store'
  
  import SettingsDataList from './settings-data-list.svelte';
  import SettingsAboutList from './settings-about-list.svelte';
  import SettingsFeaturesList from './settings-features-list.svelte';

  export const location = undefined
  export const style = undefined

  // consts
  // const Export = new Exporter();

  let data = {
    signedIn: false,
    files: [],
    showMassEditor: false,
  }

  $: alwaysLocate = $UserStore.alwaysLocate

  let ledger = null
  let trackers = null
  // let user = null;
  let showImporter = false

  let st = 0
  async function specialTap() {
    st = st + 1
    if (st > 9) {
      methods.unlockFeatures()
    }
  }

  let methods = {
    sign_out() {
      UserStore.signout()
    },
    share() {
      SocialShare(
        `I track my life with Nomie! It's free, private, and you get to design what you track. @nomieapp`,
        'https://nomie.app',
      )
    },
    async unlockFeatures() {
      UserStore.unlockHiddenFeatures()
      Interact.confetti({
        show: true,
        title: '🎁  Patron Only Features Unlocked',
        message: 'Hey you! Thank you for your continued support. 💘',
        timeout: 5000,
      })
    },
    async tryPatronPin() {
      let pin = await Interact.inputPin('Patron Key', true)

      if (pin === appConfig.patron_pin) {
        methods.unlockFeatures()
      } else {
        Interact.alert(
          `Invalid Patron Pin`,
          `Please check the code and try again`,
        )
      }
    },
    locations() {
      Interact.pickLocation()
    },
    sign_in() {
      UserStore.redirectToSignIn()
    },

    bookAge(date) {
      return dayjs(`${date}-01`).fromNow()
    },
    faq() {
      navigate('/faq')
    },
    shop() {
      navigate('/shop')
    },

    settingChange() {
      UserStore.saveMeta()
    },

    switchStorage(type) {
      let from = $UserStore.storageType
      let to = type
      let conf = confirm(
        `${Lang.t(
          'storage.switch',
          `Switch from ${from} to ${to}? You can always switch back. 

Note: Your data will not automatically move over. You'll first need to export it, then you can import into this new storage.`,
        )}`,
      )
      if (conf === true) {
        if (['local', 'pouchdb', 'blockstack'].indexOf(to) > -1) {
          UserStore.setStorage(to)
          Interact.reload()
        } else {
          alert(`Error: ${to} is not valid`)
        }
      }
    }
  }
  let view = Storage.local.get('settings/view') || 'features'
  
  const changeView = (v:any) => {
    view = v
    Storage.local.put('settings/view', v)
    Device.scrollToTop()
  }
  // const setTimeout = setTimeout;
  onMount(() => {
    Device.scrollToTop()
  })
</script>

<NLayout pageTitle="Settings">

  <div slot="header">
    <Container>
      <ToolbarGrid>
        <h1 class="ntitle">
          {Lang.t('settings.settings', 'Settings')}
        </h1>
        <div slot="right" class="pr-4">
          <button
            title="Frequently asked Questions"
            class="text-primary-600"
            on:click={methods.faq}>
            {Lang.t('general.faq', 'FAQ')}
          </button>
        </div>
      </ToolbarGrid>
    </Container>

    <nav class="px-2 pb-1 n-toolbar">
      <NButtonGroup className="mx-auto" style="max-width:400px;">
        <Button
          className={view == 'features' ? 'active' : ''}
          on:click={() => {
            changeView('features')
          }}>
          {Lang.t('settings.tab-features', 'Features')}
        </Button>
        <Button
          className={view == 'tweaks' ? 'active' : ''}
          on:click={() => {
            changeView('tweaks')
          }}>
          {Lang.t('settings.tab-tweaks', 'Tweaks')}
        </Button>
        <Button
          className={view == 'data' ? 'active' : ''}
          on:click={() => {
            changeView('data')
          }}>
          {Lang.t('settings.tab-data', 'Data')}
          {#if $ApiStore.items.length}
            <div class="notify" />
          {/if}
        </Button>
        <Button
          className={view == 'about' ? 'active' : ''}
          on:click={() => {
            changeView('about')
          }}>
          {Lang.t('settings.tab-about', 'About')}
        </Button>
      </NButtonGroup>
    </nav>

  </div>

  <div slot="content" class="pt-2">
    <Container>
    {#if $UserStore.meta}
      <div class="page page-settings">
        <div class="p-0 ">

          {#if $UserStore.meta.hiddenFeatures}
            <ListItem
              className="mb-3"
              href={appConfig.patreonHome}
              detail
              compact>
              <div slot="left">
                <Icon name="cake" className="fill-primary-bright" size={28} />
              </div>
              <Text bold>
                {Lang.t('settings.patron-official', 'Official Nomie Patron')}
              </Text>
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
            <SettingsFeaturesList />
          {:else if view == 'tweaks'}
            <SettingsTweakList />
          {:else if view == 'data'}
            <SettingsDataList />
            <!--
              *******************************************
              DATA VIEW
              *******************************************
            -->
            

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
            <SettingsAboutList />
            
          {/if}
          <!-- END Views -->

          <List className="mt-3">
            <ListItem
              title={Lang.t('general.questions', 'Questions')}
              className="mb-2"
              detail>
              <span slot="left">🆘</span>
              <div slot="right">
                <Text size="sm">
                  <a
                    class="nbtn nbtn-xs nbtn-rounded nbtn-dark"
                    href={`mailto:${config.support_email}?subject=Nomie APP_VERSION `}>
                    Email
                  </a>
                </Text>
              </div>
            </ListItem>
          </List>

          <Spacer gap={1} />

          <button class="w-full px-4 mt-4 mb-3 text-sm text-center " on:click={specialTap}>
            <div class="text-sm text-black dark:text-white">Version v{import.meta.env.PACKAGE_VERSION}</div>
            <div class="text-xs text-gray-800 dark:text-gray-500"><strong>Happy Data</strong>, LLC &copy; Copyright 2014 - {dayjs().format('YYYY')}</div>
          </button>

        </div>
        <!-- end container -->

      </div>
    {/if}
    </Container>
  </div>
  <!-- end content slot-->

</NLayout>

{#if showImporter}
  <ImporterModal on:dismiss={() => (showImporter = false)} />
{/if}
