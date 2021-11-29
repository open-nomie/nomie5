<script lang="ts">
  import { wait } from './../../utils/tick/tick.ts'
  import { AppStore } from './../../store/app-store'
  import Icon from './../../components/icon/icon.svelte'
  import Panel from '@/components/panel/panel.svelte'
  // vendors
  // import EmojiSearch from "emoji-search";
  // import md5 from "md5";

  import { createEventDispatcher } from 'svelte'

  // Modules
  import ImportLoader from '../../modules/import/import-loader'

  // Utils
  // import PromiseStep from "../../utils/promise-step/promise-step";
  import math from '../../utils/math/math'

  // components
  import NModal from '../../components/modal/modal.svelte'
  import NItem from '../../components/list-item/list-item.svelte'

  // Stores
  import { Interact } from '../../store/interact'
  import { LedgerStore } from '../../store/ledger'
  import { Lang } from '../../store/lang'
  import Button from '../../components/button/button.svelte'
  import TagBadge from '../../components/tag-badge/tag-badge.svelte'
  import ImporterItem from './importer-item.svelte'
  import ProgressBar from '../../components/progress-bar/progress-bar.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import Empty from '../empty/empty.svelte'

  import Modal2 from '@/components/modal/modal2.svelte'
  import ToolbarGrid from '@/components/toolbar/toolbar-grid.svelte'

  export let visible = false

  let fileInput // holder of dom element self
  let fileData = null // holder of file content
  let version = undefined // version we're dealing with
  let importingAll = false

  // Status of imports
  let importing = {
    boards: { running: false, done: false },
    locations: { running: false, done: false },
    logs: { running: false, done: false, progress: 0 },
    trackers: { running: false, done: false },
    people: { running: false, done: false },
    dashboards: { running: false, done: false },
    context: { running: false, done: false },
    all: { running: false, done: false },
  }

  const dispatch = createEventDispatcher()
  const importLoader = new ImportLoader()

  const methods = {
    // Initialze once we have data.
    init() {
      if (fileData.hasOwnProperty('nomie')) {
        // const importer = new Importer(fileData);
        try {
          importLoader.openPayload(fileData)
          version = importLoader.importer.version
        } catch (e) {
          console.error(e.message)
          Interact.alert('Error', e.message)
        }
      }
    },
    async finish() {
      // Get a new latest book
      await LedgerStore.getFirstDate(true)
      let confirmed = await Interact.confirm(
        'Import Complete. Restart?',
        `It's best to reload Nomie after an import`,
      )
      if (confirmed) {
        document.location.href = '/'
      }
    },
    // On Import File
    // Process the file - see if we can do anything with it.
    onImportFile(event) {
      // set reader and file
      let reader = new FileReader()
      let file = event.target.files[0]
      // file on loaded
      reader.onload = (theFile: any) => {
        try {
          fileData = JSON.parse(theFile.target.result)
          methods.init()
        } catch (e) {
          console.error(e)
          Interact.alert('Error', e.message)
        }
      }
      // Read the file
      reader.readAsText(file)
    },

    // Confirm Import Trackers

    async run(type: string, func: Function, prompt: boolean = false) {
      importing[type].running = true
      try {
        let proceed = true
        if (prompt) {
          proceed = await Interact.confirm(
            `Import ${type}?`,
            'This action cannot be undone',
          )
          await wait(200)
          if (proceed !== true) {
            importing[type].running = false
            importing[type].done = false
          }
        }
        if (proceed) {
          await func()
          importing[type].running = false
          importing[type].done = true
        }
      } catch (e) {
        console.error(type, e.message)
        Interact.alert('Error', e.message)
        importing[type].running = false
        importing[type].done = false
      }
    },
    async importTrackers(confirmation: boolean = false) {
      return await methods.run(
        'trackers',
        async () => {
          return await importLoader.importTrackers()
        },
        confirmation,
      )
    },
    // Confirm Import Trackers
    async importDashboards(confirmation: boolean = false) {
      return await methods.run(
        'dashboards',
        async () => {
          return await importLoader.importDashboards()
        },
        confirmation,
      )
    },

    async importPeople(confirmation: boolean = false) {
      return await methods.run(
        'people',
        async () => {
          return await importLoader.importPeople()
        },
        confirmation,
      )
    },

    // Confirm Import Boards
    async importBoards(confirmation: boolean = false) {
      return await methods.run(
        'boards',
        async () => {
          return await importLoader.importBoards()
        },
        confirmation,
      )
    },

    // Confirm Import logs
    async importLogs(confirmation: boolean = false) {
      return await methods.run(
        'logs',
        async () => {
          importing.logs.running = true
          return await importLoader.importLogs((progress) => {
            importing.logs.progress = progress.progress
            if (progress.step == progress.total) {
              importing.logs.done = true
              importing.logs.running = false
            }
          })
        },
        confirmation,
      )
    },

    async importContext(confirmation: boolean = false) {
      return await methods.run(
        'context',
        async () => {
          return await importLoader.importContext()
        },
        confirmation,
      )
    },

    async importLocations(confirmation: boolean = false) {
      return await methods.run(
        'locations',
        async () => {
          return await importLoader.importLocations()
        },
        confirmation,
      )
    },
    // Confirm Import All
    async importAll() {
      let confirmed = await Interact.confirm(
        'Confirm',
        'Are you sure? Importing cannot be undone.',
      )
      if (confirmed === true) {
        await wait(300)
        importingAll = true
        importing.all.running = true
        let statusMonitor = []
        try {
          // Let the importer Importer all
          await importLoader.importAll((status) => {
            // While importing each item (other than logs)
            if (status.importing) {
              importing[status.importing] = importing[status.importing] || {}
              importing[status.importing].running = true
              statusMonitor.push(status.importing)
              // Make sure other things are not in the running state.
              Object.keys(importing).forEach((item) => {
                if (status.importing !== item) {
                  importing[item].running = false
                  if (statusMonitor.indexOf(item) > -1) {
                    importing[item].done = true
                  }
                }
              })
            } else {
              // We're importing Logs
              if (status.progress) {
                importing.logs.progress = status.progress
              }
            }
          })
          Object.keys(importing).forEach((item) => {
            importing[item].done = true
          })
          importing.all.running = false
          importing.all.done = true
          importing.logs.done = true
          importing.logs.running = false
          importingAll = false
          Interact.toast('Import Finishing...')
          await LedgerStore.getFirstDate(true)
          methods.finish()
        } catch (e) {
          console.error(e.message)
          Interact.alert('Error', e.message)
        }

        return true
      }
    },

    // Get Percentage between two numbers
  }

  const close = async () => {
    if (importing.logs.running) {
      const confirm = await Interact.confirm('Stop the import?')
      if (confirm) {
        window.location.reload()
      }
    } else {
      dispatch('dismiss')
    }
  }
