<script>
  //Vendors
  import { navigate, Router, Route } from "svelte-routing";

  // Modules
  import Tracker from "../modules/tracker/tracker";
  // Components
  import NText from "../components/text/text.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  // containers
  import NPage from "../containers/layout/page.svelte";

  // config
  import TrackerDesigner from "../containers/tracker-designer/tracker-designer.svelte";
</script>

<TrackerDesigner />
