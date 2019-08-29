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

  // Stores
  import config from "../../../../config/global";
  import { UserStore } from "../../../store/user";
  import { Interact } from "../../../store/interact";
  import { TrackerStore } from "../../../store/trackers";

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

  $: if (tracker._dirty === true && tracker.label.length) {
    console.log("Tracker is Dirty!", tracker._dirty, tracker);
    data.editTag = true;
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
      Interact.confirm(
        "Change this Tag?",
        `If you've tracked with this in the past, use "Settings > Find and Replace" to replace #${tracker.tag} with your new tag.`
      ).then(res => {
        if (res === true) {
          data.editTag = true;
        }
      });
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
    select {
      min-width: 190px;
      text-align: right;
    }
    .form-control {
      width: 200px;
    }
    .item-divider.compact {
      background-color: var(--color-solid);
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
              class="form-control"
              bind:value={tracker.label}
              on:keyup={methods.labelChanged} />
          </div>
        </NItem>
        <NItem title="Emoji">
          <div slot="right">
            <input
              type="text"
              on:focus={event => {
                event.target.select();
              }}
              class="form-control text-center"
              bind:value={tracker.emoji} />
          </div>
        </NItem>
        {#if data.editTag}
          <NItem title="Tag">

            <div slot="right">
              <input
                type="text"
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
          <NItem title="Tag" on:click={methods.editTag}>
            <div slot="right">
              {tracker.tag}
              <button class="btn-link">Edit</button>
            </div>
          </NItem>
        {/if}
        <NItem className="item-divider compact" />
        <NItem title="Type">
          <div slot="right">
            <select class="form-control w-100" bind:value={tracker.type}>
              {#each data.types as type}
                <option value={type.id}>{type.label}</option>
              {/each}
            </select>
          </div>

        </NItem>
        {#if tracker.type == 'tick'}
          <NItem title="Save On Tap">
            <div slot="right">
              <NToggle bind:value={tracker.one_tap} />
            </div>
          </NItem>
        {/if}
        {#if tracker.type == 'range'}
          <NItem title="Min / Max">
            <div slot="right" class="">
              <div class="n-row">
                <input
                  type="number"
                  class="form-control mr-2"
                  style="width:90px;"
                  placeholder="Min"
                  on:focus={e => {
                    console.log('E Focused', e.target);
                    e.target.select();
                  }}
                  bind:value={tracker.min} />
                <input
                  type="number"
                  class="form-control"
                  style="width:90px;"
                  placeholder="Max"
                  on:focus={e => e.target.select()}
                  bind:value={tracker.max} />
              </div>
            </div>
          </NItem>
        {/if}
        <NItem className="item-divider compact" />

        {#if tracker.type !== 'timer' && tracker.type !== 'note'}
          <NItem>
            <div class="title truncate">Measure By</div>
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
          <NItem title="Calculate">
            <div slot="right">
              <select class="form-control" bind:value={tracker.math}>
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
              placeholder="#any #tracker #hashtags"
              class="form-control my-2 w-100" />
            <!-- <button
            slot="right"
            class="btn btn-clear btn-sm btn-icon zmdi zmdi-plus"
            on:click={methods.addTrackerToNote} /> -->
          </NItem>
        {/if}
        <NItem className="item-divider compact" />
        <NItem title="Default Value">
          <div slot="right">
            <input
              type="number"
              class="form-control"
              bind:value={tracker.default} />
          </div>
        </NItem>
      </div>

      <button
        slot="footer"
        on:click={methods.cancel}
        class="btn btn-light btn-lg flex-grow mr-1">
        Cancel
      </button>
      <button
        slot="footer"
        class="btn btn-primary btn-lg flex-grow ml-1"
        on:click={methods.tracker_save}>
        Save
      </button>
    </NModal>
  </div>
{/if}
