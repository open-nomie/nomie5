<script>
  import { createEventDispatcher } from "svelte";
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  import { PeopleStore } from "../../store/people-store";
  import Text from "../text/text.svelte";
  import Button from "../button/button.svelte";
  import Avatar from "../avatar/avatar.svelte";
  const dispatch = createEventDispatcher();

  export let element = undefined;
  export let style = "";
  export let truncate = false;
  export let solo = false;
  export let xs = false;
  export let novalue = false;
  export let className = "";
  export let value = undefined;

  let hasEmojiSlot = arguments[1].$$slots || {}.emoji;
  let avatarSize = 40;

  $: if (xs) {
    avatarSize = 20;
  }

  function shouldShowValue(trackerElement) {
    if (trackerElement.obj && trackerElement.obj.type == "picker") {
      return false;
    } else if (trackerElement.type == "person") {
      return false;
    } else if (trackerElement.obj && trackerElement.obj.type == "tick") {
      return trackerElement.value !== 1;
    } else if (trackerElement.value != undefined) {
      return true;
    } else {
      return false;
    }
  }
</script>

{#if element}

  <Button
    color="clear"
    {style}
    className="{className} n-tracker-value-grid-button {solo ? 'solo' : ''}
    {xs ? 'size-xs' : ''}
    {novalue ? 'novalue' : ''}
    "
    on:click={(event) => {
      event.preventDefault();
      event.stopPropagation();
      dispatch('click', element);
      return false;
    }}>
    {#if hasEmojiSlot}
      <slot name="emoji" />
    {:else if element.type == 'tracker'}
      <Avatar size={avatarSize} emoji={(element.obj || {}).emoji} label={(element.obj || {}).id} className="mr-2" />
      <!-- <div class="emoji" style={`color:${(element.obj || {}).color || '#CCC'}`}>{(element.obj || {}).emoji || '⚪️'}</div> -->
    {:else if element.type == 'person'}
      {#if $PeopleStore.people[element.id] && $PeopleStore.people[element.id].avatar}
        <Avatar size={avatarSize} src={$PeopleStore.people[element.id].avatar} className="mr-2" />
      {:else if $PeopleStore.people[element.id] && $PeopleStore.people[element.id].displayName}
        <Avatar size={avatarSize} label={$PeopleStore.people[element.id].displayName} className="mr-2" />
      {/if}
    {/if}
    <main class="{truncate ? 'truncate' : ''} text-left w-100">
      <Text truncate size="sm">{(element.obj || {}).label || element.id}</Text>
      {#if shouldShowValue(element)}
        <Text bold style="white-space:pre">{NomieUOM.format(element.value, (element.obj || {}).uom) || ''}</Text>
      {:else if value}
        <Text style="white-space:pre" faded size="sm">{value}</Text>
      {/if}
    </main>
  </Button>
{/if}
