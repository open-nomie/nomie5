<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import NomieUOM from "../../utils/nomie-uom/nomie-uom";
  import { PeopleStore } from "../../store/people-store";
  import Avatar from "../avatar/avatar.svelte";
  import type TrackableElement from "../../modules/trackable-element/trackable-element";
  const dispatch = createEventDispatcher();

  export let element = undefined;
  export let style = "";
  export let truncate = false;
  export let solo = false;
  export let xs = false;
  export let sm = false;
  export let novalue = false;
  export let className = "";
  export let value: string | number | undefined = undefined;
  export let compact: boolean = false;
  // export let value = undefined;

  let hasEmojiSlot: any = (arguments[1].$$slots || { emoji: undefined }).emoji;
  let avatarSize: number = 40;

  $: if (xs) {
    avatarSize = 20;
  }
  $: if (compact) {
    avatarSize = 30;
  }

  const shouldShowValue = (trackerElement: TrackableElement) => {
    if (trackerElement.obj && trackerElement.obj.type == "picker") {
      return true;
    } else if (trackerElement.type == "person") {
      return false;
    } else if (trackerElement.obj && trackerElement.obj.type == "tick") {
      return true;
    } else if (trackerElement.value !== undefined) {
      return true;
    } else if (value) {
      return value;
    } else {
      return false;
    }
  };
</script>

{#if element}
  <button
    on:click={(event) => {
      event.preventDefault();
      event.stopPropagation();
      dispatch("click", element);
    }}
    class="tracker-small-block {compact ? 'compact' : ''}"
  >
    <!-- avatar -->
    <div class="avatar-holder flex items-center stiff">
      {#if hasEmojiSlot}
        <slot name="emoji" />
      {:else if element.type == "tracker"}
        <Avatar
          size={avatarSize}
          color={(element.obj || {}).color}
          emoji={(element.obj || {}).emoji}
          label={(element.obj || {}).label || element.id}
          className="stiff mr-2"
        />
      {:else if element.type === "context"}
        <Avatar size={avatarSize} label={element.id} className="stiff mr-2" />
      {:else if element.type === "person"}
        {#if $PeopleStore.people[element.id] && $PeopleStore.people[element.id].avatar}
          <Avatar
            size={avatarSize}
            src={$PeopleStore.people[element.id].avatar}
            className="stiff mr-2"
          />
        {:else if $PeopleStore.people[element.id] && $PeopleStore.people[element.id].displayName}
          <Avatar
            size={avatarSize}
            label={$PeopleStore.people[element.id].displayName}
            className="stiff mr-2"
          />
        {:else}
          <Avatar size={avatarSize} label={element.id} className="stiff mr-2" />
        {/if}
      {/if}
    </div>
    <!-- Label -->
    <div class="filler flex items-center line-clamp-1 {sm ? 'pr-1' : 'pr-2'}">
      <p class="title line-clamp-1">
        {(element.obj || {}).label || element.id}
      </p>
      {#if shouldShowValue(element)}
        <p class="value">
          {#if element.value || value}
            {NomieUOM.format(element.value || value, (element.obj || {}).uom) ||
              ""}
          {:else}0{/if}
        </p>
      {/if}
    </div>
  </button>
{/if}

<style global lang="postcss">
  .tracker-small-block {
    @apply text-left;
    @apply bg-gray-100 dark:bg-gray-900;
    @apply flex flex-row items-center justify-start;
    @apply text-black dark:text-white;
    @apply p-1;
    @apply rounded-xl;
  }
  .tracker-small-block .title {
    @apply leading-tight;
    @apply text-sm;
    @apply line-clamp-1;
  }
  .tracker-small-block .value {
    @apply font-bold;
  }

  .tracker-small-block.compact {
    @apply p-0;
    @apply bg-transparent;
    @apply text-xs;
  }
  .tracker-small-block.compact .title,
  .tracker-small-block.compact .value {
    @apply text-xs;
  }
</style>
