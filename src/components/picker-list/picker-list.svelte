<script lang="ts">
  import { onMount } from "svelte";

  import NItem from "../list-item/list-item.svelte";

  import { createEventDispatcher } from "svelte";
  import Input from "../input/input.svelte";
  import Button from "../button/button.svelte";
  import PickerSelect from "./picker-select.svelte";
  import type { ITracker } from "../../modules/tracker/tracker";
  import { TrackerStore } from "../../store/tracker-store";
  import { Lang } from "../../store/lang";
  import Text from "../text/text.svelte";
  import Icon from "../icon/icon.svelte";
  import SearchBar from "../search-bar/search-bar.svelte";
  const dispatch = createEventDispatcher();

  export let style = "";
  export let className = "";
  export let itemClass = "";
  export let list: Array<any> = [];
  // export let editWithText = true;
  export let mode = "select";
  export let tracker: ITracker;
  export let showHeaderContent: boolean = true;
  export let showSaveEditButton: boolean = true;

  export let canSelect: boolean = true;

  let selected = [];

  let ready = false;
  let textList;
  let hasChanges = false;
  let picks = [];

  function toggleEditMode() {
    mode = mode == "edit" ? "select" : "edit";
  }

  function textListChanged(evt) {
    picks = textList.getValue().split("\n");
    hasChanges = true;
  }

  function updateListAndSave() {
    picks = picks.filter((d) => `${d}`.length);
    tracker.picks = picks;
    TrackerStore.saveTracker(tracker);
    dispatch("editComplete", picks);
    mode = "select";
  }

  function fireSelectChange(evt) {
    selected = evt.detail;
    dispatch("change", evt.detail);
  }

  $: picks = tracker.picks || [];

  $: if (mode == "select" && tracker && list !== tracker.picks) {
    list = tracker.picks || [];
  }

  $: if (mode == "edit" && tracker && list !== tracker.picks) {
    list = tracker.picks || [];
  }

  let previewSwitch = false;

  function togglePreview() {
    previewSwitch = !previewSwitch;
  }

  onMount(() => {
    ready = true;
    hasChanges = false;
  });
</script>

<style>
  :global(.picker-list-wrapper .preview-button) {
    position: absolute;
    z-index: 20;
    top: 10px;
    right: 10px;
  }
</style>

<div class="picker-list-wrapper">
  {#if mode == 'edit'}
    <div class="n-picker-list edit-mode w-100 {className}" {style}>
      {#if showHeaderContent}
        <NItem title={Lang.t('picker.title', 'List one item per line')} className={itemClass} bg="transparent">
          <Text size="sm" faded>Include #trackers @people +context. Add a : to make a Title:</Text>
        </NItem>
      {/if}
      {#if ready}
        <Text size="sm">Item per line</Text>
        <Input
          solo
          listItem
          type="textarea"
          value={list.join('\n')}
          bind:this={textList}
          on:change={textListChanged}
          inputStyle="height:40vh; font-size:0.9em; line-height:150%" />

        <div class="justify-center px-2 py-4 filler">
          <Button
            color="light"
            on:click={() => {
              mode = 'select';
            }}>
            {Lang.t('general.cancel')}
          </Button>
          <div class="filler" />
          {#if canSelect && showSaveEditButton !== false}
            <Button
              disabled={!hasChanges}
              className={`${hasChanges ? 'fill-white' : ''}`}
              color={hasChanges ? 'primary-bright' : 'light'}
              on:click={updateListAndSave}>
              {#if hasChanges}
                <Icon name="alert" className={`fill-white mr-2`} />
              {/if}
              {Lang.t('general.save-changes', 'Save Changes')}
            </Button>
          {/if}

        </div>
      {/if}
    </div>
  {:else if mode === 'select'}
    <div class="n-picker-list select">
      <PickerSelect {tracker} active={selected} on:change={fireSelectChange}>
        <div slot="bottom" class="items-center justify-center p-2 pb-3 mt-2 filler">
          <Button size="xs" color="light" on:click={toggleEditMode}>
            <Icon name="edit" className="mr-2" size={'16'} />
            {Lang.t('general.edit-pick-list', 'Edit Pick List')}
          </Button>
        </div>
      </PickerSelect>
    </div>
  {/if}
</div>
