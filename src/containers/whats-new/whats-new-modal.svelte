<script>
	import ToolbarGrid from './../../components/toolbar/toolbar-grid.svelte';
	import Panel from './../../components/panel/panel.svelte';
  import { onMount } from "svelte";
  import NModal from "../../components/modal/modal2.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NText from "../../components/text/text.svelte";
  import { AppStore } from "../../store/app-store";
  import Button from "../../components/button/button.svelte";

  function closeThisUpdate() {
    AppStore.closeUpdate();
  }
  let showFixes = false;
  let showUpdates = false;

  onMount(() => {
    setTimeout(() => {
      AppStore.checkForUpdate();
    }, 1000);
  });
</script>

<NModal position="bottom" id="whats-new" visible={$AppStore.whatsNew !== null}>
  <Panel>
    <header slot="header">
      <ToolbarGrid>
        <div slot="left">
          <Button className="tap-icon" icon on:click={closeThisUpdate}>
            <NIcon name="close" />
          </Button>
        </div>
        <h2 class="ntitle">Welcome to Nomie {import.meta.env.PACKAGE_VERSION} 🥳</h2>
      </ToolbarGrid>
    </header>
  {#if $AppStore.whatsNew && !showUpdates}
    <div class="p-6 text-gray-800 dark:text-gray-200">
      Nomie {import.meta.env.PACKAGE_VERSION} adds {$AppStore.whatsNew.features.length} features, and {$AppStore.whatsNew.fixes.length} bug fixes.
      <button
        class="px-4 py-1 text-xs text-black text-white rounded-full bg-primary-500 dark:text-white bg-opacity-40"
        on:click={() => {
          showUpdates = true;
        }}>
        View Updates
      </button>
    </div>
  {/if}
  {#if $AppStore.whatsNew && showUpdates}
    {#if $AppStore.whatsNew.features.length}
      <div class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">FEATURES</div>
      <div class="n-list compact">
        {#each $AppStore.whatsNew.features as feature}
          <NItem className="text-sm py-1" compact>
            <!-- <div slot="left" class="text-faded-2">{feature.version}</div> -->
            {feature.title}
          </NItem>
        {/each}
      </div>
    {/if}
    {#if $AppStore.whatsNew.fixes.length}
      <div class="flex items-center justify-between px-4 py-2 text-xs text-gray-800 dark:text-gray-100 text-primary font-weight-bold">
        <span>Bug Fixes</span>
        <Button
            size="xs"
            color="light"
            on:click={() => {
              showFixes = !showFixes;
            }}>
            {showFixes ? 'HIDE' : 'VIEW'}
          </Button>
      </div>
      {#if showFixes}
        <div class="n-list compact">
          {#each $AppStore.whatsNew.fixes as fix}
            <NItem className="text-sm py-1" compact>{fix.title}</NItem>
          {/each}
        </div>
      {/if}
    {/if}
  {/if}
  <footer slot="footer" class="flex-shrink-0 p-4">
    <Button block color="primary" on:click={closeThisUpdate}>Done</Button>
  </footer>
  </Panel>
</NModal>
