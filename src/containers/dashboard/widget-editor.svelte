<script lang="ts">
  import Input from "../../components/input/input.svelte";
  import ListItem from "../../components/list-item/list-item.svelte";
  import { Widget, WidgetTimeFrame } from "../../modules/dashboard/widget";
  import TrackerSmallBlock from "../../components/tracker-ball/tracker-small-block.svelte";
  import Button from "../../components/button/button.svelte";
  import Text from "../../components/text/text.svelte";

  import { createEventDispatcher, onMount } from "svelte";
  import ToggleSwitch from "../../components/toggle-switch/toggle-switch.svelte";
  import Icon from "../../components/icon/icon.svelte";
  import TinyColorPicker from "../../components/color-picker/tiny-color-picker.svelte";
  import { TrackerStore } from "../../store/tracker-store";
  import TrackerConfig from "../../modules/tracker/tracker";
  import TrackableElement from "../../modules/trackable-element/trackable-element";
  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import nid from "../../modules/nid/nid";

  import { timeFrames } from "./timeFrames";
  import { widgetTypes } from "./widgetTypes";
  import type { IWidgetType } from "./widgetTypes";

  import { Interact } from "../../store/interact";
  import { DashboardStore } from "../../store/dashboard-store";
  import { Lang } from "../../store/lang";
  import { Dashboard } from "../../modules/dashboard/dashboard";

  export let value: Widget = null;
  const dispatch = createEventDispatcher();

  let dateType;
  let widget;
  let goalValue;
  let widgetTypeId;
  let widgetType: IWidgetType;
  let conditionalStyling: boolean = false;
  let editorView = "options";

  $: if (widgetTypeId) {
    widgetType = widgetTypes.find((widgetType) => widgetType.id == widgetTypeId);
    if (widgetType) {
      value.type = widgetTypeId;
      if ([...widgetType.optional, ...widgetType.requires].indexOf("cond-style") == -1) {
        // Doesn't support conditional styling.. remove that setting
        value.compareValue = undefined;
      }
    }
  }

  /**
   * On Date Type Change
   **/
  $: if (dateType) {
    let timeFrame = timeFrames.find((t) => t.id == dateType);
    value.timeRange = new WidgetTimeFrame(timeFrame);
    if (value.timeRange.id == "today" || value.timeRange.id == "yesterday") {
      value.includeAvg = false;
    }
  }

  let editorButtons = [];

  $: if (value) {
    editorButtons = [
      {
        label: "Configure",
        active: editorView === "options",
        click() {
          changeView("options");
        },
      },
      {
        label: "Style",
        active: editorView === "style",
        click() {
          changeView("style");
        },
      },
      {
        label: "More",
        active: editorView === "more",
        hide: !value.id ? false : true,
        click() {
          changeView("more");
        },
      },
    ];
  }

  function changeView(view) {
    editorView = view;
  }

  async function moveWidget() {
    const buttons = $DashboardStore.dashboards.map((dashboard: Dashboard) => {
      return {
        title: dashboard.label,
        click() {
          try {
            DashboardStore.moveWidget(value, dashboard);
          } catch (e) {
            Interact.alert("Error", e.message);
          }
        },
      };
    });
    Interact.popmenu({
      buttons,
      title: "Which Dashboard?",
    });
  }

  async function duplicateWidget() {
    let baseWidget: Widget = new Widget(value);
    baseWidget.id = nid();
    await DashboardStore.saveWidget(baseWidget);
    dispatch("close");
  }

  async function deleteWidget() {
    let confirmed = await Interact.confirm(`Delete this widget?`, "You can always recreate it");
    if (confirmed) {
      try {
        await DashboardStore.deleteWidget(value);
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
          let selected: any = await Interact.select(type);
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
    // const tracker = TrackerStore.getByTag();
    // was value.element.obj -- wth is this?
    const response = await Interact.trackerInput(inputTracker, { value: value.compareValue, allowSave: false });
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
      widgetTypeId = value.type;
    }
  });
</script>

<style lang="scss">
  .widget-top {
    box-shadow: var(--box-shadow-float);
  }
  .dashwidget-editor {
    flex-grow: 1;
    flex-shrink: 1;
    min-height: 300px;
    background-color: var(--color-bg);
  }
  .widget-views {
    padding: 16px;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }
