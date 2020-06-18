<script>
  // components

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
  import Tracker from "../../../modules/tracker/tracker";
  import TrackerTypes from "../../../modules/tracker-types/tracker-types";

  // containers
  import PointsEditor from "../points-editor.svelte";

  // Stores
  import config from "../../../../config/global";
  import { UserStore } from "../../../store/user";
  import { Interact } from "../../../store/interact";
  import { TrackerStore } from "../../../store/tracker-store";
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
    editTag: false,
    tracker: null
  };

  let lastTracker;
  $: if (tracker && lastTracker != tracker.tag) {
    lastTracker = tracker.tag;
    data.tracker = new Tracker(tracker);
  }

  $: if (data.tracker.type === "timer") {
    data.tracker.uom = "timer";
    data.tracker.min = null;
    data.tracker.max = null;
  } else if (data.tracker.uom == "timer" && data.tracker.type != "timer") {
    data.tracker.uom = "num";
  } else if (data.tracker.type === "range" && isNaN(data.tracker.min)) {
    data.tracker.min = 1;
    data.tracker.max = 10;
  }

  const getTrackerInput = async target => {
    const response = await Interact.trackerInput(data.tracker, {
      value: data.tracker.default,
      allowSave: false
    });
    if (response && response.value) {
      data.tracker[target] = response.value;
    }
  };

  async function duplicate() {
    let duplicated = await TrackerStore.duplicateTracker(data.tracker);
  }

  const methods = {
    tracker_save() {
      if (!data.tracker.tag || !data.tracker.label) {
        Interact.alert(
          "Missing Data",
          "Please fill out all required fields: title, tag and emoji"
        );
      } else {
        dispatch("save", data.tracker);
        TrackerStore.saveTracker(data.tracker).then(() => {});
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
      //   `If you've tracked with this in the past, use "Settings > Find and Replace" to replace #${data.tracker.tag} with your new tag.`
      // ).then(res => {
      //   if (res === true) {
      //     tracker._dirty = true;
      //   }
      // });
    },
    addTrackerToNote() {
      Interact.selectTrackers().then(trackers => {
        if (trackers) {
          data.tracker.note =
            data.tracker.note +
            " " +
            trackers
              .map(tkr => {
                return "#" + tkr.tag;
              })
              .join(" ");
        }
      });
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
      data.tracker = new Tracker();
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
      title="Edit {data.tracker.label.length ? data.tracker.label : 'Tracker'}"
      allowClose
      on:close={methods.cancel}>

      <NItem className="item-divider compact" />
      <ColorPicker bind:value={data.tracker.color} />
      <NItem className="item-divider compact" />
      <NItem>
        <NInput
          type="text"
          name="label"
          placeholder="Tracker Label"
          bind:value={data.tracker.label}
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
          bind:value={data.tracker.emoji}>
          <div slot="left" class="mr-2 ml-2">Emoji</div>

        </NInput>

      </NItem>
      {#if data.tracker._dirty}
        <NItem>
          <NInput
            type="text"
            name="tag"
            placeholder={Lang.t('tracker.tag')}
            bind:value={data.tracker.tag}
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
          bind:value={data.tracker.type}>
          {#each data.types as type}
            <option value={type.id}>{type.label}</option>
          {/each}
        </NInput>
      </NItem>

      {#if data.tracker.type == 'picker'}
        <PickerList bind:list={data.tracker.picks} on:change={evt => {}} />
      {/if}

      {#if data.tracker.type == 'tick'}
        <NItem
          title={Lang.t('tracker.save-on-tap')}
          className="p-3"
          description={Lang.t('tracker.save-on-tap-description', 'Automatically save the value when you tap the button.')}>
          <div slot="right">
            <NToggle bind:value={data.tracker.one_tap} />
          </div>
        </NItem>
      {/if}
      {#if data.tracker.type == 'range'}
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
              bind:value={data.tracker.min}>
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
              bind:value={data.tracker.max}>
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

      {#if data.tracker.type !== 'timer' && data.tracker.type !== 'note' && data.tracker.type !== 'picker'}
        <NItem>
          <NInput
            placeholder={Lang.t('tracker.measure-by')}
            type="select"
            bind:value={data.tracker.uom}
            class="form-control">
            {#each Object.keys(data.groupedUOMs) as groupKey (groupKey)}
              <option disabled>-- {groupKey}</option>
              {#each data.groupedUOMs[groupKey] as uom (`${groupKey}-${uom.key}`)}
                <option
                  value={uom.key}
                  disabled={uom.key == 'time' && data.tracker.type != 'timer'}>
                  {NomieUOM.plural(uom.key)}
                </option>
              {/each}
            {/each}
          </NInput>

        </NItem>
      {/if}
      {#if data.tracker.type !== 'note' && data.tracker.type !== 'picker'}
        <NItem>
          <NInput
            type="select"
            class="form-control"
            name="math"
            placeholder={Lang.t('tracker.calculate-total', 'Calculate Totals using:')}
            bind:value={data.tracker.math}>
            {#each [{ value: 'sum', label: Lang.t('general.sum', 'Sum') }, { value: 'mean', label: Lang.t('general.avg', 'Average') }] as math_key}
              <option value={math_key.value}>{math_key.label}</option>
            {/each}
          </NInput>
        </NItem>
      {:else if data.tracker.type == 'note'}
        <NItem>
          <NInput
            type="textarea"
            bind:value={data.tracker.note}
            placeholder={Lang.t('tracker.note-placeholder')}
            class="form-control w-100 mt-2" />
        </NItem>
        <AutoComplete
          input={data.tracker.note}
          scroller
          on:select={async evt => {
            data.tracker.note = evt.detail.note + '';
          }} />
        <NItem description={Lang.t('tracker.note-description')} />
      {/if}
      <NItem className="item-divider compact" />
      <PointsEditor tracker={data.tracker} />
      <NItem className="item-divider bg-solid compact" />
      {#if data.tracker.type !== 'note' && data.tracker.type !== 'picker'}
        <NItem>
          <NInput
            pattern="[0-9]*"
            inputmode="numeric"
            label={Lang.t('tracker.default-tracker-value', 'Default Tracker Value')}
            placeholder={Lang.t('tracker.default-tracker-value', 'Default Tracker Value')}
            bind:value={data.tracker.default}>
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
        <NItem>
          <NInput
            type="text"
            label={Lang.t('tracker.include', 'Additional trackers or people to include')}
            placeholder={Lang.t('tracker.include-placeholder', 'Include other trackers or people.')}
            bind:value={data.tracker.include} />
          <AutoComplete
            input={data.tracker.include}
            scroller
            on:select={async evt => {
              data.tracker.include = evt.detail.note + '';
            }} />
        </NItem>
        <NItem className="item-divider bg-transparent mb-4">
          <div class="text-sm text-inverse-2">
            Automatically include trackers, people or context when using this
            tracker. Include this trackers value by using #hashtag(*).
          </div>
        </NItem>
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
