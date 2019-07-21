<script>
  // svelte
  import { onMount } from "svelte";
  //vendors
  import dayjs from "dayjs";
  // components
  import NItem from "../../components/list-item/list-item.svelte";
  // containers
  import NPage from "../../containers/layout/page.svelte";
  //modules
  import StatsOverview from "../../modules/stats/overview";
  import Tracker from "../../modules/tracker/tracker";
  import Log from "../../modules/nomie-log/nomie-log";
  // utils
  import Logger from "../../utils/log/log";

  // consts
  const console = new Logger("🧪 Stats Test");

  let passed = [];
  let failed = [];

  const methods = {
    sumTest() {
      let tracker = new Tracker({
        label: "Sum",
        math: "sum",
        tag: "sum"
      });

      let maxTest = {
        note: `#sum(33) #sum(33)`,
        date: dayjs().subtract(5, "days")
      };
      let minTest = { note: `#sum(-1)`, date: dayjs().subtract(20, "days") };
      let loopLogs = [
        { note: `#sum(1)`, date: dayjs() },
        { note: `#sum(15)`, date: dayjs().subtract(1, "day") },
        { note: `#sum(10)`, date: dayjs().subtract(1, "day") },
        { ...maxTest },
        { ...minTest },
        { note: `#sum(5)`, date: dayjs().subtract(1, "month") },
        { note: `#sum(10)`, date: dayjs().subtract(8, "days") }
      ];

      let logs = loopLogs.map(log => {
        let realLog = new Log({
          note: log.note,
          start: log.date.toDate().getTime(),
          end: log.date.toDate().getTime()
        });
        realLog.expanded();
        return realLog;
      });

      console.log("Logs", logs);

      let overview = new StatsOverview(logs, tracker).results;
      console.log("Overview from stats.svelte", overview);

      if (overview.year.count !== logs.length) {
        failed.push({ title: "Year Count failed" });
        failed = failed;
      } else {
        passed.push({ title: "Year Count passed" });
        passed = passed;
      }

      // Test Max

      if (
        overview.year.max.value !== 66 &&
        overview.year.max.date.toDate().toDateString() ===
          maxTest.date.toDate().toDateString()
      ) {
        console.error("Year max Failed", overview.year.max);
        failed.push({ title: "Year max failed" });
        failed = failed;
      } else {
        passed.push({ title: `Year Max Passed ${overview.year.max.value}` });
        passed = passed;
      }

      // Test Min
      if (
        overview.year.min.date.format("YYYY-MM-DD") !==
          minTest.date.format("YYYY-MM-DD") &&
        overview.year.min.value == "-1"
      ) {
        console.error("Year Min Failed", overview.year.max);
        failed.push({ title: "Year Min failed" });
        failed = failed;
      } else {
        passed.push({ title: "Year Min Passed" });
        passed = passed;
      }
    }
  };

  onMount(() => {
    console.log("Mounted");
    methods.sumTest();
  });
</script>

<NPage title="Test Stats" withBack={true}>

  <div class="container pt-3">
    <h1>Welcome to Stat Test</h1>
    <div class="n-pop p-3">
      <div class="row">
        <div class="col-6">
          <div class="n-title">Passed {passed.length}</div>
          <div class="n-list">
            {#each passed as pass, index}
              <NItem title={pass.title} className="pl-0">
                <span class="text-green zmdi zmdi-star" slot="left" />
              </NItem>
            {/each}
          </div>
        </div>
        <div class="col-6">
          <div class="n-title">Failed {failed.length}</div>
          <div class="n-list">
            {#each failed as fail, index}
              <NItem title={fail.title} className="pl-0">
                <span class="text-danger zmdi zmdi-fire" slot="left" />
              </NItem>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>

</NPage>
