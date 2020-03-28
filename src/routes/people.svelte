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

  function lastContact(date) {
    if (date) {
      return dayjs(date).fromNow();
    } else {
      return null;
    }
  }

  /**
   * When PeopleStore Changes,
   * set state.people to the array of usernames
   */
  $: if (state.view && $PeopleStore.people) {
    loadPeople();
    state.initialized = true;
  }

  function loadPeople() {
    let stats = $PeopleStore.stats;
    if (state.view == "name") {
      state.people = getPeople().sort((a, b) => {
        return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
      });
      /**
       * Sort by Time
       */
    } else if (state.view == "time") {
      const longTimeAgo = dayjs()
        .subtract(100, "years")
        .toDate();
      state.people = getPeople().sort((a, b) => {
        return (stats[a] || { last: longTimeAgo }).last <
          (stats[b] || { last: longTimeAgo }).last
          ? 1
          : -1;
      });
      /**
       * Sort by Positivity
       */
    } else if (state.view == "positivity") {
      state.people = getPeople().sort((a, b) => {
        return (stats[a] || { score: -99 }).score <
          (stats[b] || { score: -99 }).score
          ? 1
          : -1;
      });
    }
  }

  // Change Main View
  const changeView = viewStr => {
    state.view = viewStr;
  };

  const getStatItem = username => {
    let stat = $PeopleStore.stats[username];
    if (stat) {
      return {
        count: stat.logs.count,
        score: stat.score,
        last: stat.last
      };
    } else {
      return {
        count: 0,
        score: 0,
        last: null
      };
    }
  };

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

  const filterPeople = () => {};
  //

  $: pageButtons = [
    {
      label: "Name",
      active: state.view === "name",
      click() {
        changeView("name");
      }
    },
    {
      label: "Time",
      active: state.view === "time",
      click() {
        changeView("time");
      }
    },
    {
      label: "Positivity",
      active: state.view === "positivity",
      click() {
        changeView("positivity");
      }
    }
  ];

  onMount(async () => {
    await PeopleStore.getStats();
  });
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
    <!-- <NToolbar>
      <div class="container container-sm">
        <ButtonGroup size="sm" buttons={pageButtons} />
      </div>
    </NToolbar> -->
  </div>

  <div slot="content" class="container">

    <div class="n-list">
      {#if !state.people.length && !state.searchTerm}
        <NItem className=" py-3">
          <div class="text-md">
            Use Nomie to track and monitor how you interact with others
          </div>
          <div class="text-sm mt-2">
            <span class="fake-link" on:click={addPerson}>Add a person</span>
            or type @username in a note to auto create people.
          </div>

        </NItem>
      {:else if !state.people.length && state.searchTerm}
        <NItem>Nothing found for @{state.searchTerm}</NItem>
      {/if}

      {#each state.people as person}
        <NItem
          className="py-2 clickable"
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
          {#if lastContact(getStatItem(person).last)}
            <div class="note">{lastContact(getStatItem(person).last)}</div>
          {/if}
        </NItem>
      {/each}
    </div>
  </div>
</AppLayout>

<!--
     // On User Click
//   const personClicked = person => {
//     Interact.popmenu({
//       title: person,
//       buttons: [
//         {
//           title: "Check-In",
//           click: () => {
//             console.log("Do Checkin");
//           }
//         },
//         {
//           title: "Stats",
//           click: () => {
//             console.log("Do Stats");
//           }
//         }
//       ]
//     });
//   };
-->
