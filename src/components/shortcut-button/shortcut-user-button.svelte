<script lang="ts">
  import ShortcutButton from "./shortcut-button.svelte";

  import { PeopleStore } from "../../store/people-store";
  import dayjs from "dayjs";
  import { createEventDispatcher } from "svelte";
  import { Interact } from "../../store/interact";

  import Avatar from "../avatar/avatar.svelte";
  export let person: Person;

  const dispatch = createEventDispatcher();
</script>

{#if person}
  <ShortcutButton
    compact
    hideValue
    moreIcon="chart"
    on:more={() => {
      dispatch('more', person);
    }}
    title={(person || {}).displayName}
    subtitle={person.last ? dayjs(person.last).fromNow() : 'no date'}
    on:click={() => {
      dispatch('click', person);
    }}>
    <div slot="emoji">
      <Avatar size={48} src={person.avatar} label={person.displayName} />
    </div>
  </ShortcutButton>
{/if}
