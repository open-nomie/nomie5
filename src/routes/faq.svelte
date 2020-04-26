<script>
  //Vendors
  import { navigate, Router, Route } from "svelte-routing";

  // Modules
  import Tracker from "../modules/tracker/tracker";
  import Exporter from "../modules/export/export";
  // Components
  import NText from "../components/text/text.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  // containers
  import NPage from "../containers/layout/page.svelte";

  import { Interact } from "../store/interact";
  import copy from "copy-to-clipboard";
  // config
  import faq from "../../config/faq";

  function copyURL() {
    copy("https://v5.nomie.app");
    Interact.alert(
      "Nomie5 URL Copied",
      "Now Launch your browser (Safari for iOS or Chrome for Android) and paste in the url (https://v5.nomie.app)"
    );
  }

  function generateBackup() {
    const Export = new Exporter();
    Export.onChange(change => {
      Interact.toast(`Export: ${change}`, true);
    });
    Export.start().then(() => {
      Interact.toast(Lang.t("settings.export-complete"));
    });
  }
</script>

<NPage className="stats" withBack={true}>

  <div slot="header" class="n-row">
    <div class="text-inverse">Frequent Questions</div>
    <div class="filler" />
  </div>

  <div class="container">
    <div class="n-list">
      <div class="my-2">
        <NItem className="py-3">
          <div class="text-lg">New Version of Nomie!</div>
          <div class="text-inverse mb-2">
            Nomie 5 is now available. If you want to upgrade follow these steps.
          </div>
          <div class="py-2 text-inverse">
            1.
            <span
              class="fake-link"
              style="text-decoration:underline"
              on:click={generateBackup}>
              Generate a Backup
            </span>
            <span class="text-inverse-2">(might take a minute)</span>
            so you can import it into Nomie 5
          </div>
          <div class="py-2 text-inverse">
            2. Open
            <span
              on:click={copyURL}
              class="fake-link text-inverse"
              style="text-decoration:underline">
              v5.nomie.app
            </span>
            in Safari (for iOS), or Chrome (for Android).
          </div>
          <div class="py-2">
            Note: This version of Nomie 4 will continue to be available.
          </div>

        </NItem>
      </div>
      {#each faq as q, index}
        <div class="n-pop my-2 py-2">
          <NItem title={q.question} description={q.answer} />
        </div>
      {/each}
    </div>
  </div>

</NPage>
