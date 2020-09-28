<script lang="ts">
  import Button from "../../components/button/button.svelte";

  import ListItem from "../../components/list-item/list-item.svelte";
  import Text from "../../components/text/text.svelte";
  import { Lang } from "../../store/lang";
  import { SearchStore } from "../../store/search-store";
  import type { SearchTerm } from "../../store/search-store";

  let mode = "view";
  let saved: Array<SearchTerm>;
  $: if ($SearchStore.saved.length || $SearchStore.view) {
    saved = $SearchStore.saved.filter((st: SearchTerm) => {
      return st.type === $SearchStore.view;
    });
    console.log({ saved });
  }

  function toggleEditMode() {
    mode = mode === "view" ? "edit" : "view";
  }
</script>

{#if saved.length}
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
  {#each $SearchStore.saved as searchTerm (searchTerm.term)}
    <ListItem
      clickable={mode !== 'edit'}
      bottomLine
      on:click={(evt) => {
        if (mode == 'view') {
          $SearchStore.active = searchTerm;
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
