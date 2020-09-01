<script lang="ts">
  //Vendors
  import { navigate, Router, Route } from "svelte-routing";

  import { onMount } from "svelte";
  import { UserStore } from "../store/user-store";
  import CSVRImport from "../modules/csvr/csvr-import";
  import type { IImportConfig } from "../modules/csvr/csvr-import";
  import Layout from "../containers/layout/layout.svelte";
  import BackButton from "../components/back-button/back-button.svelte";
  import ListItem from "../components/list-item/list-item.svelte";
  import FileUploader from "../components/file-uploader/file-uploader.svelte";
  import Input from "../components/input/input.svelte";
  import { Lang } from "../store/lang";
  import Icon from "../components/icon/icon.svelte";
  import Button from "../components/button/button.svelte";
  import Text from "../components/text/text.svelte";
  import { truncateText } from "../utils/text/text";
  import tick from "../utils/tick/tick";
  import is from "../utils/is/is";
  import { Interact } from "../store/interact";

  import ListItemLog from "../components/list-item-log/list-item-log.svelte";
  import NextPrevCal from "../components/next-prev-cal/next-prev-cal.svelte";
  import type NLog from "../modules/nomie-log/nomie-log";
  import Alertbox from "../components/alertbox/alertbox.svelte";
  import Importer from "../modules/import/import";
  import ImportLoader from "../modules/import/import-loader";
  import ToggleSwitch from "../components/toggle-switch/toggle-switch.svelte";

  let stepId: string = "home";
  let templates: Array<IImportConfig> = [];
  let activeImporter: CSVRImport;
  let activeMapIndex;
  let previewIndex = 0;
  let previewRow: Array<any>;
  let refreshing = false;
  let previewLog: NLog;
  let listMode = "list";
  let expandFields = false;

  $: if (activeImporter && activeImporter.parsed && activeImporter.parsed.data) {
    if (activeImporter.length() > 1 && previewIndex == 0) {
      previewIndex = 1;
    }
    previewRow = activeImporter.parsed.data[previewIndex];
    previewLog = activeImporter.toLog(previewRow);
  }

  async function nextPreview() {
    let current = previewIndex + 0;
    previewIndex == undefined;
    if (current < activeImporter.length() - 1) {
      previewIndex = current + 1;
    } else {
      previewIndex = 0;
    }
  }
  async function previousPreview() {
    let current = previewIndex + 0;
    previewIndex == undefined;
    if (current !== 0) {
      previewIndex = current - 1;
    } else {
      previewIndex = activeImporter.length() - 1;
    }
  }

  let views = [
    {
      title: "Import CSV",
      id: "home",
    },
    {
      title: "Compose Note",
      id: "note",
    },
    {
      title: "Template",
      id: "template",
    },
  ];

  $: view = views.find((v) => v.id == stepId);

  function setFieldMap(name: string, index) {
    console.log("Set Field Map", name, index);
    activeImporter.config.fieldMap[name] = activeMapIndex;
    refresh();
  }

  const fieldMapButtons = [
    {
      title: "End Time",
      required: true,
      id: "end",
      click() {
        setFieldMap("end", activeMapIndex);
      },
    },
    {
      title: "Start Time",
      id: "start",
      click() {
        setFieldMap("start", activeMapIndex);
      },
    },
    {
      title: "Latitude",
      id: "lat",
      click() {
        setFieldMap("lat", activeMapIndex);
      },
    },
    {
      title: "Longitude",
      id: "lng",
      click() {
        setFieldMap("lng", activeMapIndex);
      },
    },
    {
      title: "Location Name",
      id: "location",
      click() {
        setFieldMap("location", activeMapIndex);
      },
    },
    {
      title: "Source",
      id: "source",
      click() {
        setFieldMap("source", activeMapIndex);
      },
    },
  ];

  function mapField(fieldIndex) {
    console.log("Field Map", fieldIndex);
    activeMapIndex = fieldIndex;
    Interact.popmenu({
      title: `Map ${activeImporter ? activeImporter.getHeaders()[fieldIndex] : "Unknown"}`,
      buttons: fieldMapButtons,
    });
  }

  function refresh() {
    console.log("Refresh");
    refreshing = true;
    tick(100, () => {
      refreshing = false;
    });
  }

  function getIndexMap(index) {
    let response = null;
    if (activeImporter && activeImporter.config && activeImporter.config.fieldMap) {
      response = Object.keys(activeImporter.config.fieldMap).find((key) => {
        return activeImporter.config.fieldMap[key] == index;
      });
    }
    return response;
  }

  async function startImport() {
    let confirmed = await Interact.confirm(
      `Import ${activeImporter.length()} new notes into Nomie?`,
      `If you haven't backed up in a while, now would be a good time to do that.`
    );
    if (confirmed) {
      let importer = new ImportLoader();
      await importer.logs(activeImporter.toLogs()).importLogs((status: any) => {
        Interact.toast(status.message, { perm: true });
      });
      console.log("Done Importing");
      Interact.toast(`Import complete`, { perm: false });
    }
  }

  function back() {
    if (view && view.id == "note") {
      stepId = "home";
    } else if (view && view.id == "template") {
      activeImporter = undefined;
      previewIndex = undefined;
      stepId = "home";
    } else {
      navigate("/settings");
    }
  }

  async function addToImporter(evt) {
    let file = evt.detail;
    if (file.data) {
      activeImporter = activeImporter || new CSVRImport({});
      activeImporter.csv(file.data);
      activeImporter.setName(file.file.name);
    }
    return true;
  }

  async function insertField() {
    let selectedField: any = await _selectField(`Select a field to Insert into the note`);
    if (selectedField) {
      activeImporter.config.template = `${activeImporter.config.template || ""}{f${selectedField.index}}`.trim();
    }
  }

  function _selectField(title: string) {
    return new Promise((resolve, reject) => {
      let buttons = activeImporter.getHeaders().map((header, index) => {
        return {
          title: `${header}`,
          description: `f${index}: ${truncateText(previewRow[index], 60)}`,
          click() {
            resolve({ header, index });
          },
        };
      });
      Interact.popmenu({
        title: title,
        description: `Which field maps to ${title}?`,
        buttons,
      });
    });
  }

  async function selectField(logField: any) {
    let selectedField: any = await _selectField(`${logField.title}`);
    if (is.truthy(selectedField)) {
      activeImporter.config.fieldMap[logField.id] = selectedField.index;
    }
  }

  async function openTemplate(config: IImportConfig) {
    activeImporter = new CSVRImport(config);
    console.log("Open Template", config, activeImporter);
    stepId = "template";
  }

  async function edit() {
    stepId = "note";
  }

  async function remove(config: IImportConfig) {
    let confirmed = await Interact.confirm(`Remove ${config.name} Importer?`, "You can always remake it");
    if (confirmed) {
      templates = templates.filter((template) => {
        return template.id !== config.id;
      });
      await UserStore.mstore("csv_templates", templates);
      Interact.toast(`Import template removed`);
    }
  }

  async function save() {
    try {
      console.log("save", activeImporter);
      let found = null;
      templates = templates.map((template: IImportConfig) => {
        let isMatch = template.id == activeImporter.config.id;
        if (isMatch) {
          found = true;
        }
        return isMatch ? activeImporter.config : template;
      });
      if (!found) {
        templates.push(activeImporter.config);
      }
      await UserStore.mstore("csv_templates", templates);
      Interact.toast(`Import template saved`);
    } catch (e) {
      Interact.error(e.message);
    }

    return templates;
  }

  async function main() {
    let savedImports = await UserStore.mstore("csv_templates");
    console.log("Saved Imports?", savedImports);
    templates = savedImports || [];
  }
  onMount(main);
