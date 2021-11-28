<script>
  //Vendors
  import { navigate, Router, Route } from 'svelte-routing'

  // Modules
  import Tracker from '../modules/tracker/tracker'
  // Components
  import NText from '../components/text/text.svelte'
  import NItem from '../components/list-item/list-item.svelte'
  import NBackButton from '../components/back-button/back-button.svelte'
  // containers
  import NPage from '../containers/layout/page.svelte'

  import NLayout from '../containers/layout/layout.svelte'

  // config
  import faq from '../config/faq'
</script>

<NLayout
  className="faq"
  pageTitle="Common Questions about Nomie"
  showTabs={false}>

  <div slot="header" class="n-toolbar-grid">
    <div class="left">
      <NBackButton />
    </div>
    <div class="main title">Q&A</div>
    <div class="right" />
  </div>

  <div class="min-h-full bg-gray-200 dark:bg-gray-800">
    {#each faq as q, index}
      <div class="my-3">
        <NItem className="solo py-3">
          <div class="mb-1 font-bold leading-tight">{q.question}</div>
          <p class="leading-tight text-gray-700 dark:text-gray-300 font-sm">
            {q.answer}
          </p>
        </NItem>
      </div>
    {/each}
  </div>

</NLayout>
