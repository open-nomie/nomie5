<script>
  // Svelte
  import { createEventDispatcher } from "svelte";

  // components
  import NText from "../../components/text/text.svelte";
  import NCell from "../../components/cell/cell.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NPoints from "../../components/points/points.svelte";
  import NInput from "../../components/input/input.svelte";

  // Modules
  import Tracker from "../../modules/tracker/tracker";
  import PositivityCondition from "../../modules/tracker/positivity-condition";

  // Stores
  import { TrackerStore } from "../../store/tracker-store";
  import { UserStore } from "../../store/user-store";
  import { Lang } from "../../store/lang";
  import { Interact } from "../../store/interact";

  import dayjs from "dayjs";

  import { Ordinal } from "../../utils/ordinal/ordinal";
  import Button from "../../components/button/button.svelte";

  // Prosp
  export let tracker = undefined;

  // consts
  const dispatch = createEventDispatcher();

  // State
  let state = {
    showConditionForm: false,
    genesisCalc: new PositivityCondition(),
    selectedIndex: -1,
  };

  const getTrackerInput = async () => {
    const response = await Interact.trackerInput(tracker, {
      value: state.genesisCalc.v,
      allowSave: false,
    });
    if (response.value) {
      state.genesisCalc.v = response.value;
    }
  };

  const scoreOptions = {
    value: "Recorded Value",
    hour: "Hour of Day (24)",
    month: "Day of Month",
    total: "Today's Total",
  };

  const methods = {
    change() {
      dispatch("trackerChange", tracker);
    },
    newCondition() {
      state.showConditionForm = true;
      methods.change();
    },
    getDays() {
      let days = [];
      for (let i = 0; i < 31; i++) {
        days.push({
          value: Ordinal(i + 1),
          index: i + 1,
        });
      }
      return days;
    },
    getHours() {
      let hours = [];
      for (let i = 0; i < 24; i++) {
        let date = dayjs().startOf("day").add(i, "hour");

        hours.push({
          value: $UserStore.meta.is24hour ? date.format("HH:mm") : date.format("h:mm a"),
          index: i + 1,
        });
      }
      return hours;
    },
    saveCondition() {
      tracker.score_calc = tracker.score_calc || [];
      tracker.score_calc.push({ ...state.genesisCalc });
      state.showConditionForm = false;
      methods.change();
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
      methods.change();
    },
  };
</script>

<style lang="scss">
  .pos-label {
    font-size: 1.2rem;
    display: none;
    min-width: 70px;
    text-transform: uppercase;
    text-align: center;
  }
</style>

{#if tracker}
  <div class="points-editor">
    <div class="n-list mb-0 bg-transparent">

      <NInput type="select" bind:value={tracker.score} on:change={methods.change} label="Tracker {Lang.t('tracker.positivity')}">
        <option value="0" selected>😐 {Lang.t('tracker.neutral')}</option>
        <option value="1">😊 {Lang.t('tracker.positive')}</option>
        <option value="-1">😩 {Lang.t('tracker.negative')}</option>
        <option value="custom">🛠 {Lang.t('general.customize')}</option>
      </NInput>

      {#if tracker.score === 'custom'}
        <hr class="divider center my-2" />
        {#each tracker.score_calc || [] as condition, index}
          <NItem className="pl-2">
            <NText size="sm">
              {index === 0 ? 'IF:' : 'ELSE:'} {scoreOptions[condition.if] || 'Unknown'} is {condition.is} {condition.v}
            </NText>
            <button
              slot="left"
              on:click={() => {
                methods.removeCondition(index);
              }}
              class="btn btn-sm btn-clear btn-icon text-danger"
              aria-label="Remove Condition">
              <NIcon name="remove" className="fill-red" />
            </button>
            <span slot="right">
              <NCell gap="true">
                <NPoints points={condition.sc} />
              </NCell>
            </span>
          </NItem>
        {/each}

        {#if state.showConditionForm}
          <hr class="divider center my-2" />
          <div class="condition-form mt-2">
            <NInput type="select" bind:value={state.genesisCalc.if} label={tracker.score_calc || [].length == 0 ? 'IF' : 'ELSE'}>
              <option value="value">Tracked Value</option>
              <option value="hour">Hour of Day</option>
              <option value="month">Day of Month</option>
            </NInput>

            <div class="n-row mt-1">

              <NInput type="select" style="width:60%" className="mr-2" bind:value={state.genesisCalc.is} label="IS">
                <option value="gt">Greater</option>
                <option value="gte">Greater or Equal</option>
                <option value="lt">Less</option>
                <option value="lte">Less or Equal</option>
                <option value="eq">Equals</option>
              </NInput>

              {#if state.genesisCalc.if == 'hour'}
                <NInput type="select" placeholder="Than" bind:value={state.genesisCalc.v}>
                  {#each methods.getHours() as hour}
                    <option value={hour.index}>{hour.value}</option>
                  {/each}
                </NInput>
              {:else if state.genesisCalc.if == 'month'}
                <NInput type="select" placeholder="Than" bind:value={state.genesisCalc.v}>
                  {#each methods.getDays() as day}
                    <option value={day.index}>{day.value}</option>
                  {/each}
                </NInput>
              {:else}
                <NInput pattern="[0-9]*" style="width:40%;" type="text" label="Than" bind:value={state.genesisCalc.v}>
                  <button slot="right" class="btn btn-clear tap-icon" on:click={getTrackerInput}>
                    <NIcon name="addOutline" />
                  </button>
                </NInput>
              {/if}

            </div>

            <NInput type="select" label="Set Score To:" bind:value={state.genesisCalc.sc}>
              <option>{Lang.t('general.select', 'Select')}</option>
              <option value="-2">😩 -2</option>
              <option value="-1">😩 -1</option>
              <option value="0">🤷‍♂️ 0</option>
              <option value="1">😊 +1</option>
              <option value="2">😊 +2</option>
            </NInput>

            <NItem className="py-0 px-0 bg-transparent">
              <div slot="left">
                <Button
                  size="sm"
                  color="transparent"
                  on:click={() => {
                    state.showConditionForm = false;
                  }}>
                  {Lang.t('general.cancel', 'Cancel')}
                </Button>
              </div>
              <div slot="right">
                <Button size="md" disabled={!state.genesisCalc.sc} on:click={methods.saveCondition}>{Lang.t('general.add', 'Add')}</Button>
              </div>
            </NItem>
          </div>
        {:else}
          <NItem
            title="Add a Condition..."
            className="text-primary text-center my-1 bg-transparent"
            on:click={() => {
              state.showConditionForm = true;
            }} />
        {/if}
      {/if}
    </div>

  </div>
{/if}