</script>

<Layout className="import">
  <div class="n-toolbar-grid container" slot="header">
    <div class="left">
      <Button shape="circle" color="transparent" on:click={back}>
        <Icon name="arrowBack" />
      </Button>
    </div>
    <div class="title main">Import CSV</div>
    <div class="right">
      {#if view && view.id == 'note'}
        <Button color="clear" on:click={save}>Save</Button>
      {:else if view && view.id == 'template'}
        <Button color="clear" on:click={edit}>Edit</Button>
      {/if}
    </div>
  </div>
  <main slot="content" class="page page-csv-import flex-column">
    {#if activeImporter && activeImporter.name}
      <ListItem bg="light">
        <Text size="sm" bold>{truncateText(activeImporter.name, 26, 5)}</Text>
        <Text faded size="sm">Records: {activeImporter.length()}, Columns: {activeImporter.parsed.data[0].length}</Text>
      </ListItem>
    {/if}
    {#if view && view.id == 'home'}
      <div class="container p-0 import-csv-home">

        <ListItem itemDivider compact bg="transparent">Create an Importer</ListItem>
        <ListItem>
          <FileUploader
            accept="csv"
            placeholder="Select CSV"
            on:file={async (evt) => {
              await addToImporter(evt);
              stepId = 'note';
            }} />
        </ListItem>
        <ListItem bg="transparent">
          <Text size="sm" faded>Select any CSV to begin. You can then map the apporpirate fields</Text>
        </ListItem>

        <ListItem itemDivider compact className="bg-transparent">
          Import Templates
          <div slot="right">
            {#if listMode != 'edit'}
              <Button
                color="transparent"
                size="sm"
                on:click={() => {
                  listMode = 'edit';
                }}>
                {Lang.t('general.edit', 'Edit')}
              </Button>
            {:else}
              <Button
                size="sm"
                color="transparent"
                className="text-red"
                on:click={() => {
                  listMode = 'list';
                }}>
                {Lang.t('general.done', 'Done')}
              </Button>
            {/if}
          </div>

        </ListItem>

        {#each templates as template}
          <ListItem
            clickable={listMode == 'list'}
            on:click={() => {
              if (listMode == 'list') {
                openTemplate(template);
              }
            }}>
            <Text bold>{template.name}</Text>
            <Text size="sm" faded>{template.template}{Object.keys(template.fieldMap)}</Text>
            <div slot="right">
              {#if listMode == 'edit'}
                <Button
                  size="sm"
                  color="danger"
                  on:click={(evt) => {
                    remove(template);
                  }}>
                  Delete
                </Button>
              {/if}
            </div>
          </ListItem>
        {/each}
        {#if templates.length == 0}
          <ListItem>No Saved Templates</ListItem>
        {/if}

        <hr class="divider center my-3" />

      </div>
    {:else if view && view.id == 'note' && activeImporter}
      <!-- 
      Template Editor

    -->
      <div class="container p-0 import-csv-note">
        <ListItem bottomLine>
          <Input type="text" bind:value={activeImporter.config.name} placeholder="Importer Name" />
        </ListItem>
        <ListItem bottomLine title="Header Row?">
          <div slot="right">
            <ToggleSwitch bind:value={activeImporter.config.hasHeaders} />
          </div>
        </ListItem>

        {#if !activeImporter.parsed}
          <FileUploader
            accept="csv"
            label="Select CSV to Start"
            on:file={async (evt) => {
              await addToImporter(evt);
            }} />
        {:else}
          <div class="n-toolbar-grid">
            <div class="main">Map Fields</div>
            <!-- <div class="right">
              <NextPrevCal style="max-width:60px;" hideCal={true} on:next={nextPreview} on:previous={previousPreview} />
            </div> -->
          </div>
          {#each fieldMapButtons as logField}
            <ListItem title={logField.title}>
              {#if is.truthy(activeImporter.config.fieldMap[logField.id])}
                <Text size="sm" faded>{previewRow[activeImporter.config.fieldMap[logField.id]]}</Text>
              {/if}
              <div slot="right">
                <Button
                  color="transparent"
                  className="text-primary-bright"
                  on:click={() => {
                    selectField(logField);
                  }}>
                  {#if is.truthy(activeImporter.config.fieldMap[logField.id])}
                    f{activeImporter.config.fieldMap[logField.id]}
                  {:else}Select{/if}
                  <Icon name="chevronDown" size="14" className="fill-primary-bright" />
                </Button>
              </div>
            </ListItem>
          {/each}
          <ListItem>
            <Input
              type="textarea"
              placeholder={Lang.t('csv-import-compose-note', 'Compose a note for this CSV data')}
              rows={3}
              bind:value={activeImporter.config.template}>
              <div slot="right">
                <Button shape="circle" color="transparent" on:click={insertField}>
                  <Icon name="addOutline" />
                </Button>
              </div>
            </Input>
          </ListItem>
          {#if expandFields}
            {#each activeImporter.getHeaders() as header, index}
              <ListItem compact className="py-1">
                <div slot="left">
                  <Text size="xs" bold>f{index}</Text>
                </div>
                <Text size="sm">{header}</Text>
                {#if previewRow}
                  <Text size="xs">{truncateText(previewRow[index], 26)}</Text>
                {/if}
                <div slot="right">
                  {#if !refreshing}
                    {#if getIndexMap(index)}
                      {getIndexMap(index)}
                    {:else}
                      <Button
                        color="clear"
                        className="text-primary-bright"
                        on:click={() => {
                          mapField(index);
                        }}>
                        Assign
                        <Icon name="chevronDown" className="fill-primary-bright" size="14" />
                      </Button>
                    {/if}
                  {/if}
                </div>
              </ListItem>
            {/each}
          {/if}
        {/if}

      </div>
    {:else if view && view.id == 'template' && activeImporter}
      <div class="container">
        <ListItem className="pb-0">{activeImporter.config.name} Importer</ListItem>
        <ListItem>
          <Input
            type="textarea"
            placeholder={Lang.t('csv-import-compose-note', 'Compose a note for this CSV data')}
            rows={3}
            bind:value={activeImporter.config.template} />
        </ListItem>
        {#if !activeImporter.parsed}
          <ListItem bg="transparent">
            <Text size="sm" faded>Select the CSV to process</Text>
            <FileUploader
              accept="csv"
              label="Select CSV"
              on:file={async (evt) => {
                await addToImporter(evt);
              }} />
          </ListItem>
        {/if}
      </div>
    {/if}
    {#if previewLog && is.truthy(previewIndex) && activeImporter.parsed}
      <div class="examples bg-inverse-2 p-2">
        <div class="n-toolbar n-row pl-2">
          <div class="main">Preview {previewIndex} of {activeImporter.length() - 1}</div>
          <div class="filler" />
          <NextPrevCal hideCal={true} on:next={nextPreview} on:previous={previousPreview} />
        </div>
        <ListItemLog log={previewLog} />
      </div>
      <ListItem>
        <Button block on:click={startImport}>Import {activeImporter.length() - 1} Logs...</Button>
      </ListItem>
    {/if}
  </main>
</Layout>
