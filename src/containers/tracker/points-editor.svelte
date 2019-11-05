<script>
  // Svelte
  import { createEventDispatcher } from "svelte";

  // components
  import NText from "../../components/text/text.svelte";
  import NCell from "../../components/cell/cell.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NPoints from "../../components/points/points.svelte";

  // Modules
  import Tracker from "../../modules/tracker/tracker";
  import PositivityCondition from "../../modules/tracker/positivity-condition";

  // Stores
  import { TrackerStore } from "../../store/trackers";
  import { UserStore } from "../../store/user";

  // Prosp
  export let tracker = undefined;

  // consts
  const dispatch = createEventDispatcher();

  // State
  let state = {
    showConditionForm: false,
    genesisCalc: new PositivityCondition(),
    selectedIndex: -1
  };

  // $: if (tracker && !tracker) {
  //   tracker = new Tracker(tracker);
  //   console.log("The Tracker is set", tracker);
  // }

  const scoreOptions = {
    value: "Recorded Value",
    hour: "Hour of Day (24)",
    month: "Day of Month",
    total: "Today's Total"
  };

  const methods = {
    newCondition() {
      state.showConditionForm = true;
    },
    saveCondition() {
      tracker.score_calc = tracker.score_calc || [];
      tracker.score_calc.push({ ...state.genesisCalc });
    },
    save() {
      TrackerStore.saveTracker(tracker).then(() => {
        dispatch("save", tracker);
      });
    },
    removeCondition(index) {
      tracker.score_calc = tracker.score_calc.filter((row, ind) => {
        return ind !== index;
      });
    }
  };
</script>

<style lang="scss">
  .condition-form {
    background-color: var(--color-solid-1) !important;
    padding: 15px;
    border-radius: 5px;
    overflow: hidden;
    font-weight: 600;
    color: var(--color-inverse);
    border-bottom: solid 1px var(--color-faded-3);
    .form-control {
      display: inline-block;
      width: auto;
      background-color: var(--color-solid) !important;
      margin: 0 6px;
      max-width: 75px;
    }
    .condition-row {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-bottom: 10px;
    }
  }
  :global(.condition-form .n-item) {
    background-color: var(--color-solid-1) !important;
  }
  :global(.condition-form .n-item .right input, .condition-form
      .n-item
      .right
      select) {
    background-color: var(--color-solid) !important;
  }
</style>

{#if tracker}
  <div class="points-editor">
    <div class="n-list mb-0">
      <NItem title="Positivity" className="mb-2">
        <div slot="right">

          <select class="form-control w-100" bind:value={tracker.score}>
            <option value="3">Very Positive</option>
            <option value="2">Somewhat Positive</option>
            <option value="1">Positive</option>
            <option value="" selected={tracker.score === null}>Neutral</option>
            <option value="-1">Negative</option>
            <option value="-2">Somewhat Negative</option>
            <option value="-3">Very Negative</option>
            <option value="custom">Custom...</option>
          </select>
        </div>
      </NItem>

      {#if tracker.score === 'custom'}
        {#each tracker.score_calc || [] as condition, index}
          <NItem>
            <NText size="sm">
              {index === 0 ? 'if:' : 'else if:'}
              {scoreOptions[condition.if] || 'Unknown'} is {condition.is}
              {condition.v}
            </NText>
            <button
              slot="left"
              on:click={() => {
                methods.removeCondition(index);
              }}
              class="btn btn-sm btn-clear btn-icon zmdi zmdi-minus-circle
              text-danger" />
            <span slot="right">
              <NCell gap="true">
                <NPoints points={condition.sc} />
              </NCell>
            </span>
          </NItem>
        {/each}

        {#if state.showConditionForm}
          <div class="condition-form bg-faded">

            <div class="condition-row">
              {#if tracker.score_calc || [].length}else{/if}
              if
              <select class="form-control" bind:value={state.genesisCalc.if}>
                <option value="value">Value</option>
                <option value="hour">Hour</option>
                <option value="month">Day</option>
                <!-- <option value="total">Today's Total</option> -->
              </select>
              is
              <select class="form-control" bind:value={state.genesisCalc.is}>
                <option value="gt">></option>
                <option value="gte">>=</option>
                <option value="lt">&lt;</option>
                <option value="lte">&lt;=</option>
                <option value="eq">==</option>
              </select>
              <input
                pattern="[0-9]*"
                type="text"
                placeholder={state.genesisCalc.if == 'value' ? 'value' : state.genesisCalc.if == 'hour' ? 'Hour of Day' : 'Day of Month'}
                class="form-control"
                bind:value={state.genesisCalc.v} />
            </div>
            <div class="condition-row">
              Set Score to:
              <input
                type="text"
                class="form-control"
                bind:value={state.genesisCalc.sc} />
            </div>

            <div class="n-row pt-3">
              <button
                class="btn btn-clear btn-sm"
                on:click={() => {
                  state.showConditionForm = false;
                }}>
                Cancel
              </button>
              <button
                class="btn btn-primary btn-sm"
                on:click={methods.saveCondition}>
                Set Condition
              </button>
            </div>

          </div>
        {:else}
          <NItem className="item-divider compact" />
          <NItem
            title="Add a Condition..."
            className="text-primary text-center"
            on:click={() => {
              state.showConditionForm = true;
            }} />
          <NItem className="item-divider compact" />
        {/if}
      {/if}
    </div>

  </div>
{/if}
