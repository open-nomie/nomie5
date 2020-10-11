<script lang="ts">
  // components

  /**
   * Welcome to the Editor - this is a mess... but I'm trying to simplify the whole process
   * this version will be removing the multistep tracker designer and replace it with
   * this view only.
   *
   * God speed.
   */

  import NItem from "../../../components/list-item/list-item.svelte";
  import NModal from "../../../components/modal/modal.svelte";
  import NIcon from "../../../components/icon/icon.svelte";
  import NToggle from "../../../components/toggle-switch/toggle-switch.svelte";
  import NInput from "../../../components/input/input.svelte";
  import ColorPicker from "../../../components/color-picker/color-picker.svelte";
  import AutoComplete from "../../../components/auto-complete/auto-complete.svelte";
  import PickerList from "../../../components/picker-list/picker-list.svelte";

  // Utils
  import { createEventDispatcher } from "svelte";
  import NomieUOM from "../../../utils/nomie-uom/nomie-uom";
  import tick from "../../../utils/tick/tick";

  // modules
  import Tracker, { toTag } from "../../../modules/tracker/tracker";
  import type { ITrackerType } from "../../../modules/tracker/tracker";
  import TrackerTypes, { getTypeDetails } from "../../../modules/tracker-types/tracker-types";

  // containers
  import PositivityEditor from "../points-editor.svelte";

  // Stores
  import { Interact } from "../../../store/interact";
  import { TrackerStore } from "../../../store/tracker-store";
  import { Lang } from "../../../store/lang";
  import Text from "../../../components/text/text.svelte";
  import Icon from "../../../components/icon/icon.svelte";
  import Button from "../../../components/button/button.svelte";
  import ListItem from "../../../components/list-item/list-item.svelte";
  import is from "../../../utils/is/is";
  import trackerTypes from "../../../modules/tracker-types/tracker-types";

  const dispatch = createEventDispatcher();

  export let tracker = new Tracker({});
  // export let show = false;

  interface DataConfig {
    groupedUOMs: any;
    types: Array<ITrackerType>;
    editTag: boolean;
    tracker?: Tracker;
  }

  let data: DataConfig = {
    groupedUOMs: NomieUOM.toGroupedArray(),
    types: Object.keys(TrackerTypes).map((id: any) => {
      let type = TrackerTypes[id];
      type.id = id;
      return type;
    }),
    editTag: false,
    tracker: null,
  };

  let lastTracker: string; // tag of the last tracker
  let advanced = false;
  let forcedAdvanced = false;
  let advancedCanToggle = true;
  let tagHardcoded = false;
  let canSave = true;

  // Watch for Tracker Change
  $: if (tracker && lastTracker != tracker.tag) {
    lastTracker = tracker.tag;
    data.tracker = new Tracker(tracker);
  }

  // Watch for Tracker Changed while NOT Forced Advanced
  $: if (tracker && !forcedAdvanced) {
    if (tracker.default || tracker.math !== "sum" || tracker.uom !== "num") {
      advanced = true;
      advancedCanToggle = false;
    } else {
      advancedCanToggle = true;
      advanced = false;
    }
  } else if (forcedAdvanced) {
    advanced = true;
  }

  //Catch if the UPM is timer and not a timer tracker
  $: if (data.tracker.type === "timer") {
    data.tracker.uom = "timer";
    data.tracker.min = null;
    data.tracker.max = null;
  } else if (data.tracker.uom == "timer") {
    data.tracker.uom = "num";
  } else if (data.tracker.type === "range" && isNaN(data.tracker.min)) {
    data.tracker.min = 1;
    data.tracker.max = 10;
  }

  $: if (data.tracker.label && data.tracker._dirty && !tagHardcoded) {
    data.tracker.tag = toTag(data.tracker.label);
  }

  /**
   * Can we save this?
   */

  $: {
    if (data.tracker.label.length > 0 && data.tracker.tag.length > 0) {
      canSave = true;
    } else {
      canSave = false;
    }
  }

  $: if (data.tracker._dirty && data.tracker.label && !data.tracker.emoji) {
    data.tracker.emoji = data.tracker.label.substr(0, 1);
  } else if (data.tracker._dirty && data.tracker.emoji == "⚪") {
    data.tracker.emoji = undefined;
  }

  /**
   * Get the Input for a tracker
   * used in getting defaults
   * but instead of using the defaults we will
   * make ranges use value input instead of the slider.
   */
  const getTrackerInput = async (target) => {
    const response = await Interact.trackerInput(
      {
        label: data.tracker.label || "Value",
        tracker: "value",
        type: data.tracker.type == "range" ? "numeric" : data.tracker.type,
        emoj: data.tracker.emoji || "",
      },
      {
        value: data.tracker.default,
        allowSave: false,
      }
    );
    if (response && response.value) {
      data.tracker[target] = response.value;
    }
  };

  async function duplicate() {
    let duplicated = await TrackerStore.duplicateTracker(data.tracker);
  }

  async function remove() {
    let confirmed = await Interact.confirm(
      Lang.t("general.delete-from-nomie", { thing: tracker.label }),
      Lang.t("tracker.delete-description")
    );
    if (confirmed) {
      await TrackerStore.deleteTracker(tracker);
      methods.cancel();
    }
  }

  const methods = {
    async saveTracker() {
      if (!data.tracker.tag || !data.tracker.label) {
        Interact.alert("Missing Data", "Please fill out all required fields: title, tag and emoji");
      } else {
        try {
          dispatch("save", data.tracker);
          await TrackerStore.saveTracker(data.tracker);
          Interact.toast(`${data.tracker.label} saved`);
          methods.cancel();
        } catch (e) {
          Interact.error(e.message);
        }
      }
    },
    async editTag() {
      let tag: any = await Interact.prompt(
        Lang.t("general.notice", "Notice"),
        Lang.t(
          "tracker.tag-no-change-message",
          "Once a tracker is saved, its tag can no longer be changed (easily). Make sure you like it!"
        ),
        {
          value: data.tracker.tag,
        }
      );
      if (tag) {
        tagHardcoded = true;
        data.tracker.tag = tag;
      }
    },
    selectType() {
      const buttons = Object.keys(trackerTypes).map((typeKey: ITrackerType) => {
        let type = trackerTypes[typeKey];
        return {
          title: `${type.emoji} ${type.label}`,
          description: `${typeKey === data.tracker.type ? "**Active**" : ""} ${type.description}`,
          click() {
            if (data.tracker) {
              data.tracker.type = typeKey;
            }
          },
        };
      });
      Interact.popmenu({
        title: Lang.t("tracker.type", "Tracker Type"),
        buttons,
      });
    },
    async addTrackerToNote() {
      let trackers: any = await Interact.selectTrackers({
        filter: (v: Tracker) => {
          return v.type !== "note";
        },
      });

      if (trackers) {
        let trkString = trackers
          .filter((t) => t)
          .map((tkr) => {
            return `#${tkr.tag}`;
          })
          .join(" ");
        data.tracker.note = `${data.tracker.note || ""} ${trkString}`.trim() + " ";
      }
    },
    labelChanged(event) {
      if (data.tracker._dirty) {
        let tag = event.target.value
          .trim()
          .replace(/[^A-Z0-9]/gi, "_")
          .toLowerCase();
        data.tracker.tag = tag;
      }
    },
    cancel() {
      data.tracker = new Tracker({});
      forcedAdvanced = false;
      dispatch("close");
    },
  };
