<script lang="ts">
  import Input from "./../../components/input/input.svelte";
  import ListItem from "./../../components/list-item/list-item.svelte";
  import { Block, BlockTimeFrame } from "../../modules/dashboard/block";
  import TrackerSmallBlock from "../../components/tracker-ball/tracker-small-block.svelte";
  import Button from "../../components/button/button.svelte";
  import Text from "../../components/text/text.svelte";
  import { Interact } from "../../store/interact";
  import { DashboardStore } from "../../store/dashboard-store";
  import { Lang } from "../../store/lang";

  import { createEventDispatcher, onMount } from "svelte";
  import ToggleSwitch from "../../components/toggle-switch/toggle-switch.svelte";
  import Icon from "../../components/icon/icon.svelte";
  import TinyColorPicker from "../../components/color-picker/tiny-color-picker.svelte";
  import { TrackerStore } from "../../store/tracker-store";
  import TrackerConfig from "../../modules/tracker/tracker";
  import TrackableElement from "../../modules/trackable-element/trackable-element";
  export let value: Block = null;

  let dateType;
  let widget;
  let goalValue;
  let blockTypeId;
  let blockType: IBlockType;
  let conditionalStyling: boolean = false;

  $: if (blockTypeId) {
    blockType = blockTypes.find((blockType) => blockType.id == blockTypeId);

    value.type = blockTypeId;
  }

  /**
   * On Date Type Change
   **/
  $: if (dateType) {
    let timeFrame = timeFrames.find((t) => t.id == dateType);
    value.timeRange = new BlockTimeFrame(timeFrame);
    if (value.timeRange.id == "today" || value.timeRange.id == "yesterday") {
      value.includeAvg = false;
    }
  }

  $: if (conditionalStyling === false) {
    // value.compareValue = undefined;
  }

  const dispatch = createEventDispatcher();
  const timeFrames: Array<any> = [
    {
      id: "today",
      label: "Today",
      start: {
        startOf: "day",
      },
      end: {
        endOf: "day",
      },
    },
    {
      id: "yesterday",
      label: "Yesterday",
      start: {
        subtract: [1, "day"],
        startOf: "day",
      },
      end: {
        subtract: [1, "day"],
        endOf: "day",
      },
    },
    {
      id: "this-week",
      label: "This Week",
      start: {
        startOf: "week",
      },
      end: {
        endOf: "week",
      },
    },
    {
      id: "last-week",
      label: "Last Week",
      start: {
        subtract: [1, "week"],
        startOf: "week",
      },
      end: {
        subtract: [1, "week"],
        endOf: "week",
      },
    },
    {
      id: "this-month",
      label: "This Month",
      start: {
        startOf: "month",
      },
      end: {
        endOf: "month",
      },
    },
    {
      id: "this-year",
      label: "This Year",
      start: {
        startOf: "year",
      },
      end: {
        endOf: "year",
      },
    },
    {
      id: "last-month",
      label: "Last Month",
      start: {
        subtract: [1, "month"],
        startOf: "month",
      },
      end: {
        subtract: [1, "month"],
        endOf: "month",
      },
    },
    {
      id: "last-7",
      label: "Last 7 days",
      start: {
        subtract: [7, "day"],
        startOf: "day",
      },
      end: {
        endOf: "day",
      },
    },
    {
      id: "last-30",
      label: "Last 30 days",
      start: {
        subtract: [30, "day"],
        startOf: "day",
      },
      end: {
        endOf: "day",
      },
    },
    {
      id: "last-90",
      label: "Last 90 days",
      start: {
        subtract: [90, "day"],
        startOf: "day",
      },
      end: {
        endOf: "day",
      },
    },
    {
      id: "last-365",
      label: "Last 365 days",
      start: {
        subtract: [365, "day"],
        startOf: "day",
      },
      end: {
        endOf: "day",
      },
    },
  ];

  type IBlockTypeUnit = "timeframe" | "cond-style" | "element";
  interface IBlockType {
    id: string;
    label: string;
    requires: Array<IBlockTypeUnit>;
    optional: Array<IBlockTypeUnit>;
  }

  const blockTypes: Array<IBlockType> = [
    {
      label: "Bar Chart",
      id: "barchart",
      requires: ["timeframe", "element"],
      optional: [],
    },
    {
      label: "Value/Count",
      id: "value",
      requires: ["timeframe", "element"],
      optional: ["cond-style"],
    },
    // This is not complete
    // {
    //   label: "What Time",
    //   id: "what-time",
    //   requires: ["timeframe", "element"],
    //   optional: [],
    // },
    {
      label: "Positivity Pie Chart",
      id: "positivity",
      requires: ["timeframe", "element"],
      optional: [],
    },
    // {
    //   label: "Streak",
    //   id: "streak",
    //   requires: ["timeframe", "element"],
    //   optional: [],
    // },
    {
      label: "Last Used",
      id: "last-used",
      requires: ["element"],
      optional: ["cond-style"],
    },
    {
      label: "Just Text",
      id: "text",
      requires: [],
      optional: [],
    },
  ];

  async function deleteBlock() {
    let confirmed = await Interact.confirm(`Delete this block?`, "You can always recreate it");
    if (confirmed) {
      try {
        await DashboardStore.deleteBlock(value);
        dispatch("close");
      } catch (e) {
        Interact.alert("Error", e.message);
      }
    }
  }

  function selectType() {
    const generateElementOption = (title, type) => {
      return {
        title,
        async click() {
          let selected = await Interact.select(type);
          if (selected.length) {
            value.element = value.element || { id: null, type: null, obj: null };
            value.element.obj = selected[0];
            value.element.type = type;
            if (type == "tracker") {
              value.element.id = value.element.obj.tag;
            } else if (type == "person") {
              value.element.id = value.element.obj.username;
            } else if (type == "context") {
              value.element.id = selected[0];
            } else {
              console.error("Fit for other types", selected[0]);
            }
            value.element = value.element instanceof TrackableElement ? value.element : new TrackableElement(value.element);
          }
        },
      };
    };
    Interact.popmenu({
      title: "What type of item would you like to add?",
      buttons: [
        generateElementOption("Tracker", "tracker"),
        generateElementOption("Person", "person"),
        generateElementOption("Context", "context"),
      ],
    });
  }

  async function getConditionalValue() {
    let inputTracker;
    if (value.element.type == "tracker") {
      inputTracker = value.element.obj;
    } else {
      inputTracker = new TrackerConfig({ tag: value.element.obj.id, type: "numeric" });
    }
    const tracker = TrackerStore.getByTag();
    const response = await Interact.trackerInput(value.element.obj, { value: value.compareValue, allowSave: false });
    if (response && response.value) {
      value.compareValue = response.value;
    }
  }

  onMount(() => {
    if (value) {
      if (value.timeRange) {
        dateType = value.timeRange.id;
      }
      if (value.compareValue) {
        conditionalStyling = true;
      }
      blockTypeId = value.type;
    }
  });
