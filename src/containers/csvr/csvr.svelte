<script lang="ts">
  import { onMount } from "svelte";
  import { UserStore } from "../../store/user-store";

  class CSVExporter {
    search: string;
  }

  const state = {
    saved: [],
  };

  async function main() {
    let savedExports = await UserStore.mstore("csv_exports");
  }
  onMount(main);
</script>

CSV BUILDER
