<script>
  import { onMount } from "svelte";
  import AppLayout from "../containers/layout/app.svelte";
  import ButtonGroup from "../components/button-group/button-group.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  import NToolbar from "../components/toolbar/toolbar.svelte";
  import TrackerBall from "../components/tracker-ball/tracker-ball.svelte";
  import dayjs from "dayjs";
  import Dymoji from "../components/dymoji/dymoji.svelte";
  import NTip from "../components/tip/tip.svelte";

  import { Lang } from "../store/lang.js";
  import { PeopleStore } from "../store/people-store.js";
  import { Interact } from "../store/interact.js";

  let state = {
    people: [],
    view: "time",
    stats: {}
  };

  const personClicked = username => {
    Interact.person(username);
  };

  /**
   * When PeopleStore Changes,
   * set state.people to the array of usernames
   */
  $: if (state.view && $PeopleStore.people) {
    let stats = $PeopleStore.stats;
    if (state.view == "name") {
      state.people = Object.keys($PeopleStore.people).sort((a, b) => {
        return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
      });
      /**
       * Sort by Time
       */
    } else if (state.view == "time") {
      const longTimeAgo = dayjs()
        .subtract(100, "years")
        .toDate();
      state.people = Object.keys($PeopleStore.people).sort((a, b) => {
        return (stats[a] || { last: longTimeAgo }).last <
          (stats[b] || { last: longTimeAgo }).last
          ? 1
          : -1;
      });
      /**
       * Sort by Positivity
       */
    } else if (state.view == "positivity") {
      state.people = Object.keys($PeopleStore.people).sort((a, b) => {
        return (stats[a] || { score: -99 }).score <
          (stats[b] || { score: -99 }).score
          ? 1
          : -1;
      });
    } else {
      state.people = Object.keys($PeopleStore.people);
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
    console.log("In OnMount Stats", state.stats);
  });
</script>

<style lang="scss">

</style>

<AppLayout title="People">
  <div slot="header">
    <NToolbar>
      <!-- <h2 class="text-inverse mr-2">{Lang.t('tabs.people')}</h2> -->
      <div class="container container-sm">
        <ButtonGroup size="sm" buttons={pageButtons} />
      </div>
    </NToolbar>
  </div>

  <div slot="content" class="container">

    <NTip
      tip="Track the people you interact with the most. You can manually add
      them, or include their username in a note. Example: Had dinner with @mom
      today." />

    <div class="n-board h-100">
      <div class=" n-grid text-inverse">
        {#each state.people as person}
          <TrackerBall
            username={person}
            score={getStatItem(person).score}
            last={getStatItem(person).last}
            on:click={() => {
              personClicked(person);
            }} />
        {/each}
        <TrackerBall
          username={'Add Person'}
          emoji="➕"
          note={false}
          on:click={() => {
            let username = prompt(`What's their name?`);
            if (username) {
              PeopleStore.add(username);
            }
          }} />
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
