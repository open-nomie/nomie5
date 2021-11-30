<script lang="ts">
  import Modal2 from './../../components/modal/modal2.svelte'
  import Panel from './../../components/panel/panel.svelte'
  // Components
  import Modal from '../../components/modal/modal.svelte'
  import NItem from '../../components/list-item/list-item.svelte'
  import NInput from '../../components/input/input.svelte'
  import NLogListLoader from '../../components/log-list/log-list-loader.svelte'
  import NToolbar from '../../components/toolbar/toolbar.svelte'
  import NIcon from '../../components/icon/icon.svelte'
  import NToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import ButtonGroup from '../../components/button-group/button-group.svelte'
  import Dymoji from '../../components/dymoji/dymoji.svelte'
  import LogItem from '../../components/list-item-log/list-item-log.svelte'
  import BarChart from '../../components/charts/bar-chart.svelte'

  // Container Items
  import PersonCheckin from './person-check-in.svelte'

  // Modules / Utils
  import tick from '../../utils/tick/tick'
  import Person from '../../modules/person/person'

  import dayjs from 'dayjs'

  import { LedgerStore } from '../ledger/LedgerStore'
  import { Interact } from '../../store/interact'
  import { PeopleStore } from '../../store/people-store'
  import Button from '../../components/button/button.svelte'
  import ImageCapture from '../../components/image-capture.svelte'

  let domVisible = false
  let avatarBase64 = null

  let activePerson
  let activeStats
  let lastActivePersonKey
  let activeLogs

  $: if (
    $Interact.people.active &&
    lastActivePersonKey !== $Interact.people.active
  ) {
    lastActivePersonKey = $Interact.people.active

    activePerson = new Person($PeopleStore.people[$Interact.people.active])
    setTimeout(() => {
      domVisible = true
    }, 200)
  }

  const state = {
    view: 'check-in',
  }

  async function deleteUser() {
    let confirmed = await Interact.confirm(
      `Remove ${activePerson.username}?`,
      'This only deletes them from your list, NO log data will be deleted.',
    )
    if (confirmed) {
      await PeopleStore.deletePerson(activePerson)
      Interact.toast(`${activePerson.username} removed`)
      close()
    }
  }

  async function saveActivePerson() {
    try {
      await PeopleStore.savePerson(activePerson)
      Interact.toast('Saved')
    } catch (e) {
      Interact.alert('Error', e.message)
    }
  }

  // async function getAvatarImage(imageBase64: any) {
  //   const wrapper: any = document.getElementById('photo-holder')
  //   const _image: any = document.getElementById('photo-holder-image')
  //   let img: HTMLImageElement = _image
  //   img.src = imageBase64
  //   await tick(200)

  //   if (img.naturalHeight > img.naturalWidth) {
  //     wrapper.setAttribute('data-orientation', 'vertical')
  //   } else if (img.naturalHeight < img.naturalWidth) {
  //     wrapper.setAttribute('data-orientation', 'horizontal')
  //   } else {
  //     wrapper.setAttribute('data-orientation', 'square')
  //   }

  //   try {
  //     await tick(400)
  //     let canvas = await html2canvas(wrapper, { width: 90, height: 90 })
  //     let avatar64 = canvas.toDataURL('image/jpeg', 0.2)
  //     return avatar64
  //   } catch (e) {
  //     alert(e.message)
  //     return null
  //   }
  // }

  async function close() {
    domVisible = false
    await tick(200)
    Interact.person(null)
  }

  async function loadActiveLogs() {
    let active = $Interact.people.active
    activePerson = new Person($PeopleStore.people[active])
    activeLogs = await LedgerStore.queryPerson(
      active,
      dayjs().subtract(1, 'year'),
      dayjs(),
    )
  }

  // async function selectPhoto(evt) {
  //   const toBase64 = (file) =>
  //     new Promise((resolve, reject) => {
  //       const reader = new FileReader()
  //       reader.readAsDataURL(file)
  //       reader.onload = () => resolve(reader.result)
  //       reader.onerror = (error) => reject(error)
  //     })

  //   let input = evt.target
  //   let files = evt.target.files
  //   let avatarBase64 = await toBase64(files[0])
  //   await tick(20)
  //   let smallAvatar64 = await getAvatarImage(avatarBase64)
  //   await tick(20)
  //   const holder: any = document.getElementById('photo-holder-image')
  //   holder.src = null
  //   await tick(10)
  //   activePerson.avatar = smallAvatar64
  // }

  async function changeView(view) {
    state.view = view
  }
