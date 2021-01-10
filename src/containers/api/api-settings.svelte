<script lang="ts">
  import Button from "../../components/button/button.svelte";
  import Divider from "../../components/divider/divider.svelte";
  import Icon from "../../components/icon/icon.svelte";
  import Input from "../../components/input/input.svelte";
  import ListItem from "../../components/list-item/list-item.svelte";
  import List from "../../components/list/list.svelte";
  import ProgressBar from "../../components/progress-bar/progress-bar.svelte";
  import Text from "../../components/text/text.svelte";
  import ToggleSwitch from "../../components/toggle-switch/toggle-switch.svelte";
  import appConfig from "../../config/appConfig";
  import { Device } from "../../store/device-store";
  import ApiRegsiter from "./api-regsiter.svelte";
  
  import math from "../../utils/math/math";
  
  import { ApiStore } from "./api-store";
  import { Lang } from "../../store/lang";



  let state = {
    apiExample: null,
    showPrivateKey: false,
    showExample: false,
  };
  // Generate an Example API Call
  $: if ($ApiStore.apiKey) {
    state.apiExample = JSON.stringify(
      { note: "#mood(4) #sleep(07:43:32)", api_key: $ApiStore.apiKey },
      null,
      2
    );
  }
</script>

{#if $ApiStore.registered === undefined}
  <div class="p-4 text-center">
    <Text faded>Connecting...</Text>
  </div>
{:else if $ApiStore.registered === false}
  <ApiRegsiter />
{:else}
  <div class="contain-sm">

    <Divider pad>
      🟢
      <span class="mr-2" />
      Registered and Valid
    </Divider>

    <List className="app-contain-sm mb-4">
      <Input
        listItem
        type="text"
        value={$ApiStore.apiKey}
        placeholder="API Key">
        <div slot="right">
          <Button size="sm" icon on:click={() => Device.copy($ApiStore.apiKey)}>
            <Icon name="copy" size="20" />
          </Button>
        </div>
      </Input>
    </List>

    <List className="mt-2 mb-2">
      <ListItem
        title={Lang.t('nomie-api.example-request', 'Example Request')}
        clickable
        delay={0}
        on:click={() => (state.showExample = !state.showExample)}>
        <div slot="left">
          <Icon
            name="chevron{state.showExample ? 'Down' : 'Right'}"
            size="16" />
        </div>
      </ListItem>
      {#if state.showExample}
        <ListItem className="px-1">
          <Input
            rows={5}
            solo
            type="textarea"
            inputClass="code"
            label="Private Key"
            inputStyle="font-size:10px;"
            bind:value={state.apiExample}>
            <div slot="right">
              <Button
                icon
                on:click={() => {
                  Device.copy(state.apiExample);
                }}>
                <Icon name="copy" size="20" className="fill-primary-bright" />
              </Button>
            </div>
          </Input>
          <a href="https://nomie.app/tutorials" target="_blank" rel="nofollow" class="text-xs text-center d-block text-underline">See more examples</a>
        </ListItem>
        <ListItem compact title="URL" className="py-0">
          <div slot="right" class="n-row">

            <Button
              icon
              on:click={() => {
                Device.copy(`${appConfig.api}/log`);
              }}>
              <Icon name="copy" size="20" className="fill-primary-bright" />
            </Button>
            <Text size="sm">{appConfig.api}/log</Text>
          </div>
        </ListItem>
        <ListItem compact title="METHOD" className="py-0">
          <span slot="right">
            <Text size="sm">POST application/json</Text>
          </span>
        </ListItem>
        <ListItem itemDivider compact topLine>
          {Lang.t('nomie-api.fields', 'Fields')}
        </ListItem>
        <ListItem compact title="note (required)" className="py-1">
          <Text size="sm" faded>
            Accepts any text, including #tracker, @people, etc.
          </Text>
        </ListItem>
        <ListItem compact title="api_key (required)" className="py-1">
          <Text size="sm" faded>The api key provided above</Text>
        </ListItem>

        <ListItem compact title="date (optional)" className="py-1">
          <Text size="sm" faded>Any javascript friend Date format</Text>
        </ListItem>

        <ListItem compact title="lat (optional)" className="py-1">
          <Text size="sm" faded>Records Latitude</Text>
        </ListItem>

        <ListItem compact title="lng (optional)" className="py-1">
          <Text size="sm" faded>Records Longitude</Text>
        </ListItem>

        <ListItem compact title="source (optional)" className="py-1 mb-2">
          <Text size="sm" faded>
            Source of the request (not currently displayed)
          </Text>
        </ListItem>
      {/if}
    </List>

    <List className="mt-2 mb-2">
      <ListItem
        title={Lang.t('general.advanced', 'Advanced')}
        clickable
        delay={0}
        on:click={() => (state.showPrivateKey = !state.showPrivateKey)}>
        <div slot="left">
          <Icon
            name="chevron{state.showPrivateKey ? 'Down' : 'Right'}"
            size="16" />
        </div>
      </ListItem>
      {#if state.showPrivateKey}
        <Divider inset />
        <Input
          rows={5}
          listItem
          type="textarea"
          inputClass="code"
          label="Private Key"
          inputStyle="font-size:12px;"
          value={$ApiStore.privateKey}>
          <div slot="right">
            <Button
              size="sm"
              icon
              on:click={() => Device.copy($ApiStore.privateKey)}>
              <Icon name="copy" size="20" />
            </Button>
          </div>
        </Input>
      {/if}
    </List>

    <Divider hideLine pad className="text-red-500 text-opacity-50">
      Online Storage
    </Divider>
    <ListItem>
      <div slot="left">
        <Text>{$ApiStore.inAPI.length}/10</Text>
      </div>
      <div>
        <ProgressBar
          percentage={math.percentage(10, $ApiStore.inAPI.length)}
          color={$ApiStore.inAPI.length >= 9 ? 'red' : 'primary'} />
        <Text size="xs" faded className="pt-1 text-center">
          Stored on nomieapi.com
        </Text>
      </div>
    </ListItem>
    <Divider inset />
    <ListItem>
      {Lang.t('api.auto-save', 'Auto save new logs?')}
      <div slot="right">
        <ToggleSwitch
          value={$ApiStore.autoImport}
          on:change={() => {
            ApiStore.toggleAutoImport();
          }} />
      </div>
    </ListItem>

    <Divider pad className="text-red-500 text-opacity-50 mt-4">
      Danger Zone
    </Divider>
    <List className="app-contain-sm mb-4">
      <ListItem
        clickable
        on:click={ApiStore.forget}
        className="text-primary-500">
        Forget API on this Device
      </ListItem>
      <Divider inset />
      <ListItem clickable on:click={ApiStore.destroy} className="text-red-500">
        Destory API Key
      </ListItem>

    </List>
  </div>
{/if}
