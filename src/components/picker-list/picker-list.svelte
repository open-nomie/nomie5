<script>
  import { onMount } from "svelte";

  import NItem from "../list-item/list-item.svelte";
  import NText from "../text/text.svelte";
  import NInput from "../input/input.svelte";
  import NIcon from "../icon/icon.svelte";
  import NSpinner from "../spinner/spinner.svelte";
  import NSortableList from "../sortable-list/sortable-list.svelte";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let style = "";
  export let className = "";
  export let list = [];
  export let mode = "edit";

  let ready = false;
  let activeValue = null;
  let activeItem = null;

  function add() {
    let newList = [];
    let itemToAdd = `${activeValue}`;
    let pushed = false;
    list.forEach(item => {
      newList.push(item);
      if (item == activeItem) {
        newList.push(itemToAdd);
        pushed = true;
      }
    });
    if (!pushed) {
      newList.push(itemToAdd);
    }
    list = newList;
    activeValue = null;
    fireChange();
  }

  function sorted(evt) {
    // console.log("sorted", evt);
    list = evt.detail;
    fireChange();
  }

  function remove(item) {
    list = list.filter(i => {
      return i !== item;
    });
    list = list;
    fireChange();
  }

  function fireChange() {
    ready = false;
    dispatch("change", list);
    ready = true;
    // setTimeout(() => {
    //   ready = true;
    // }, 1);
  }

  onMount(() => {
    ready = true;
  });
</script>

<div class="n-picker-list {className}" {style}>
  <NItem title="Enter items to pick from your list.">
    <div class="note">
      Enter any value, including #tracker, #trackerValues(3), @people and
      +context
    </div>
  </NItem>
  <NItem>
    <NInput
      compact
      on:enter={add}
      placeholder="Add an Item"
      bind:value={activeValue}>
      <button
        slot="right"
        class="btn btn-clear"
        disabled={!activeValue}
        on:click={add}>
        <NIcon name="addOutline" />
      </button>
    </NInput>
  </NItem>
  {#if ready}
    <div class="sortable-list p-2 px-3">
      <NSortableList
        items={list}
        handle=".menu-handle"
        on:update={sorted}
        let:item>
        <NItem
          className="bottom-line {activeItem == item ? 'active' : ''}"
          on:click={() => {
            if (activeItem == item) {
              activeItem = null;
            } else {
              activeItem = item;
            }
          }}>
          <div slot="left">
            <NIcon name="menu" className="fill-faded-3 menu-handle" size="18" />
          </div>
          <NText size="sm">{item}</NText>
          <button
            slot="right"
            class="btn btn-clear pl-0"
            on:click={() => {
              remove(item);
            }}>
            <NIcon name="remove" className="fill-red" size="18" />
          </button>

        </NItem>
      </NSortableList>
    </div>
  {/if}
</div>
