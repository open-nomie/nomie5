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
    <div class="n-list">
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
              {index === 0 ? 'If:' : 'Else If:'}
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
            <NItem title="IF" className="bg-faded">
              <div slot="right">
                <select
                  class="form-control w-100"
                  bind:value={state.genesisCalc.if}>
                  <option value="value">Recorded Value</option>
                  <option value="hour">Hour of Day (24)</option>
                  <option value="month">Day of Month</option>
                  <!-- <option value="total">Today's Total</option> -->
                </select>
              </div>
            </NItem>
            <NItem title="IS">
              <div slot="right">
                <select
                  class="form-control w-100"
                  bind:value={state.genesisCalc.is}>
                  <option value="gt">Greater Than</option>
                  <option value="gte">Greater or Equal</option>
                  <option value="lt">Less Than</option>
                  <option value="lte">Less or Equal</option>
                  <option value="eq">Equal To</option>
                </select>
              </div>
            </NItem>
            <NItem title="Value">
              <div slot="right">
                <input
                  pattern="[0-9]*"
                  inputmode="numeric"
                  class="form-control"
                  bind:value={state.genesisCalc.v} />
              </div>
            </NItem>
            <NItem title="Score">
              <div slot="right">
                <input
                  pattern="[0-9]*"
                  inputmode="numeric"
                  class="form-control"
                  bind:value={state.genesisCalc.sc} />
              </div>
            </NItem>
            <NItem className="item-divider compact" />
            <NCell>
              <NItem
                title="Done"
                className="text-primary text-center"
                on:click={() => {
                  state.showConditionForm = false;
                }} />
              <NItem
                className="text-primary text-center"
                on:click={methods.saveCondition}>
                <span class="text-primary">Add Condition</span>
              </NItem>
            </NCell>
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