</script>

<!-- Modal will be hidden in settings TODO: make this not hacky -->
<Modal2 id="importer" on:close={close} {visible}>

  <Panel className="h-full">
    <header slot="header">
      <ToolbarGrid>
        <dib slot="left">
          <Button icon on:click={close}>
            <Icon name="close" />
          </Button>
        </dib>
        <h1 class="ntitle">
          {Lang.t('settings.import-backup-file', 'Import a Backup File')}
        </h1>
      </ToolbarGrid>
    </header>
    {#if !fileData}
      <Empty
        className="my-5 text-center leading-tight"
        emoji="📦"
        description="Supports Nomie 2, 3, 4, 5"
        title={`Import a Nomie .json Backup file (not CSV)`}
        buttonLabel={Lang.t('settings.select-nomie-backup', 'Select Nomie Backup...')}
        buttonClick={() => {
          fileInput.click()
        }}>
        <input
          class="hidden"
          type="file"
          bind:this={fileInput}
          on:change={methods.onImportFile} />
      </Empty>

      <!-- <div class="empty-notice" style="opacity:1; max-height:80%">

      
      <div class="text-center d-flex flex-column justify-content-center">
        <p class="mb-4 text-sm text-faded-3">
          {Lang.t('settings.import-from-backup', 'Import backups (not CSV)')}
          <br />
          from
        </p>
        <Button
          block
          color="primary"
          on:click={() => {
            fileInput.click();
          }}>
          {Lang.t('settings.select-nomie-backup', 'Select Nomie Backup...')}
        </Button>
        
      </div>
    </div> -->
    {/if}
    <div class="n-list">
      {#if fileData && !version}
        <NItem
          title="Unknown/Invalid File"
          on:click={() => {
            fileData = null
          }} />
      {:else if fileData}
        <NItem className="item-divider compact bg-faded" />
        <div class="font-bold text-center text-black font-xl dark:text-white">
          From Nomie {fileData.nomie.number}
        </div>
        <NItem className="item-divider compact bg-faded" />

        {#if (importLoader.normalized.logs || []).length > 0}
          <ImporterItem
            emoji="⏰"
            title="Logs"
            count={(importLoader.normalized.logs || []).length}
            bind:status={importing.logs}
            on:import={() => {
              methods.importLogs(true)
            }}>
            {#if importing.logs.running}
              <ProgressBar
                percentage={importing.logs.progress}
                className="mt-2 mr-2" />
            {/if}
          </ImporterItem>
        {:else}
          <ListItem title="Logs">
            <div slot="left">⏰</div>
            <div slot="right">0</div>
          </ListItem>
        {/if}

        <!-- Importable Items -->
        {#if Object.keys(importLoader.normalized.trackers).length > 0}
          <ImporterItem
            emoji="🤪"
            title="Trackers"
            count={Object.keys(importLoader.normalized.trackers).length}
            bind:status={importing.trackers}
            on:import={() => {
              methods.importTrackers(true)
            }} />
        {:else}
          <ListItem title={Lang.t('general.trackers')}>
            <div slot="left">🤪</div>
            <div slot="right">0</div>
          </ListItem>
        {/if}

        <!-- Locations -->
        {#if (importLoader.normalized.locations || []).length > 0}
          <ImporterItem
            emoji="🗺"
            title="Locations"
            count={(importLoader.normalized.locations || []).length}
            bind:status={importing.locations}
            on:import={() => {
              methods.importLocations(true)
            }} />
        {:else}
          <ListItem title={Lang.t('general.locations', 'Locations')}>
            <div slot="left">🗺</div>
            <div slot="right">0</div>
          </ListItem>
        {/if}

        <!-- Board -->
        {#if (importLoader.normalized.boards || []).length > 0}
          <ImporterItem
            emoji="🗂"
            title={Lang.t('general.boards', 'Tracker Tabs')}
            count={(importLoader.normalized.boards || []).length}
            bind:status={importing.boards}
            on:import={() => {
              methods.importBoards(true)
            }} />
        {:else}
          <ListItem title={Lang.t('general.boards', 'Tracker Tabs')}>
            <div slot="left">🗂</div>
            <div slot="right">0</div>
          </ListItem>
        {/if}

        <!-- People -->
        {#if (Object.keys(importLoader.normalized.people) || []).length > 0}
          <ImporterItem
            emoji="👩🏽‍💼"
            title={Lang.t('general.people', 'People')}
            count={(Object.keys(importLoader.normalized.people) || []).length}
            bind:status={importing.people}
            on:import={() => {
              methods.importPeople(true)
            }} />
        {:else}
          <ListItem title={Lang.t('general.people', 'People')}>
            <div slot="left">👩🏽‍💼</div>
            <div slot="right">0</div>
          </ListItem>
        {/if}

        <!-- People -->
        {#if (importLoader.normalized.context || []).length > 0}
          <ImporterItem
            emoji="💭"
            title={Lang.t('general.context', 'Context')}
            count={(importLoader.normalized.context || []).length}
            bind:status={importing.context}
            on:import={() => {
              methods.importContext(true)
            }} />
        {:else}
          <ListItem title={Lang.t('general.context', 'Context')}>
            <div slot="left">💭</div>
            <div slot="right">0</div>
          </ListItem>
        {/if}

        <!-- Dashboards -->
        {#if (importLoader.normalized.dashboards || []).length > 0}
          <ImporterItem
            emoji="📊"
            title={Lang.t('general.dashboards', 'Dashboards')}
            count={(importLoader.normalized.dashboards || []).length}
            bind:status={importing.dashboards}
            on:import={() => {
              methods.importDashboards(true)
            }} />
        {:else}
          <ListItem title={Lang.t('general.dashboards', 'Dashboards')}>
            <div slot="left">📊</div>
            <div slot="right">0</div>
          </ListItem>
        {/if}

        <!-- logs -->
      {/if}
    </div>

    <!-- Footer -->
    <div slot="footer" class="flex-grow flex-shrink-0 p-2">
      {#if importingAll === true}
        <Button className="bg-primary-500" block size="lg" disabled>
          {Lang.t('import.import-all', 'Import All')}
        </Button>
      {:else if version && !importing.all.running && !importing.all.done}
        <Button
          className="bg-primary-500 text-white"
          block
          size="lg"
          on:click={methods.importAll}>
          {Lang.t('import.import-all', 'Import All')}
        </Button>
      {:else if importing.all.done}
        <Button
          className="bg-primary-500"
          block
          size="lg"
          on:click={methods.finish}>
          {Lang.t('general.finished', 'Finished')}
        </Button>
      {/if}
    </div>
  </Panel>

</Modal2>
