<script lang="ts">
  import Input from "./../../components/input/input.svelte";
  import ListItem from "./../../components/list-item/list-item.svelte";
  import { Block, BlockTimeFrame } from "../../modules/dashboard/block";
  import TrackerSmallBlock from "../../components/tracker-ball/tracker-small-block.svelte";
  import Button from "../../components/button/button.svelte";
  import Text from "../../components/text/text.svelte";
  import { Interact } from "../../store/interact";
  import { DashboardStore } from "../../store/dashboard-store";
  import { createEventDispatcher, onMount } from "svelte";
  import ToggleSwitch from "../../components/toggle-switch/toggle-switch.svelte";
  export let value: Block = null;

  let dateType;
  let widget;
  let goalValue;
  let blockTypeId;
  let blockType: IBlockType;

  $: if (blockTypeId) {
    blockType = blockTypes.find((blockType) => blockType.id == blockTypeId);
    console.log("Block Type selected", blockType);
    value.type = blockTypeId;
  }

  $: if (dateType) {
    let timeFrame = timeFrames.find((t) => t.id == dateType);
    value.timeRange = new BlockTimeFrame(timeFrame);
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
  ];

  type IBlockTypeUnit = "timeframe" | "goal" | "element";
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
      label: "Value",
      id: "value",
      requires: ["timeframe", "element"],
      optional: ["goal"],
    },
    {
      label: "Positivity Piecart",
      id: "positivity",
      requires: ["timeframe", "element"],
      optional: [],
    },
    {
      label: "Last Used",
      id: "last-used",
      requires: ["element"],
      optional: [],
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

  onMount(() => {
    if (value) {
      if (value.timeRange) {
        dateType = value.timeRange.id;
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

  {#if blockTypeId == 'value' && value.timeRange && ['today', 'yesterday'].indexOf(value.timeRange.id) == -1}
    <ListItem title="Include Average">
      <div slot="right">
        <ToggleSwitch bind:value={value.includeAvg} />
      </div>
    </ListItem>
  {/if}

  {#if blockType && [...blockType.requires, ...blockType.optional].indexOf('element') > -1}
    <ListItem className="px-0">
      <Button color="light" block on:click={selectType}>
        {#if value.element}
          <TrackerSmallBlock element={value.element} on:click={selectType} />
        {:else}Select Trackable Item{/if}
      </Button>
    </ListItem>
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
