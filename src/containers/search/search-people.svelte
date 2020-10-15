<script lang="ts">
  import type { t } from "i18next";
  import ListItem from "../../components/list-item/list-item.svelte";
  import LogListLoader from "../../components/log-list/log-list-loader.svelte";
  import SearchBar from "../../components/search-bar/search-bar.svelte";
  import ShortcutUserButton from "../../components/shortcut-button/shortcut-user-button.svelte";
  import Text from "../../components/text/text.svelte";
  import type NLog from "../../modules/nomie-log/nomie-log";
  import type Person from "../../modules/person/person";
  import { Interact } from "../../store/interact";
  import { Lang } from "../../store/lang";
  import { PeopleStore } from "../../store/people-store";
  import { SearchStore, SearchTerm } from "../../store/search-store";
  import tick from "../../utils/tick/tick";
  export let term: string;
  let results: Array<Person> = [];

  $: if (term) {
    results = Object.keys($PeopleStore.people)
      .filter((username: string) => {
        let person: Person = $PeopleStore.people[username];
        return `${person.displayName} ${person.username} ${person.notes}`.toLowerCase().search(term.replace("@", "").toLowerCase()) > -1;
      })
      .map((username) => {
        return $PeopleStore.people[username];
      });
  } else {
    results = [];
  }

  $: if ($SearchStore.active && $SearchStore.active.term && $SearchStore.active.term !== term) {
    term = $SearchStore.active.term.replace("@", "");
  }

  function searchPeople(evt: CustomEvent) {
    term = evt.detail;
  }

  async function clear() {
    term = undefined;
    SearchStore.clear();
    term = undefined;
  }

  async function close() {
    term = undefined;
    SearchStore.clear();
    SearchStore.close();
  }

  function rememberSearch(username: string) {
    SearchStore.save(
      new SearchTerm({
        term: `${username}`,
        type: "people",
      })
    );
  }
</script>

<section class="n-panel stiff pt-2">
  <SearchBar
    compact
    autofocus
    showClose={true}
    className="filler"
    searchTerm={term || ''}
    on:clear={clear}
    on:change={searchPeople}
    placeholder={Lang.t('search.search-people', 'Search People...')} />

</section>
<section class="n-panel scroll-y column">
  {#if results.length}
    <main class="trackers n-grid">
      {#each results as person, index}
        <ShortcutUserButton
          {person}
          on:more={() => {
            rememberSearch(term);
            close();
            Interact.openStats(`@${person.username}`);
          }}
          on:click={() => {
            rememberSearch(term);
            close();
            Interact.person(person.username);
          }} />
      {/each}
    </main>
  {:else if term && !results.length}
    <ListItem title={Lang.t('search.no-results', 'No results found')} className="mt-4" />
  {/if}

</section>
