<script>
  //Vendors
  import { navigate, Router, Route } from "svelte-routing";
  import Dashboard from "../containers/dashboard/dashboard.svelte";
  export let path = null;
</script>

<Dashboard {path} />
