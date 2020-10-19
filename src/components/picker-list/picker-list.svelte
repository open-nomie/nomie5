<script lang="ts">
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

        <div class="n-row px-2 py-4 filler">
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
      <PickerSelect {tracker} on:change={fireSelectChange}>
        <div slot="bottom" class="n-row filler pt-2 pb-2 px-2 mt-2">
          <Button size="xs" className="text-primary-bright" block color="transparent" on:click={toggleEditMode}>
            <Icon name="edit" className="mr-2 fill-primary-bright" size={'16'} />
            Edit Pick List
          </Button>
        </div>
      </PickerSelect>
    </div>
  {/if}
</div>