</script>

<div class="dashblock-editor p-2">

  <Input type="select" placeholder="Widget" bind:value={blockTypeId}>
    <option>Select a Widget</option>
    {#each blockTypes as blockType}
      <option value={blockType.id}>{blockType.label}</option>
    {/each}
  </Input>

  {#if blockType && [...blockType.requires, ...blockType.optional].indexOf('timeframe') > -1}
    <Input placeholder="Timeframe" type="select" bind:value={dateType}>
      <option>Select a Timeframe</option>
      {#each timeFrames as timeFrame}
        <option value={timeFrame.id}>{timeFrame.label}</option>
      {/each}
    </Input>
  {/if}

  {#if blockType && [...blockType.requires, ...blockType.optional].indexOf('element') > -1}
    <ListItem on:click={selectType} title="Trackable Item">
      <div slot="right" class="mr-2">
        {#if value.element}
          <TrackerSmallBlock truncate element={value.element} on:click={selectType} style="max-width:150px" />
        {:else}Select{/if}
      </div>
    </ListItem>
  {/if}

  {#if blockTypeId == 'value' && value.timeRange && ['today', 'yesterday'].indexOf(value.timeRange.id) == -1}
    <ListItem title="Include Average">
      <div slot="right">
        <ToggleSwitch bind:value={value.includeAvg} />
      </div>
    </ListItem>
  {/if}

  {#if blockType && [...blockType.requires, ...blockType.optional].indexOf('cond-style') > -1}
    <div class="conditional-styling n-list {conditionalStyling ? 'solo framed' : ''}">
      <ListItem title="Conditional Colors">
        <div slot="right">
          <ToggleSwitch bind:value={conditionalStyling} />
        </div>
      </ListItem>
      {#if conditionalStyling}
        <ListItem title="Compare Value">
          <div slot="right">
            <Input
              pattern="[0-9]*"
              inputmode="numeric"
              placeholder={blockTypeId == 'value' ? 'Value' : blockTypeId == 'last-used' ? 'Days' : 'Value'}
              style="max-width:140px;"
              bind:value={value.compareValue}>
              <button
                class="btn btn-icon clickable mr-2"
                slot="right"
                on:click={async () => {
                  getConditionalValue();
                }}>
                {#if value.element.type == 'tracker'}
                  <Icon name="addOutline" />
                {/if}
              </button>
            </Input>
          </div>
        </ListItem>
        <ListItem>
          <div class="under" slot="left">
            <div class="text-center">
              <Text className="mb-2" size="sm">Under value color</Text>
              <TinyColorPicker bind:value={value.compareUnderColor} />
            </div>
          </div>
          <div class="over" slot="right">
            <div class="text-center">
              <Text className="mb-2" size="sm">Over value color</Text>
              <TinyColorPicker bind:value={value.compareOverColor} />
            </div>
          </div>
        </ListItem>
      {/if}
    </div>
  {/if}

  {#if blockTypeId == 'text'}
    <Input placeholder="Message" type="text" bind:value={value.description} />
  {/if}

  <!-- {#if blockType && [...blockType.requires, ...blockType.optional].indexOf('goal') > -1}
      <Input placeholder="Goal" type="number" bind:value={value.goal} />
    {/if} -->

  {#if value._editing}
    <ListItem className="text-red" on:click={deleteBlock}>Delete Block</ListItem>
  {/if}
</div>
