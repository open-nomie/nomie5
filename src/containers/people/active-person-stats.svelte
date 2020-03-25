<script>
  import { onMount } from "svelte";
  import BarChart from "../../components/charts/bar-chart.svelte";
  import { PeopleStore } from "../../store/people-store.js";
  import { LedgerStore } from "../../store/ledger.js";
  import { Interact } from "../../store/interact.js";

  import tick from "../../utils/tick/tick";
  import Person from "../../modules/person/person";
  import StatsProcessor from "../../modules/stats/stats";

  import dayjs from "dayjs";

  let lastActivePersonKey;
  let activePerson;
  let activeStats;
  let activeDate = dayjs();

  let loading = true;

  $: activeYear = activeDate.format("YYYY");

  //   $: if(activeDate) {}

  async function loadPersonStats() {
    loading = true;
    console.log("loadPersonStats()", activeYear);
    let active = $Interact.people.active;
    activePerson = new Person($PeopleStore.people[$Interact.people.active]);
    let logs = await LedgerStore.queryPerson(
      active,
      activeDate.startOf("year"),
      activeDate.endOf("year")
    );
    console.log(`Found ${logs.length} Logs`, logs);
    activeStats = new StatsProcessor(logs, null);
    console.log("active stats", activeStats);
    loading = false;
  }

  async function go(years) {
    activeDate = activeDate.add(years, "year");
    await tick(10);
    loadPersonStats();
  }

  function xFormat(v) {
    return dayjs(v).format("MM");
  }

  $: if (
    $Interact.people.active &&
    lastActivePersonKey !== $Interact.people.active
  ) {
    lastActivePersonKey = $Interact.people.active;
    loadPersonStats();
  }

  onMount(() => {
    // loadPersonStats();
  });
</script>

<div class="active-person-stats">
  <div class="n-row">
    <button
      class="btn btn-clear btn-sm text-primary"
      on:click={() => {
        go(-1);
      }}>
      <i class="zmdi zmdi-chevron-left mr-2" />
      {activeDate.subtract(1, 'year').format('YYYY')}
    </button>
    <div class="text-md font-weight-bold filler text-center text-inverse">
      {activeYear}
    </div>
    <button
      class="btn btn-clear btn-sm text-primary"
      on:click={() => {
        go(1);
      }}>
      {activeDate.add(1, 'year').format('YYYY')}
      <i class="zmdi zmdi-chevron-right ml-2" />
    </button>
  </div>
  {#if activeStats && !loading}
    <BarChart
      title={`title`}
      height={150}
      {xFormat}
      labels={activeStats.results.year.chart.labels}
      points={activeStats.results.year.chart.points}
      on:tap={event => {}}
      activeIndex={0} />
  {:else}Loading...{/if}
</div>
