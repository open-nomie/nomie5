<script>
  // components

  import NItem from "../../../components/list-item/list-item.svelte";
  import NModal from "../../../components/modal/modal.svelte";
  import NToggle from "../../../components/toggle-switch/toggle-switch.svelte";
  import ColorPicker from "../../../components/color-picker/color-picker.svelte";

  // Utils
  import { createEventDispatcher } from "svelte";
  import NomieUOM from "../../../utils/nomie-uom/nomie-uom";

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
  export let show = false;

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
        let tag = event.target.value.replace(/[^A-Z0-9]/gi, "_").toLowerCase();
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
    textarea.form-control {
      font-size: 16px;
    }
  }
</style>

{#if $Interact.trackerEditor.show}

  <div class="n-tracker-editor">
    <NModal
      title="Edit {tracker.label.length ? tracker.label : 'Tracker'}"
      allowClose>
      <div class="bg-faded">
        <NItem className="item-divider compact" />
        <ColorPicker bind:value={tracker.color} />
        <NItem className="item-divider compact" />
        <NItem title="Label">
          <div slot="right">
            <input
              type="text"
              name="label"
              class="form-control"
              bind:value={tracker.label}
              on:keyup={methods.labelChanged} />
          </div>
        </NItem>
        <NItem title="Emoji">
          <div slot="right">
            <input
              type="text"
              name="emoji"
              on:focus={event => {
                event.target.select();
              }}
              class="form-control text-center"
              bind:value={tracker.emoji} />
          </div>
        </NItem>
        {#if tracker._dirty}
          <NItem title={Lang.t('tracker.tag')}>
            <div slot="right">
              <input
                type="text"
                name="tag"
                class="form-control"
                bind:value={tracker.tag}
                autocomplete="off"
                autocorrect="off"
                maxlength="10"
                autocapitalize="off"
                spellcheck="false" />
            </div>
          </NItem>
        {:else}
          <NItem title={Lang.t('tracker.tag')} on:click={methods.editTag}>
            <div slot="right">
              <div class="n-row">
                {tracker.tag}
                <button class="btn-link btn" on:click={methods.editTag}>
                  {Lang.t('general.edit')}
                </button>
              </div>
            </div>
          </NItem>
        {/if}
        <NItem className="item-divider compact" />
        <NItem title={Lang.t('tracker.type')}>
          <div slot="right">
            <select
              class="form-control w-100"
              name="type"
              bind:value={tracker.type}>
              {#each data.types as type}
                <option value={type.id}>{type.label}</option>
              {/each}
            </select>
          </div>

        </NItem>
        {#if tracker.type == 'tick'}
          <NItem title={Lang.t('tracker.save-on-tap')}>
            <div slot="right">
              <NToggle bind:value={tracker.one_tap} />
            </div>
          </NItem>
        {/if}
        {#if tracker.type == 'range'}
          <NItem title={Lang.t('tracker.min-max')}>
            <div slot="right" class="">
              <div class="n-row">
                <input
                  pattern="[0-9]*"
                  inputmode="numeric"
                  class="form-control mr-2"
                  style="width:90px;"
                  name="min"
                  placeholder={Lang.t('general.min')}
                  on:focus={e => {
                    e.target.select();
                  }}
                  bind:value={tracker.min} />
                <input
                  pattern="[0-9]*"
                  inputmode="numeric"
                  class="form-control"
                  style="width:90px;"
                  name="max"
                  placeholder={Lang.t('general.max')}
                  on:focus={e => e.target.select()}
                  bind:value={tracker.max} />
              </div>
            </div>
          </NItem>
        {/if}
        <NItem className="item-divider compact" />

        {#if tracker.type !== 'timer' && tracker.type !== 'note'}
          <NItem>
            <div class="title truncate">{Lang.t('tracker.measure-by')}</div>
            <div slot="right">
              <select bind:value={tracker.uom} class="form-control">
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
              </select>
            </div>
          </NItem>
        {/if}
        {#if tracker.type !== 'note'}
          <NItem title={Lang.t('tracker.calculate')}>
            <div slot="right">
              <select
                class="form-control"
                name="math"
                bind:value={tracker.math}>
                {#each ['sum', 'avg'] as math_key}
                  <option value={math_key}>{math_key}</option>
                {/each}
              </select>
            </div>
          </NItem>
        {:else}
          <NItem>
            <textarea
              bind:value={tracker.note}
              placeholder={Lang.t('tracker.note-placeholder')}
              class="form-control w-100" />
            <!-- <button
            slot="right"
            class="btn btn-clear btn-sm btn-icon zmdi zmdi-plus"
            on:click={methods.addTrackerToNote} /> -->
          </NItem>
          <NItem description={Lang.t('tracker.note-description')} />
        {/if}
        <NItem className="item-divider compact" />
        <PointsEditor {tracker} />
        <NItem className="item-divider bg-solid compact" />
        <NItem title={Lang.t('tracker.default')}>
          <div slot="right">
            <input
              pattern="[0-9]*"
              inputmode="numeric"
              class="form-control"
              bind:value={tracker.default} />
          </div>
        </NItem>
        <NItem className="item-divider bg-solid compact" />
      </div>

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
