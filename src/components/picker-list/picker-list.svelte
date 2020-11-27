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

  function toggleEditMode() {
    mode = mode == "edit" ? "select" : "edit";
  }

  function textListChanged(evt) {
    tracker.picks = textList.getValue().split("\n");
    hasChanges = true;
  }

  function updateListAndSave() {
    tracker.picks = tracker.picks.filter((d) => `${d}`.length);
    TrackerStore.saveTracker(tracker);
    dispatch("editComplete", tracker.picks);
    mode = "select";
  }

  function fireSelectChange(evt) {
    // console.log("Fire selected", evt.detail);
    selected = evt.detail.split(" ");
    dispatch("change", evt.detail);
  }

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
    <div class="n-picker-list w-100 {className}" {style}>
      {#if showHeaderContent}
        <NItem title={Lang.t('picker.title', 'List one item per line')} className={itemClass} bg="transparent">
          <Text size="sm" faded>Include #trackers @people +context. Add a : to make a Title:</Text>
        </NItem>
      {/if}
      {#if ready}
        <Input
          listItem
          type="textarea"
          placeholder="Item per line"
          value={list.join('\n')}
          bind:this={textList}
          on:change={textListChanged}
          inputStyle="height:40vh; font-size:0.8em; line-height:150%" />

        <div class="px-2 py-4 n-row filler">
          {#if canSelect && showSaveEditButton !== false}
            <Button
              size="xs"
              className={`${hasChanges ? 'text-primary-bright' : 'text-inverse-2'}`}
              block
              color="transparent"
              on:click={updateListAndSave}>
              {#if hasChanges}
                <Icon name="checkmarkOutline" className={`fill-primary-bright mr-2`} />
              {/if}
              {Lang.t('general.save-list-edits', 'Save List Edits')}
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
