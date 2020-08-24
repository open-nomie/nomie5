<script>
  //Vendors
  import { navigate, Router, Route } from "svelte-routing";

  // Modules
  import Tracker from "../modules/tracker/tracker";
  // Components
  import NText from "../components/text/text.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  import NBackButton from "../components/back-button/back-button.svelte";
  import NFileBrowser from "../components/file-browser/file-browser.svelte";
  // containers
  import NPage from "../containers/layout/page.svelte";

  // config
  import faq from "../config/faq";

  export let path = null;
</script>

<NFileBrowser {path} />
