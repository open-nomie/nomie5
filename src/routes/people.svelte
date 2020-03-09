<script>
  import { onMount } from "svelte";
  import AppLayout from "../containers/layout/app.svelte";
  import ButtonGroup from "../components/button-group/button-group.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  import NToolbar from "../components/toolbar/toolbar.svelte";
  import PersonBall from "../containers/people/person-ball.svelte";

  import Dymoji from "../components/dymoji/dymoji.svelte";

  import { Lang } from "../store/lang.js";
  import { PeopleStore } from "../store/people-store.js";
  import { Interact } from "../store/interact.js";

  let state = {
    people: [],
    view: "positivity",
    stats: {}
  };

  const personClicked = username => {
    Interact.person(username);
  };

  /**
   * When PeopleStore Changes,
   * set state.people to the array of usernames
   */
  $: if (state.view && $PeopleStore) {
    if (state.view == "name") {
      state.people = Object.keys($PeopleStore).sort((a, b) => {
        return a > b ? 1 : -1;
      });
    } else if (state.view == "time") {
      state.people = Object.keys($PeopleStore).sort((a, b) => {
        return state.stats[a].last < state.stats[b].last ? 1 : -1;
      });
    } else if (state.view == "positivity") {
      state.people = Object.keys($PeopleStore).sort((a, b) => {
        return (state.stats[a] || {}).score < (state.stats[b] || {}).score
          ? 1
          : -1;
      });
    } else {
      state.people = Object.keys($PeopleStore);
    }
  }
  // Change Main View
  const changeView = viewStr => {
    state.view = viewStr;
  };

  const getStatItem = username => {
    let stat = state.stats[username];
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

  const filterPeople = () => {};
  //

  $: pageButtons = [
    {
      label: "Positivity",
      active: state.view === "positivity",
      click() {
        changeView("positivity");
      }
    },
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
    }
  ];

  onMount(async () => {
    state.stats = await PeopleStore.stats();
    console.log("In OnMount Stats", state.stats);
  });
</script>

<style lang="scss">
  .n-grid {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }
</style>

<AppLayout title="People">
  <div slot="header">
    <NToolbar>
      <!-- <h2 class="text-inverse mr-2">{Lang.t('tabs.people')}</h2> -->
      <ButtonGroup size="sm" buttons={pageButtons} />
    </NToolbar>
  </div>

  <div slot="content">
    <div class="page page-people">
      <div class="container p-2 n-grid text-inverse">
        {#each state.people as person}
          <PersonBall
            username={person}
            score={getStatItem(person).score}
            count={getStatItem(person).count}
            last={getStatItem(person).last}
            on:click={() => {
              personClicked(person);
            }} />
        {/each}
      </div>
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
