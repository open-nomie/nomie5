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
  import faq from "../../config/faq";
</script>

<NPage className="stats" withBack={true}>

  <div slot="header" class="n-row">
    <h1>Frequent Questions</h1>
    <div class="filler" />
  </div>

  <div class="container">
    <div class="n-list">
      {#each faq as q, index}
        <div class="n-pop my-2 py-2">
          <NItem title={q.question} description={q.answer} />
        </div>
      {/each}
    </div>
  </div>

</NPage>
