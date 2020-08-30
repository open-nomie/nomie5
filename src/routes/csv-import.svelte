<script lang="ts">
  //Vendors
  import { navigate, Router, Route } from "svelte-routing";

  import { onMount } from "svelte";
  import { UserStore } from "../store/user-store";
  import CSVRImport from "../modules/csvr/csvr-import";

  // class CSVExporter {
  //   search: string;
  // }

  // const steps = [
  //   { title: "Import a CSV", id: "upload" },
  //   { title: "Compose Note", id: "note" },
  //   { title: "Componse Log", id: "log" },
  // ];

  // const state = {
  //   saved: [],
  //   stepIndex: 0,
  // };

  // async function main() {
  //   let savedImports = await UserStore.mstore("csv_exports");
  //   state.saved = (savedImports || []).map((importConfig) => {
  //     return new CSVRImport(importConfig);
  //   });
  // }
  // onMount(main);
  // // containers
  // import NLayout from "../containers/layout/layout.svelte";
  // // config
  // import { TrackerStore } from "../store/tracker-store";
  // import { Interact } from "../store/interact";
  // import { Lang } from "../store/lang";
  // import dayjs from "dayjs";
  // import BackButton from "../components/back-button/back-button.svelte";

  // let saved;
  // let activeViewId: "home";
  // let view;

  // $: view = views.find((v) => v.id == activeViewId);

  onMount(() => {});

  let views = [
    {
      title: "Import CSV",
      id: "home",
    },
    {
      title: "Compose Note",
      id: "note",
    },
    {
      title: "Compose Log",
      id: "log",
    },
  ];
</script>

<!-- 
<NLayout className="import">
  <div class="n-toolbar-grid container" slot="header">
    <div class="left">
      <BackButton />
    </div>
    <div class="title main">Import CSV</div>
    <div class="right" />
  </div>
  <div class="main container">
    {#if view && view.id == 'home'}Saved Searchs{/if}
  </div>
</NLayout> -->
