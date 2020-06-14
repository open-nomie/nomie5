<script>
  import { onMount } from "svelte";

  import NItem from "../list-item/list-item.svelte";
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

  function add() {
    list.push(`${activeValue}`);
    activeValue = null;
    list = list;
    fireChange();
  }

  function sorted(evt) {}

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
    setTimeout(() => {
      ready = true;
    }, 10);
  }

  onMount(() => {
    ready = true;
    console.log("Picker list ready", list);
  });
</script>

<div class="n-picker-list {className}" {style}>
  <NItem>
    <NInput
      on:enter={add}
      placeholder="Value to include in Note. #mood(4)"
      bind:value={activeValue}>
      <button slot="right" class="btn btn-clear" on:click={add}>
        <NIcon name="addOutline" />
      </button>
    </NInput>
  </NItem>
  {#if ready}
    <NSortableList
      bind:items={list}
      handle=".menu-handle"
      on:update={sorted}
      let:item>
      <NItem title={item}>

        <button
          slot="left"
          class="btn btn-clear px-0"
          on:click={() => {
            remove(item);
          }}>
          <NIcon name="delete" className="fill-red" />
        </button>

        <div slot="right">
          <NIcon name="menu" className="fill-faded-3 menu-handle" />
        </div>
      </NItem>
    </NSortableList>
  {/if}
</div>
