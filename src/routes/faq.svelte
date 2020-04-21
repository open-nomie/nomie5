<script>
  //Vendors
  import { navigate, Router, Route } from "svelte-routing";

  // Modules
  import Tracker from "../modules/tracker/tracker";
  // Components
  import NText from "../components/text/text.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  import NBackButton from "../components/back-button/back-button.svelte";
  // containers
  import NPage from "../containers/layout/page.svelte";

  import NLayout from "../containers/layout/layout.svelte";

  // config
  import faq from "../../config/faq";
</script>

<NLayout className="faq" pageTitle="Common Questions about Nomie">

  <div slot="header" class="n-toolbar-grid container">
    <div class="left">
      <NBackButton />
    </div>
    <div class="main title">Q&A</div>
    <div class="right" />
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

</NLayout>
