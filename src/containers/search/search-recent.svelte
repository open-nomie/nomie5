<script lang="ts">
  import Button from "../../components/button/button.svelte";

  import ListItem from "../../components/list-item/list-item.svelte";
  import Text from "../../components/text/text.svelte";
  import { Lang } from "../../store/lang";
  import { SearchStore } from "../../store/search-store";
  import type { SearchTerm } from "../../store/search-store";
  import { TrackerStore } from "../../store/tracker-store";
  import TrackerConfig from "../../modules/tracker/tracker";
  import TrackerList from "../board/trackers.svelte";
  import { Interact } from "../../store/interact";

  let mode = "view";
  let savedTerms: Array<SearchTerm>;
  let savedTrackers: Array<TrackerConfig>;

  $: if ($SearchStore.saved.length || $SearchStore.view) {
    // Get SavedTerms array
    savedTerms = $SearchStore.saved
      .filter((st: SearchTerm) => {
        return st.type === $SearchStore.view;
      })
      .reverse();

    if ($SearchStore.view === "trackers") {
      savedTrackers = savedTerms.map((searchTerm: SearchTerm) => {
        let tag: string = searchTerm.term.replace("#", "");
        return $TrackerStore.trackers[tag] || new TrackerConfig({ tag });
      });
    } else if ($SearchStore.view === "people") {
    }

    savedTerms = savedTerms;
  }

  function toggleEditMode() {
    mode = mode === "view" ? "edit" : "view";
  }
</script>

{#if savedTerms.length}
  <ListItem itemDivider compact className="bg-transparent">
    Previous Searches
    <div slot="right">
      {#if mode != 'edit'}
        <Button
          color="transparent"
          size="sm"
          on:click={() => {
            toggleEditMode();
          }}>
          {Lang.t('general.edit', 'Edit')}
        </Button>
      {:else}
        <Button
          size="sm"
          color="transparent"
          className="text-red"
          on:click={() => {
            toggleEditMode();
          }}>
          {Lang.t('general.done', 'Done')}
        </Button>
      {/if}
    </div>
  </ListItem>

  {#if $SearchStore.view === 'trackers'}
    {#if mode !== 'edit'}
      <div class="n-list">
        <TrackerList
          view="list"
          hideAdd
          trackers={savedTrackers.reverse()}
          on:more={(evt) => {
            const tracker = evt.detail;
            Interact.elementOptions(tracker.getTrackableElement(), () => {
              SearchStore.close();
            });
            evt.stopPropagation();
            evt.preventDefault();
          }}
          on:tap={(evt) => {
            Interact.trackerTap(evt.detail, $TrackerStore.trackers);
            SearchStore.close();
          }} />
      </div>
    {:else}
      {#each savedTerms.reverse() as searchTerm (searchTerm.term)}
        <ListItem title={searchTerm.term}>
          <div slot="right">
            <Button
              text
              size="sm"
              style="color:var(--color-red)"
              on:click={() => {
                SearchStore.remove(searchTerm);
              }}>
              Delete
            </Button>
          </div>
        </ListItem>
      {/each}
    {/if}
  {:else}
    {#each savedTerms as searchTerm (searchTerm.term)}
      <ListItem
        clickable={mode !== 'edit'}
        bottomLine
        on:click={(evt) => {
          if (mode == 'view') {
            SearchStore.update((state) => {
              state.active = searchTerm;
              state.view = searchTerm.type;
              return state;
            });
          }
        }}>
        <Text>{searchTerm.term}</Text>
        <div slot="right">
          {#if mode == 'edit'}
            <Button
              size="sm"
              color="danger"
              on:click={() => {
                SearchStore.remove(searchTerm);
              }}>
              Delete
            </Button>
          {/if}
        </div>
      </ListItem>
    {/each}
  {/if}
{/if}
