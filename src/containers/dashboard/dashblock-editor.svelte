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
  export let value: Block = null;

  let dateType;

  $: if (dateType) {
    let timeFrame = timeFrames.find((t) => t.id == dateType);
    console.log("Matched Timeframe", timeFrame);
    value.timeRange = new BlockTimeFrame(timeFrame);
    // console.log("Date Type Change", value.timeRange);
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
    if (value && value.timeRange) {
      dateType = value.timeRange.id;
    }
  });
</script>

<div class="dashblock-editor p-2">
  <ListItem>
    <Button color="clear" block on:click={selectType}>
      {#if value.element}
        <TrackerSmallBlock element={value.element} on:click={selectType} />
      {:else}
        <Text className="text-primary-bright w-100">Select Item</Text>
      {/if}
    </Button>
  </ListItem>
  <Input type="select" placeholder="Display Type" bind:value={value.type}>
    <option value="chart">Chart</option>
    <option value="value">Value</option>
    <option value="positivity">Positivity</option>
  </Input>
  <Input placeholder="Timeframe" type="select" bind:value={dateType}>
    {#each timeFrames as timeFrame}
      <option value={timeFrame.id}>{timeFrame.label}</option>
    {/each}

  </Input>

  {#if value._editing}
    <ListItem className="text-red" on:click={deleteBlock}>Delete Block</ListItem>
  {/if}
</div>
