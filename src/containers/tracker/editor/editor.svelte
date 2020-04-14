<script>
  // components

  import NItem from "../../../components/list-item/list-item.svelte";
  import NModal from "../../../components/modal/modal.svelte";
  import NIcon from "../../../components/icon/icon.svelte";
  import NToggle from "../../../components/toggle-switch/toggle-switch.svelte";
  import NInput from "../../../components/input/input.svelte";
  import ColorPicker from "../../../components/color-picker/color-picker.svelte";
  import AutoComplete from "../../../components/auto-complete/auto-complete.svelte";

  // Utils
  import { createEventDispatcher } from "svelte";
  import NomieUOM from "../../../utils/nomie-uom/nomie-uom";
  import tick from "../../../utils/tick/tick";

  // modules
  import Tracker from "../../../modules/tracker/tracker";
  import TrackerTypes from "../../../modules/tracker-types/tracker-types";

  // containers
  import PointsEditor from "../points-editor.svelte";

  // Stores
  import config from "../../../../config/global";
  import { UserStore } from "../../../store/user";
  import { Interact } from "../../../store/interact";
  import { TrackerStore } from "../../../store/trackers";
  import { Lang } from "../../../store/lang";

  const dispatch = createEventDispatcher();

  export let tracker = new Tracker();
  // export let show = false;

  let data = {
    groupedUOMs: NomieUOM.toGroupedArray(),
    types: Object.keys(TrackerTypes).map(id => {
      let type = TrackerTypes[id];
      type.id = id;
      return type;
    }),
    editTag: false
  };

  $: if (tracker.type === "timer") {
    tracker.uom = "timer";
    tracker.min = null;
    tracker.max = null;
  } else if (tracker.uom == "timer" && tracker.type != "timer") {
    tracker.uom = "num";
  } else if (tracker.type === "range" && isNaN(tracker.min)) {
    tracker.min = 1;
    tracker.max = 10;
  }

  const getTrackerInput = async target => {
    const response = await Interact.trackerInput(tracker, {
      value: tracker.default,
      allowSave: false
    });
    if (response && response.value) {
      tracker[target] = response.value;
    }
  };

  async function duplicate() {
    let duplicated = await TrackerStore.duplicateTracker(tracker);
    console.log("Duplicated", duplicated);
  }

  const methods = {
    tracker_save() {
      if (!tracker.tag || !tracker.label) {
        Interact.alert(
          "Missing Data",
          "Please fill out all required fields: title, tag and emoji"
        );
      } else {
        dispatch("save", tracker);
        TrackerStore.saveTracker(tracker).then(() => {});
      }
    },
    editTag() {
      Interact.alert(
        "Not Supported",
        `Editing Tags is currently not supported. Your best option is to Export your data, and do a search/replace for the tag.`
      );

      // TODO: Make edit tag work. It when saving the tracker we need to know it's original tag and replace it in the TrackerStore. Right not it just adds a new one since the tag is the key.
      // Interact.confirm(
      //   "Change this Tag?",
      //   `If you've tracked with this in the past, use "Settings > Find and Replace" to replace #${tracker.tag} with your new tag.`
      // ).then(res => {
      //   if (res === true) {
      //     tracker._dirty = true;
      //   }
      // });
    },
    addTrackerToNote() {
      Interact.selectTrackers().then(trackers => {
        if (trackers) {
          tracker.note =
            tracker.note +
            " " +
            trackers
              .map(tracker => {
                return "#" + tracker.tag;
              })
              .join(" ");
        }
      });
    },
    labelChanged(event) {
      if (tracker._dirty) {
        let tag = event.target.value
          .trim()
          .replace(/[^A-Z0-9]/gi, "_")
          .toLowerCase();
        tracker.tag = tag;
      }
    },
    cancel() {
      tracker = new Tracker();
      dispatch("close");
    }
  };
</script>

<style lang="scss">
  .n-tracker-editor {
    .item-divider.compact {
      background-color: var(--color-solid);
    }
  }
</style>

