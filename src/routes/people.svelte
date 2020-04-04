<script>
  import { onMount } from "svelte";
  import AppLayout from "../containers/layout/app.svelte";
  import ButtonGroup from "../components/button-group/button-group.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  import NToolbar from "../components/toolbar/toolbar.svelte";
  import PersonBall from "../components/tracker-ball/person-ball.svelte";
  import AvatarBall from "../components/tracker-ball/ball.svelte";
  import ItemBall from "../components/tracker-ball/item-ball.svelte";
  import NSearchBar from "../components/search-bar/search-bar.svelte";
  import tick from "../utils/tick/tick";
  import dayjs from "dayjs";
  import Dymoji from "../components/dymoji/dymoji.svelte";
  import NTip from "../components/tip/tip.svelte";

  import Person from "../modules/person/person";

  import { Lang } from "../store/lang.js";
  import { PeopleStore } from "../store/people-store.js";
  import { Interact } from "../store/interact.js";

  let state = {
    people: [],
    view: "time",
    stats: {},
    searchTerm: null,
    initialized: false
  };

  const personClicked = username => {
    Interact.person(username);
  };

  /**
   * When PeopleStore Changes,
   * set state.people to the array of usernames
   */
  $: if (state.view && $PeopleStore.people) {
    loadPeople();
    state.initialized = true;
  }

  function loadPeople() {
    const longTimeAgo = dayjs()
      .subtract(100, "years")
      .toDate();

    state.people = getPeople().sort((a, b) => {
      return $PeopleStore.people[a].last < $PeopleStore.people[b].last ? 1 : -1;
    });
  }

  function searchPeople(evt) {
    if (evt.detail) {
      state.searchTerm = evt.detail.toLowerCase();
    } else {
      state.searchTerm = null;
    }
  }

  function clearSearch() {
    state.searchTerm = null;
  }

  async function addPerson() {
    try {
      let username = await Interact.prompt(`What's their name?`);
      if (username) {
        await PeopleStore.addByName(username);
        Interact.toast(`${username} added`);
      }
    } catch (e) {
      Interact.alert("Error", e.message);
    }
  }

  function getPeople() {
    if (state.searchTerm) {
      return Object.keys($PeopleStore.people).filter(person => {
        return person.toLowerCase().search(state.searchTerm) > -1;
      });
    } else {
      return Object.keys($PeopleStore.people);
    }
  }
</script>

<style lang="scss">

</style>

<AppLayout title="People">
  <div slot="header">
    <NSearchBar
      on:change={searchPeople}
      on:clear={clearSearch}
      placeholder="Search People..."
      autocomplete>
      <button
        on:click={addPerson}
        class="btn btn-icon btn-clear zmdi zmdi-account-add text-inverse"
        slot="right" />
    </NSearchBar>
  </div>

  <div slot="content" class="container">
    <div class="n-list my-2">
      {#if !state.people.length && !state.searchTerm && state.initialized}
        <NItem className=" py-3 bg-transparent">
          <div class="text-md text-center">
            Track and monitor how you interact with your friends and family.
          </div>
          <div class="text-sm mt-2 text-center">
            <span class="fake-link" on:click={addPerson}>Add a person</span>
            or
            <span class="fake-link" on:click={PeopleStore.searchForPeople}>
              Find recent @people
            </span>
          </div>

        </NItem>
      {:else if !state.initialized}
        <NItem>Loading...</NItem>
      {:else if !state.people.length && state.searchTerm}
        <NItem>Nothing found for @{state.searchTerm}</NItem>
      {/if}

      {#each state.people as person}
        <NItem
          className="py-2 clickable bottom-line"
          on:click={() => {
            personClicked(person);
          }}>
          <div slot="left">
            {#if $PeopleStore.people[person].avatar}
              <AvatarBall
                size={48}
                avatar={$PeopleStore.people[person].avatar}
                style={`border-radius:32%; overflow:hidden`} />
            {:else if $PeopleStore.people[person].displayName}
              <AvatarBall
                size={48}
                username={$PeopleStore.people[person].displayName}
                style={`border-radius:32%; overflow:hidden`} />
            {/if}
          </div>
          <div class="title">{$PeopleStore.people[person].displayName}</div>
          {#if $PeopleStore.people[person].last}
            <div class="note">
              {dayjs($PeopleStore.people[person].last).fromNow()}
            </div>
          {/if}
        </NItem>
      {/each}
    </div>
  </div>
</AppLayout>
