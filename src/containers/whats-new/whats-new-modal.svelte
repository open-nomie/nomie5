<script>
  import { onMount } from "svelte";
  import NModal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NText from "../../components/text/text.svelte";
  import { AppStore } from "../../store/app-store";

  function closeThisUpdate() {
    AppStore.closeUpdate();
  }
  let showFixes = false;

  onMount(() => {
    setTimeout(() => {
      AppStore.checkForUpdate();
    }, 1000);
  });
</script>

<NModal show={$AppStore.whatsNew !== null}>
  <header slot="header" class="n-toolbar-grid">
    <div class="left">
      <button class="btn btn-clear tap-icon" on:click={closeThisUpdate}>
        <NIcon name="close" />
      </button>
    </div>
    <div class="main">
      <NText size="md">Nomie APP_VERSION</NText>
      <NText size="sm" className="text-faded-2">What's New</NText>
    </div>
  </header>
  {#if $AppStore.whatsNew}
    {#if $AppStore.whatsNew.features.length}
      <NItem
        className="divider text-xs py-1 text-primary compact font-weight-bold">
        FEATURES
      </NItem>
      <div class="n-list compact border-bottom">
        {#each $AppStore.whatsNew.features as feature}
          <NItem className="text-sm py-1" compact>{feature}</NItem>
        {/each}
      </div>
    {/if}
    {#if $AppStore.whatsNew.fixes.length}
      <NItem
        className="divider text-xs py-1 text-primary compact font-weight-bold">
        FIXES
        <!-- <button
          slot="right"
          class="btn btn-clear btn-xs text-xs"
          on:click={() => {
            showFixes = !showFixes;
          }}>
          {showFixes ? 'Hide' : 'View'}
        </button> -->
      </NItem>
      <div class="n-list compact">
        {#each $AppStore.whatsNew.fixes as fix}
          <NItem className="text-sm py-1" compact>{fix}</NItem>
        {/each}
      </div>
    {/if}
  {/if}
  <footer slot="footer" />
</NModal>