{#if $Interact.trackerEditor.show}

  <div class="n-tracker-editor">
    <NModal
      type="fullscreen"
      title="Edit {tracker.label.length ? tracker.label : 'Tracker'}"
      allowClose
      on:close={methods.cancel}>

      <NItem className="item-divider compact" />
      <ColorPicker bind:value={tracker.color} />
      <NItem className="item-divider compact" />
      <NItem>
        <NInput
          type="text"
          name="label"
          placeholder="Tracker Label"
          bind:value={tracker.label}
          on:keyup={methods.labelChanged} />
      </NItem>
      <NItem>
        <NInput
          solo
          type="text"
          name="emoji"
          on:focus={event => {
            event.detail.target.select();
          }}
          inputClass="text-lg"
          class="form-control text-center"
          bind:value={tracker.emoji}>
          <div slot="left" class="mr-2 ml-2">Emoji</div>

        </NInput>

      </NItem>
      {#if tracker._dirty}
        <NItem>
          <NInput
            type="text"
            name="tag"
            placeholder={Lang.t('tracker.tag')}
            bind:value={tracker.tag}
            autocomplete="off"
            autocorrect="off"
            maxlength="10"
            autocapitalize="off"
            spellcheck="false" />
        </NItem>
      {/if}

      <NItem>
        <NInput
          type="select"
          name="type"
          placeholder={Lang.t('tracker.type')}
          bind:value={tracker.type}>
          {#each data.types as type}
            <option value={type.id}>{type.label}</option>
          {/each}
        </NInput>
      </NItem>

      {#if tracker.type == 'tick'}
        <NItem
          title={Lang.t('tracker.save-on-tap')}
          className="p-3"
          description={Lang.t('tracker.save-on-tap-description', 'Automatically save the value when you tap the button.')}>
          <div slot="right">
            <NToggle bind:value={tracker.one_tap} />
          </div>
        </NItem>
      {/if}
      {#if tracker.type == 'range'}
        <NItem>
          <div class="n-row">
            <NInput
              pattern="[0-9]*"
              inputmode="numeric"
              className="mr-2"
              style="width:45%;"
              name="min"
              placeholder={Lang.t('tracker.min', 'Min value in range')}
              on:focus={e => {
                e.detail.target.select();
              }}
              bind:value={tracker.min}>
              <button
                class="btn btn-icon clickable mr-2"
                slot="right"
                on:click={() => {
                  getTrackerInput('min');
                }}>
                <NIcon name="addOutline" />
              </button>
            </NInput>
            <NInput
              pattern="[0-9]*"
              inputmode="numeric"
              className=""
              style="width:45%;"
              name="max"
              placeholder={Lang.t('tracker.max', 'Max value in range')}
              on:focus={e => e.detail.target.select()}
              bind:value={tracker.max}>
              <button
                class="btn btn-icon clickable mr-2"
                slot="right"
                on:click={() => {
                  getTrackerInput('max');
                }}>
                <NIcon name="addOutline" />
              </button>
            </NInput>
          </div>
        </NItem>
      {/if}
      <NItem className="item-divider compact" />

      {#if tracker.type !== 'timer' && tracker.type !== 'note'}
        <NItem>
          <NInput
            placeholder={Lang.t('tracker.measure-by')}
            type="select"
            bind:value={tracker.uom}
            class="form-control">
            {#each Object.keys(data.groupedUOMs) as groupKey (groupKey)}
              <option disabled>-- {groupKey}</option>
              {#each data.groupedUOMs[groupKey] as uom (`${groupKey}-${uom.key}`)}
                <option
                  value={uom.key}
                  disabled={uom.key == 'time' && tracker.type != 'timer'}>
                  {NomieUOM.plural(uom.key)}
                </option>
              {/each}
            {/each}
          </NInput>

        </NItem>
      {/if}
      {#if tracker.type !== 'note'}
        <NItem>
          <NInput
            type="select"
            class="form-control"
            name="math"
            placeholder={Lang.t('tracker.calculate-total', 'Calculate Totals using:')}
            bind:value={tracker.math}>
            {#each ['sum', 'avg'] as math_key}
              <option value={math_key}>{math_key}</option>
            {/each}
          </NInput>
        </NItem>
      {:else}
        <NItem>
          <NInput
            type="textarea"
            bind:value={tracker.note}
            placeholder={Lang.t('tracker.note-placeholder')}
            class="form-control w-100 mt-2" />
        </NItem>
        <AutoComplete
          input={tracker.note}
          scroller
          on:select={async evt => {
            tracker.note = evt.detail.note + '';
          }} />
        <NItem description={Lang.t('tracker.note-description')} />
      {/if}
      <NItem className="item-divider compact" />
      <PointsEditor {tracker} />
      <NItem className="item-divider bg-solid compact" />
      {#if tracker.type !== 'note'}
        <NItem>
          <NInput
            pattern="[0-9]*"
            inputmode="numeric"
            label="Default Tracker Value"
            placeholder="Default Tracker Value"
            bind:value={tracker.default}>
            <button
              class="btn btn-icon clickable mr-2"
              slot="right"
              on:click={() => {
                getTrackerInput('default');
              }}>
              <NIcon name="addOutline" />
            </button>
          </NInput>
        </NItem>
        <NItem className="item-divider bg-solid compact" />
      {/if}

      <NItem on:click={duplicate}>
        <div class="text-sm text-center text-primary-bright">
          Duplicate Tracker
        </div>
      </NItem>

      <button
        slot="footer"
        on:click={methods.cancel}
        class="btn btn-light btn-lg flex-grow mr-1">
        {Lang.t('general.cancel')}
      </button>
      <button
        slot="footer"
        class="btn btn-primary btn-lg flex-grow ml-1"
        on:click={methods.tracker_save}>
        {Lang.t('general.save')}
      </button>
    </NModal>
  </div>
{/if}