</style>

<div class="dashwidget-editor">

  <div class="widget-top p-2 bg-solid">
    <Input type="select" placeholder="Widget" bind:value={widgetTypeId}>
      <option>Select a Widget</option>
      {#each widgetTypes as widgetType}
        <option value={widgetType.id}>{widgetType.label}</option>
      {/each}
    </Input>
  </div>

  <div class="widget-views">
    <ButtonGroup className="my-2" size="sm" buttons={editorButtons} />

    {#if editorView == 'options'}
      {#if widgetTypeId == 'text'}
        <ListItem className="p-0" bg="transparent">
          <Input placeholder="Message" type="textarea" rows={2} bind:value={value.description} />
        </ListItem>
      {/if}
      {#if widgetType && [...widgetType.requires, ...widgetType.optional].indexOf('timeframe') > -1}
        <ListItem className="p-0" bg="transparent">
          <Input bind:value={dateType} type="select" label="Timeframe">
            <option>Select</option>
            {#each timeFrames as timeFrame}
              <option value={timeFrame.id}>{timeFrame.label}</option>
            {/each}
          </Input>
        </ListItem>
      {/if}
      {#if widgetType && [...widgetType.requires, ...widgetType.optional].indexOf('element') > -1}
        <ListItem
          bg="transparent"
          clickable
          delay={0}
          className="px-2 trackable-item"
          on:click={selectType}
          title={`${!value.element ? '⚠️ ' : ''}Trackable Item`}>
          <div slot="right">
            {#if value.element}
              <TrackerSmallBlock
                truncate
                element={value.element}
                on:click={selectType}
                className="px-2"
                style="background-color:var(--color-solid); min-height:40px; min-width:100px; max-width:150px;" />
            {:else}
              <Text className="text-primary-bright">Select Tracker</Text>
            {/if}
          </div>
        </ListItem>
      {/if}
      {#if widgetTypeId == 'value' && value.timeRange && ['today', 'yesterday'].indexOf(value.timeRange.id) == -1}
        <ListItem bg="transparent" title="Include Average" className="p-0">
          <div slot="right">
            <ToggleSwitch bind:value={value.includeAvg} />
          </div>
        </ListItem>
      {/if}
    {:else if editorView == 'style'}
      <ListItem bg="transparent" className="p-0">
        <Input type="select" label="Widget Size" bind:value={value.size}>
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </Input>
      </ListItem>
      {#if widgetType && [...widgetType.requires, ...widgetType.optional].indexOf('cond-style') > -1}
        <!-- <div class="conditional-styling n-list {conditionalStyling ? 'solo framed' : ''}"> -->
        <ListItem bg="transparent" title="Conditional Colors" className="p-0">
          <div slot="right">
            <ToggleSwitch bind:value={conditionalStyling} />
          </div>
        </ListItem>
        {#if conditionalStyling}
          <ListItem bg="transparent" title="Compare Value" className="p-0">
            <div slot="right">
              <Input
                pattern="[0-9]*"
                inputmode="numeric"
                placeholder={widgetTypeId == 'value' ? 'Value' : widgetTypeId == 'last-used' ? 'Days' : 'Value'}
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
          <ListItem bg="transparent" className="p-0">
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
        <!-- </div> -->
      {/if}
    {:else if editorView == 'more'}
      {#if value._editing}
        <ListItem bg="transparent" clickable on:click={moveWidget}>
          <div slot="left">
            <Icon name="shuffle" className="fill-primary-bright" />
          </div>
          Move Widget
        </ListItem>
        <ListItem bg="transparent" clickable on:click={duplicateWidget}>
          <div slot="left">
            <Icon name="copy" className="fill-primary-bright" />
          </div>
          Duplicate Widget
        </ListItem>
        <ListItem bg="transparent" clickable on:click={deleteWidget}>
          <div slot="left">
            <Icon name="delete" className="fill-red" />
          </div>
          Delete Widget...
        </ListItem>
      {/if}
    {/if}

    <!-- {#if widgetType && [...widgetType.requires, ...widgetType.optional].indexOf('goal') > -1}
      <Input placeholder="Goal" type="number" bind:value={value.goal} />
    {/if} -->

  </div>
</div>
