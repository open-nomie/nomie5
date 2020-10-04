<script lang="ts">
  import ShortcutButton from "./shortcut-button.svelte";

  import { PeopleStore } from "../../store/people-store";
  import dayjs from "dayjs";
  import { createEventDispatcher } from "svelte";
  import { Interact } from "../../store/interact";
  import Ball from "../tracker-ball/ball.svelte";
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
      {#if person && person.avatar}
        <Ball size={42} avatar={person.avatar} style={`border-radius:32%; overflow:hidden; box-shadow:var(--box-shadow-tight)`} />
      {:else if person && person.displayName}
        <Ball size={42} username={person.displayName} style={`border-radius:32%; overflow:hidden; box-shadow:var(--box-shadow-tight)`} />
      {/if}
    </div>
  </ShortcutButton>
{/if}