</script>

<style lang="scss">
  @import "./editor.scss";
  :global(.n-tracker-editor .n-modal) {
    background-color: var(--color-bg) !important;
  }
</style>

{#if $Interact.trackerEditor.show}

  <div class="n-tracker-editor">
    <NModal type="fullscreen" allowClose on:close={methods.cancel} style="z-index:2002">

      <header slot="header" class="n-toolbar-grid">
        <div class="left">
          <Button type="clear" color="primary" on:click={methods.cancel}>Cancel</Button>
        </div>
        <div class="main">{data.tracker._dirty ? 'Create' : 'Edit'} {data.tracker.label.length ? data.tracker.label : ''}</div>
        <div class="right">
          <Button className="save-action" disabled={!canSave} color="primary" type="clear" on:click={methods.saveTracker}>
            {Lang.t('general.save')}
          </Button>
        </div>
      </header>

      <div class="emoji-editor">
        <div class="emoji {data.tracker.emoji ? 'has-emoji' : 'no-emoji'}" style="border:solid 4px {data.tracker.color}">
          <div style="background-color:{data.tracker.color}" class="background" />
          <input
            class="p-0 m-0 emoji"
            type="text"
            on:focus={(evt) => {
              evt.target.select();
            }}
            bind:value={data.tracker.emoji} />
        </div>
        {#if data.tracker.label}
          <Text size="md" center className="mt-2">{data.tracker.label}</Text>
        {/if}
        {#if data.tracker.tag}
          <Text size="sm" center faded className="mt-1">
            #{data.tracker.tag}
            {#if data.tracker._dirty}
              <Button icon inline size="xs" color="clear" on:click={methods.editTag}>
                <Icon name="edit" size="12" />
              </Button>
            {/if}
          </Text>
        {/if}
      </div>

      <!-- Colort Selector -->
      <ColorPicker bind:value={data.tracker.color} className="mb-1 tracker-color" />

      <!-- Tracker Label input -->
      <NInput
        listItem
        className="mb-2 tracker-label"
        type="text"
        name="label"
        placeholder={Lang.t('tracker.label', 'Tracker Label')}
        bind:value={data.tracker.label}
        on:keyup={methods.labelChanged} />

      <!-- Tracker Type Selector -->

      <ListItem on:click={methods.selectType} className="tracker-type py-3 mb-2">
        {Lang.t('tracker.type', 'Tracker Type')}
        <div slot="right" class="n-row">
          <Text bold>{(getTypeDetails(data.tracker.type) || {}).label}</Text>
          <Icon name="chevronDown" className="fill-inverse-2 mr-3 ml-2" size="16" />
        </div>
      </ListItem>

      {#if data.tracker.type == 'picker'}
        <PickerList
          mode="edit"
          canSelect={false}
          bind:tracker={data.tracker}
          className="px-2 tracker-picker"
          itemClass="px-2"
          on:change={(evt) => {}} />
      {/if}

      {#if data.tracker.type == 'tick'}
        <NItem
          title={Lang.t('tracker.save-on-tap')}
          className="tracker-one-tap mb-2"
          description={Lang.t('tracker.save-on-tap-description', 'Save note immediately after tapping the button.')}>
          <div slot="right">
            <NToggle bind:value={data.tracker.one_tap} />
          </div>
        </NItem>
      {/if}

      {#if data.tracker.type == 'range'}
        <ListItem className="py-0 mb-2">
          <div class="n-row">
            <NInput
              pattern="[0-9]*"
              inputmode="numeric"
              className="mr-2 tracker-min"
              style="width:45%;"
              name="min"
              placeholder={Lang.t('tracker.min', 'Min Value')}
              label={Lang.t('tracker.min', 'Min Value')}
              on:focus={(e) => {
                e.detail.target.select();
              }}
              bind:value={data.tracker.min}>
              <div slot="right" class="pr-1">
                <Button
                  icon
                  on:click={() => {
                    getTrackerInput('min');
                  }}>
                  <NIcon name="addOutline" className="fill-inverse-2" />
                </Button>
              </div>

            </NInput>
            <NInput
              pattern="[0-9]*"
              inputmode="numeric"
              className="tracker-max"
              style="width:45%;"
              name="max"
              label={Lang.t('tracker.max', 'Max Value')}
              placeholder={Lang.t('tracker.max', 'Max Value')}
              on:focus={(e) => e.detail.target.select()}
              bind:value={data.tracker.max}>
              <div slot="right" class="pr-1">
                <Button
                  icon
                  on:click={() => {
                    getTrackerInput('max');
                  }}>
                  <NIcon name="addOutline" className="fill-inverse-2" />
                </Button>
              </div>
            </NInput>
          </div>
        </ListItem>
      {/if}

      {#if data.tracker.type == 'note'}
        <NInput
          listItem
          type="textarea"
          className="tracker-note mb-0"
          bind:value={data.tracker.note}
          placeholder={Lang.t('tracker.note-placeholder')}>
          <span slot="right">
            <Button size="sm" icon shape="circle" color="transparent" on:click={methods.addTrackerToNote}>
              <Icon name="addOutline" />
            </Button>
          </span>
        </NInput>
        <AutoComplete
          input={data.tracker.note}
          scroller
          on:select={async (evt) => {
            data.tracker.note = evt.detail.note + '';
          }} />
        <NItem description={Lang.t('tracker.note-description')} className="mt-2" />
      {/if}

      <!-- ADVANCED OPTIONS -->

      {#if advancedCanToggle}
        <Button
          block
          text
          color="clear"
          size="sm"
          className="mt-2 mb-1 advanced-toggler"
          on:click={() => (forcedAdvanced = !forcedAdvanced)}>
          {#if advanced}Hide Advanced Options{:else}Show Advanced Options{/if}
          <Icon name={advanced ? 'chevronUp' : 'chevronDown'} size="12" className="ml-2" />

        </Button>
      {/if}

      {#if advanced}
        <!-- Advanced -->
        {#if data.tracker.type !== 'timer' && data.tracker.type !== 'note' && data.tracker.type !== 'picker'}
          <NInput
            listItem
            placeholder={Lang.t('tracker.measure-by')}
            type="select"
            className="tracker-uom mb-2"
            bind:value={data.tracker.uom}>
            {#each Object.keys(data.groupedUOMs) as groupKey (groupKey)}
              <option disabled>-- {groupKey}</option>
              {#each data.groupedUOMs[groupKey] as uom (`${groupKey}-${uom.key}`)}
                <option value={uom.key} disabled={uom.key == 'time' && data.tracker.type != 'timer'}>{NomieUOM.plural(uom.key)}</option>
              {/each}
            {/each}
          </NInput>
        {/if}
        <!-- End Advanced -->
      {/if}

      {#if data.tracker.type !== 'note' && data.tracker.type !== 'picker' && advanced}
        <NInput
          listItem
          type="select"
          className="tracker-math mb-2"
          name="math"
          placeholder={Lang.t('tracker.calculate-total', 'Calculate Totals')}
          bind:value={data.tracker.math}>
          {#each [{ value: 'sum', label: Lang.t('general.sum', 'Sum') }, { value: 'mean', label: Lang.t('general.avg', 'Average') }] as math_key}
            <option value={math_key.value}>{math_key.label}</option>
          {/each}
        </NInput>

        {#if data.tracker.math !== 'sum'}
          <NItem className="px-3 py-1 mb-2 tracker-ignore-zeros" title="Ignore Zeros" description="Ignore zero values when averaging">
            <div slot="right">
              <NToggle bind:value={data.tracker.ignore_zeros} />
            </div>
          </NItem>
        {/if}
      {/if}

      {#if advanced && ['note', 'picker'].indexOf(data.tracker.type) === -1}
        <NInput
          listItem
          className="tracker-default mb-2"
          pattern="[0-9]*"
          inputmode="numeric"
          label={Lang.t('tracker.value', 'Default Value')}
          placeholder={Lang.t('tracker.default-value', 'Default Value')}
          bind:value={data.tracker.default}>
          <span slot="right">
            {#if data.tracker.default}
              <Text size="xs" className="text-right text-primary-bright">{data.tracker.displayValue(data.tracker.default)}</Text>
            {/if}
          </span>
          <div slot="right" class="pr-1">
            <Button
              icon
              on:click={() => {
                getTrackerInput('default');
              }}>
              <NIcon name="addOutline" className="fill-inverse-2" />
            </Button>
          </div>
        </NInput>
      {/if}

      {#if advanced}
        <PositivityEditor tracker={data.tracker} />
      {/if}

      {#if data.tracker.type !== 'note' && data.tracker.type !== 'picker' && advanced}
        <NInput
          className="tracker-include"
          listItem
          type="textarea"
          rows={2}
          label={Lang.t('tracker.include', 'Additional note inserts')}
          placeholder={Lang.t('tracker.include-placeholder', 'Insert additional #trackers, @people, and +context when using this tracker')}
          bind:value={data.tracker.include} />
        <AutoComplete
          input={data.tracker.include}
          scroller
          on:select={async (evt) => {
            data.tracker.include = evt.detail.note + '';
          }} />
      {/if}

      {#if advanced}
        <NItem bg="transparent" id="hide-all-board" title={Lang.t('tracker.hide-on-all-board', 'Hide on All Board')}>
          <div slot="right">
            <NToggle bind:value={data.tracker.hidden} />
          </div>
        </NItem>
      {/if}

      {#if !data.tracker._dirty}
        <div class="p-4 mt-4" />

        <NItem
          on:click={() => {
            TrackerStore.download(data.tracker);
          }}
          className="bottom-line">
          <div class="text-primary-bright">{Lang.t('general.download', 'Download')} .tkr</div>
          <div slot="right" class="text-faded-2">For Sharing</div>
        </NItem>
        <NItem on:click={duplicate} className="bottom-line">
          <div class="text-primary-bright">{Lang.t('tracker.duplicate-tracker', 'Duplicate Tracker')}</div>
        </NItem>

        <NItem on:click={remove} className="bottom-line">
          <div class="text-red">{Lang.t('tracker.remove-tracker', 'Delete Tracker')}</div>
        </NItem>
      {/if}

      <!-- <button slot="footer" on:click={methods.cancel} class="btn btn-light btn-lg flex-grow mr-1">{Lang.t('general.cancel')}</button>
      <button slot="footer" class="btn btn-primary btn-lg flex-grow ml-1" on:click={methods.saveTracker}>{Lang.t('general.save')}</button> -->
      <div slot="footer" />
    </NModal>

  </div>
{/if}