</script>

<style lang="postcss" global>
  .file-input-wraper {
    height: 1px;
    overflow: hidden;
  }
  .person-checkin .btn-group .active div {
    font-size: 2em !important;
  }
</style>

<Modal2
  tappable
  on:close={() => {
    close()
  }}
  id="person-modal"
  visible={domVisible}
  position="bottom">
  <Panel className="h-full">
    <header class="w-100" slot="header">
      <NToolbarGrid>
        <div slot="left">
          <Button icon on:click={close} className="tap-icon">
            <NIcon name="close" />
          </Button>
        </div>
        <div class="main">
          <div class="flex ntitle">
            <Dymoji person={activePerson} size={26} radius={0.3} />
            &nbsp; {activePerson.getDisplayName()}
          </div>
        </div>
        <div slot="right">
          <Button
            type="clear"
            className="text-primary-500"
            on:click={() => {
              close()
              Interact.openStats(`@${activePerson.getUsername()}`)
            }}>
            Stats
          </Button>
        </div>
      </NToolbarGrid>
      <NToolbar>
        <ButtonGroup
          size="sm"
          buttons={[{ label: 'Logs', active: state.view === 'logs', click() {
                changeView('logs')
              } }, { label: 'Check-In', active: state.view === 'check-in', click() {
                changeView('check-in')
              } }, { label: 'Edit', active: state.view === 'edit', click() {
                changeView('edit')
              } }]} />
      </NToolbar>
    </header>

    <main>
      {#if state.view == 'check-in'}
        <PersonCheckin on:checkedIn={close} />
      {:else if state.view == 'edit'}
        <div class="p-3 edit">

          <NInput
            type="text"
            className="mb-2"
            placeholder="Display Name"
            bind:value={activePerson.displayName}>
            <div slot="right" class="pr-2">
              <ImageCapture
                size={40}
                renderSize={90}
                original={activePerson.avatar}
                on:image={(evt) => {
                  activePerson.avatar = evt.detail
                }} />
            </div>
          </NInput>
          <NInput
            type="textarea"
            placeholder="Notes"
            className="mb-2"
            bind:value={activePerson.notes} />

          <!-- <NItem className="bg-transparent p-0">
            <div
              slot="left"
              on:click={() => {
                document.getElementById('avatarFileInput').click()
              }} />

            <Button
              block
              color="light"
              on:click={() => {
                document.getElementById('avatarFileInput').click()
              }}>
              Select Photo...
            </Button>
            <div class="file-input-wraper">
              <input
                class="pb-2 form-control"
                id="avatarFileInput"
                placeholder="Avatar"
                type="file"
                accept="png,jpeg,jpg"
                on:change={selectPhoto} />
            </div>

          </NItem> -->

          <Button
            block
            color="primary"
            className="mt-5 mb-2"
            on:click={saveActivePerson}>
            Save @{activePerson.username}
          </Button>

          <NItem
            className="bg-transparent text-solid-3 text-sm text-center"
            on:click={deleteUser}>
            Delete @{activePerson.username}...
          </NItem>
        </div>
      {:else if state.view == 'logs'}
        <NLogListLoader compact term={`@${activePerson.username}`} />
      {/if}
    </main>
  </Panel>

</Modal2>
