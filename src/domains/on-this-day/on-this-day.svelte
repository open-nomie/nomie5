<script lang="ts">
  import { Interact } from '../../store/interact'

  import { LedgerStore } from '../ledger/LedgerStore'
  import Text from '../../components/text/text.svelte'
  import NIcon from '../../components/icon/icon.svelte'
  import NModal from '../../components/modal/modal.svelte'
  import dayjs from 'dayjs'
  import Button from '../../components/button/button.svelte'
  import ButtonGroup from '../../components/button-group/button-group.svelte'
  import Icon from '../../components/icon/icon.svelte'
  import Toolbar from '../../components/toolbar/toolbar.svelte'
  import { PeopleStore } from '../../store/people-store'
  import Row from '../../components/row/row.svelte'
  import {
    getContext,
    getNotes,
    getPeople,
    OTDViews,
    processTrackers,
  } from './on-this-day-helpers'

  import type { OTDView, OTDViewOption } from './on-this-day-helpers'
  import OnThisDayViews from './on-this-day-views.svelte'

  const state = {
    notes: [],
    trackers: [],
    trackers1: [],
    trackers2: [],
    records: [],
    people: [],
    context: [],
    locations: [],
  }

  let showDom = false
  let showWindow = false
  let loading = false

  let views: typeof OTDViews = OTDViews

  let view: OTDViewOption = 'notes'

  let activeView: OTDView = views[0]

  $: if ($Interact.onThisDay) {
    showDom = true
    setTimeout(() => {
      showWindow = true
    }, 20)
    loadDay()
  } else {
    showWindow = false
    setTimeout(() => {
      showDom = false
    }, 200)
  }

  function setView(v: OTDViewOption) {
    view = v
    activeView = views.find((lview) => lview.view === v)
  }

  async function loadDay() {
    loading = true
    let day = await LedgerStore.getDay($Interact.onThisDay)
    let trackersUsed = LedgerStore.extractTrackerTagAndValues(day)
    state.people = getPeople(day, $PeopleStore.people)
    state.context = getContext(day)
    state.notes = getNotes(day)
    state.trackers = processTrackers(trackersUsed)

    state.records = day
    loading = false
  }

  function nextDay() {
    let date = dayjs($Interact.onThisDay).add(1, 'day').toDate()
    Interact.onThisDay(date)
  }

  function previousDay() {
    let date = dayjs($Interact.onThisDay).subtract(1, 'day').toDate()
    Interact.onThisDay(date)
  }

  // let lastDate;
  // // $: if (date && date !== lastDate) {
  // //   lastDate = date;
  // //   loadDay();
  // // }
</script>

{#if showDom}
  <NModal
    show={showWindow}
    type="bottom-slideup"
    bodyClass="bg-solid-1"
    ariaLabel="On this day">
    <header slot="header" class="w-100">
      <div class="n-toolbar-grid">
        <div class="left">
          <Button icon className="tap-icon" on:click={Interact.closeOnThisDay}>
            <NIcon name="close" />
          </Button>
        </div>
        <div class="py-1 main">
          <Text className="mt-1">
            {dayjs($Interact.onThisDay).format('ddd MMM D, YYYY')}
          </Text>
          <Row className="justify-content-center">
            <Text size="sm" className="mr-2">{activeView.label}</Text>
            <Text className="text-faded-3" size="sm">
              {dayjs($Interact.onThisDay).fromNow()}
            </Text>
          </Row>
        </div>
        <div class="right">
          <div class="flex">
            <Button className="tap-icon px-1" on:click={previousDay}>
              <NIcon name="chevronLeft" />
            </Button>
            <Button className="tap-icon px-1" on:click={nextDay}>
              <NIcon name="chevronRight" />
            </Button>
          </div>
        </div>
      </div>
      <Toolbar>
        <ButtonGroup>
          {#each views as loopView}
            {#if loopView.view !== 'all'}
              <Button
                className={view === loopView.view ? 'active' : ''}
                icon
                on:click={() => {
                  setView(loopView.view)
                }}>
                <Icon name={loopView.icon} />
              </Button>
            {/if}
          {/each}
        </ButtonGroup>
      </Toolbar>
      <!-- <HScroller className="py-2">

        

      </HScroller> -->
    </header>

    {#if !loading}
      <OnThisDayViews {view} logs={state.records} />
    {/if}

  </NModal>
{/if}
