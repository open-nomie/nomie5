<script>
  import { onMount } from "svelte";
  import Sortable from "sortablejs";
  // DISPATCH REORDER
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  // PROPS
  export let items;
  export let key;
  export let handle = undefined;

  let sortableList;

  const reorder = (to, from) => {
    let newList = [...items];
    let tempItem = "temp";
    let movedItem = newList[from];

    // Cut in the temp Item
    newList.splice(to, 0, tempItem);
    // FILTER OUT MOVED ITEM
    newList = newList
      .filter(item => {
        return item !== movedItem;
      })
      .map(item => {
        return item !== tempItem ? item : movedItem;
      });

    dispatch("update", newList);
  };

  // UTILS
  const getKey = item => (key ? item[key] : item);

  onMount(() => {
    setTimeout(() => {
      if (sortableList) {
        let sortable = Sortable.create(sortableList, {
          handle: handle,
          onEnd: function(evt) {
            reorder(evt.newDraggableIndex, evt.oldDraggableIndex);
          }
        });
      }
    });
  });
</script>

<style>
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    max-width: 100%;
    overflow: hidden;
  }
  li {
    margin: 0;
    padding: 0;
  }
  :global(.sortable-chosen) {
    box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.3);
  }
  :global(.sortable-ghost) {
    opacity: 0.7;
  }
</style>

{#if items && items.length}
  <ul bind:this={sortableList}>
    {#each items as item, index (getKey(item))}
      <li>
        <slot {item} {index} />
      </li>
    {/each}
  </ul>
{/if}
