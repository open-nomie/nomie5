<script lang="ts">
  import Panel from './../../components/panel/panel.svelte'
  import LogListLoader from '../../components/log-list/log-list-loader.svelte'
  import SearchBar from '../../components/search-bar/search-bar.svelte'
  import Text from '../../components/text/text.svelte'
  import type NLog from '../../modules/nomie-log/nomie-log'
  import { Interact } from '../../store/interact'
  import { Lang } from '../../store/lang'
  import { SearchStore, SearchTerm } from '../../store/search-store'

  export let term: string

  let results: Array<NLog> = []

  $: if ($SearchStore.active) {
    term = $SearchStore.active.term
  }

  function clear() {
    SearchStore.clear()
    term = undefined
  }

  function search(evt: CustomEvent) {
    term = evt.detail
    if (term) {
      SearchStore.setActiveTerm(new SearchTerm({ term, type: 'history' }))
    }
  }
</script>

<Panel className="h-full">
  <section slot="header" class="pb-2">
    <SearchBar
      compact
      className="filler"
      autofocus
      searchTerm={term || ''}
      placeholder={Lang.t('search.search-history', 'Search History...')}
      on:search={search}
      on:clear={clear} />
  </section>

  <main class="h-full mb-4 bg-gray-200 filler dark:bg-gray-800">
    {#if term}
      <section class="h-full p-4 search-results">
        <LogListLoader
          fullDate={true}
          showTimeDiff={true}
          bind:results
          {term}
          limit={20}
          className="bg-transparent"
          on:textClick={(event) => {
            Interact.elementOptions(event.detail)
          }}
          on:moreClick={(event) => {
            Interact.logOptions(event.detail).then(() => {})
          }} />
      </section>
    {/if}
  </main>
</Panel>
