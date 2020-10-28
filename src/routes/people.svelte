<script>
  import { onMount } from "svelte";
  import NItem from "../components/list-item/list-item.svelte";
  import NToolbar from "../components/toolbar/toolbar.svelte";
  import Text from "../components/text/text.svelte";
  import NIcon from "../components/icon/icon.svelte";
  import Button from "../components/button/button.svelte";
  import NLayout from "../containers/layout/layout.svelte";
  import ShortcutUserButton from "../components/shortcut-button/shortcut-user-button.svelte";

  import { Lang } from "../store/lang";
  import { PeopleStore } from "../store/people-store";
  import { Interact } from "../store/interact";
  import { LedgerStore } from "../store/ledger";
  import { SearchStore } from "../store/search-store";

  import dayjs from "dayjs";
  import Empty from "../containers/empty/empty.svelte";
  export const location = undefined;

  let state = {
    people: [],
    view: "time",
    stats: {},
    searchTerm: null,
    initialized: false,
  };

  const personClicked = (username) => {
    Interact.person(username);
  };

  /**
   * When PeopleStore Changes,
   * set state.people to the array of usernames
   */
  $: if (state.view && $PeopleStore.people) {
    loadPeople();
    state.initialized = true;
  }

  function loadPeople() {
    const longTimeAgo = dayjs().subtract(100, "years").toDate();

    state.people = getPeople().sort((a, b) => {
      return $PeopleStore.people[a].last < $PeopleStore.people[b].last ? 1 : -1;
    });
  }

  async function addPerson() {
    try {
      let username = await Interact.prompt(Lang.t("people.person-name", "Person Name"));
      if (username) {
        let person = await PeopleStore.addByName(username);
        if (person) {
          LedgerStore.fastLog(`Added @${person.username} to +nomie`);
          personClicked(person.username);
        }
      }
    } catch (e) {
      Interact.alert("Error", e.message);
    }
  }

  function getPeople() {
    // The $PeopleStore.peple is a map - username is the key
    if (state.searchTerm) {
      return Object.keys(($PeopleStore || {}).people || {}).filter((person) => {
        return person.toLowerCase().search(state.searchTerm) > -1;
      });
    } else {
      return Object.keys(($PeopleStore || {}).people || {});
    }
  }

  onMount(() => {
    loadPeople();
    state.initialized = true;
  });
</script>

<style lang="scss">

</style>

<NLayout pageTitle="People">

  <div slot="header" class="n-row">
    <NToolbar className="container px-2">
      <Button
        color="none"
        shape="circle"
        className="tap-icon"
        on:click={() => {
          SearchStore.view('people');
        }}>
        <NIcon name="search" size={24} />
      </Button>
      <div class="filler pl-2 truncate">
        {#if state.people.length}
          <Text center bold>{Lang.t('tabs.people', 'People')}</Text>
        {/if}
      </div>
      <Button color="none" shape="circle" className="tap-icon" on:click={addPerson}>
        <NIcon name="userAdd" className="fill-primary-bright" />
      </Button>
    </NToolbar>
  </div>

  <div slot="content" class="container">
    <div class="n-list my-2 bg-transparent">
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

      <div class="trackers n-grid">
        {#each state.people as person, person}
          <ShortcutUserButton
            person={$PeopleStore.people[person]}
            on:click={() => {
              personClicked(person);
            }}
            on:more={() => {
              Interact.openStats(`@${person}`);
            }} />
        {/each}
      </div>

    </div>
  </div>
</NLayout>
