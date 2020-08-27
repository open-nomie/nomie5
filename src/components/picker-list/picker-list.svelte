<script>
  import { onMount } from "svelte";

  import NItem from "../list-item/list-item.svelte";
  import NText from "../text/text.svelte";
  import NInput from "../input/input.svelte";
  import NIcon from "../icon/icon.svelte";
  import NSpinner from "../spinner/spinner.svelte";
  import NSortableList from "../sortable-list/sortable-list.svelte";

  import { createEventDispatcher } from "svelte";
  import Input from "../input/input.svelte";
  import Button from "../button/button.svelte";
  const dispatch = createEventDispatcher();

  export let style = "";
  export let className = "";
  export let itemClass = "";
  export let list = [];
  export let editWithText = false;
  // export let mode = "edit";

  let ready = false;
  let activeValue = null;
  let activeItem = null;
  let textList;

  function updateWithText() {
    list = textList.getValue().split("\n");
    editWithText = false;
  }

  function updateItem(oldItem, newItem) {
    let matched = false;
    list = list.map((item) => {
      if (item == oldItem && !matched) {
        matched = true;
        return newItem;
      } else {
        return item;
      }
    });
    list = list;
  }

  function add() {
    let newList = [];
    let itemToAdd = `${activeValue}`;
    let pushed = false;
    list.forEach((item) => {
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
    list = evt.detail;
    fireChange();
  }

  function remove(item) {
    list = list.filter((i) => {
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
  <NItem
    title="Add items to pick from"
    className={itemClass}
    bg="transparent"
    description="Example: #tracker, #trackerValues(3), @people and +context" />
  {#if ready}
    {#if !editWithText}
      <div class="sortable-list {itemClass}">
        <NInput compact on:enter={add} placeholder="Add an Item" bind:value={activeValue}>
          <button slot="right" class="btn btn-clear text-primary btn-sm mr-1" disabled={!activeValue} on:click={add}>+Add</button>
        </NInput>
        <hr class="divider center my-2" />
        <NSortableList items={list || []} handle=".menu-handle" on:update={sorted} let:item>
          <NItem
            className="bg-solid px-2 py-1"
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
            <NText size="sm">
              <span
                on:dbltap={() => {
                  let newItem = prompt('Update', item);
                  if (newItem) {
                    updateItem(item, newItem);
                  }
                }}>
                {item}
              </span>
            </NText>
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
    {:else}
      <div class="p-2">
        <Input
          type="textarea"
          placeholder="Item per line"
          value={list.join('\n')}
          bind:this={textList}
          inputStyle="height:40vh; font-size:0.9rem; line-height:200%" />
      </div>
    {/if}

    <div class="n-row px-2 pb-1">
      <div class="filler" />
      {#if editWithText}
        <Button size="sm" color="primary" on:click={updateWithText}>Done Editing</Button>
      {:else}
        <Button
          size="sm"
          color="transparent"
          on:click={() => {
            editWithText = true;
          }}>
          Edit as Text
        </Button>
      {/if}
      <div class="filler" />
    </div>
  {/if}
</div>
