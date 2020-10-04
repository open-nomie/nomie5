<script lang="ts">
  import LogListLoader from "../../components/log-list/log-list-loader.svelte";
  import SearchBar from "../../components/search-bar/search-bar.svelte";
  import ShortcutUserButton from "../../components/shortcut-button/shortcut-user-button.svelte";
  import Text from "../../components/text/text.svelte";
  import type NLog from "../../modules/nomie-log/nomie-log";
  import type Person from "../../modules/person/person";
  import { Interact } from "../../store/interact";
  import { PeopleStore } from "../../store/people-store";
  import { SearchStore, SearchTerm } from "../../store/search-store";
  export let term: string;
  let results: Array<Person> = [];

  $: if (term) {
    results = Object.keys($PeopleStore.people)
      .filter((username: string) => {
        let person: Person = $PeopleStore.people[username];
        return `${person.displayName} ${person.username}`.toLowerCase().search(term) > -1;
      })
      .map((username) => {
        return $PeopleStore.people[username];
      });
  }

  $: if ($SearchStore.active && $SearchStore.active.term && $SearchStore.active.term !== term) {
    term = $SearchStore.active.term.replace("@", "");
  }

  function searchPeople(evt: CustomEvent) {
    term = evt.detail;
  }

  function clear() {
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
    placeholder="Search People..." />

</section>
<section class="n-panel scroll-y column">

  {#if results.length}
    <main class="trackers n-grid">
      {#each results as person, index}
        <ShortcutUserButton
          {person}
          on:more={() => {
            rememberSearch(person.username);
            Interact.openStats(`@${person.username}`);
            clear();
          }}
          on:click={() => {
            rememberSearch(person.username);
            Interact.person(person.username);
            clear();
          }} />
      {/each}
    </main>
  {/if}

</section>
