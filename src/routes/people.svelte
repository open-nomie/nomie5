<script>
  import { openStats } from './../containers/stats/StatsStore'
  import Container from './../components/container/container.svelte'
  import { onMount } from 'svelte'
  import NItem from '../components/list-item/list-item.svelte'
  import NToolbar from '../components/toolbar/toolbar.svelte'
  import Text from '../components/text/text.svelte'
  import NIcon from '../components/icon/icon.svelte'
  import Button from '../components/button/button.svelte'
  import NLayout from '../containers/layout/layout.svelte'
  import ShortcutUserButton from '../components/shortcut-button/shortcut-user-button.svelte'

  import { Lang } from '../store/lang'
  import { PeopleStore } from '../store/people-store'
  import { Interact } from '../store/interact'
  import { LedgerStore } from '../store/ledger'
  import { SearchStore } from '../store/search-store'

  import dayjs from 'dayjs'
  import Empty from '../containers/empty/empty.svelte'
  export const location = undefined

  let state = {
    people: [],
    view: 'time',
    stats: {},
    searchTerm: null,
    initialized: false,
  }

  const personClicked = (username) => {
    Interact.person(username)
  }

  /**
   * When PeopleStore Changes,
   * set state.people to the array of usernames
   */
  $: if (state.view && $PeopleStore.people) {
    loadPeople()
    state.initialized = true
  }

  function loadPeople() {
    state.people = getPeople().sort((a, b) => {
      return $PeopleStore.people[a].last < $PeopleStore.people[b].last ? 1 : -1
    })
    state.initialized = true
  }

  async function addPerson() {
    try {
      let username = await Interact.prompt(
        Lang.t('people.person-name', 'Person Name'),
      )
      if (username) {
        let person = await PeopleStore.addByName(username)
        if (person) {
          LedgerStore.fastLog(`Added @${person.username} to +nomie`)
          personClicked(person.username)
        }
      }
    } catch (e) {
      Interact.alert('Error', e.message)
    }
  }

  function getPeople() {
    // The $PeopleStore.peple is a map - username is the key
    if (state.searchTerm) {
      return Object.keys(($PeopleStore || {}).people || {}).filter((person) => {
        return person.toLowerCase().search(state.searchTerm) > -1
      })
    } else {
      return Object.keys(($PeopleStore || {}).people || {})
    }
  }

  onMount(() => {
    loadPeople()
  })
</script>

<NLayout pageTitle="People">

  <div slot="header" class="flex">
    <Container>
      <NToolbar className=" px-2">
        <Button
          color="none"
          shape="circle"
          className="tap-icon"
          on:click={() => {
            SearchStore.view('people')
          }}>
          <NIcon name="search" size={24} />
        </Button>
        <div class="ntitle">
          {#if state.people.length}
            {Lang.t('tabs.people', 'People')}
          {:else}{Lang.t('people.no-people-found', 'No People Found')}{/if}
        </div>
        <Button
          color="none"
          shape="circle"
          className="tap-icon"
          on:click={addPerson}>
          <NIcon name="userAdd" className="fill-primary-bright" />
        </Button>
      </NToolbar>
    </Container>
  </div>

  <div slot="content">
    <Container size="xl" className="my-2">
      {#if !state.people.length && !state.searchTerm && state.initialized}
        <Empty
          title={Lang.t('general.people')}
          emoji="👨‍👩‍👦‍👦"
          description={Lang.t('people.empty-message', 'Track & monitor how you interact with your friends and family')}
          buttonLabel={Lang.t('people.add-a-person', 'Add a Person...')}
          buttonClick={addPerson} />
      {:else if !state.initialized}
        <NItem>Loading...</NItem>
      {:else if !state.people.length && state.searchTerm}
        <NItem>Nothing found for @{state.searchTerm}</NItem>
      {/if}

      <div class="item-grid">
        {#each state.people as person, index (person)}
          <ShortcutUserButton
            person={$PeopleStore.people[person]}
            on:click={() => {
              personClicked(person)
            }}
            on:more={() => {
              openStats(`@${person}`)
            }} />
        {/each}
      </div>

    </Container>
  </div>
</NLayout>
