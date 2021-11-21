<script>
  import { onMount } from "svelte";
  import NModal from "../../components/modal/modal.svelte";
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

<NModal type="bottom" show={$AppStore.whatsNew !== null}>
  <header slot="header" class="n-toolbar-grid">
    <div class="left">
      <Button className="tap-icon" icon on:click={closeThisUpdate}>
        <NIcon name="close" />
      </Button>
    </div>
    <div class="main p-2">
      <NText size="lg" center bold>Welcome to Nomie APP_VERSION 🥳</NText>
    </div>
  </header>
  {#if $AppStore.whatsNew && !showUpdates}
    <NItem className="p-3">
      Nomie APP_VERSION adds {$AppStore.whatsNew.features.length} features, and {$AppStore.whatsNew.fixes.length} bug fixes.
      <NText
        tag="span"
        color="red"
        underline
        on:click={() => {
          showUpdates = true;
        }}>
        View Updates
      </NText>
    </NItem>
  {/if}
  {#if $AppStore.whatsNew && showUpdates}
    {#if $AppStore.whatsNew.features.length}
      <NItem className="divider text-xs py-1 text-primary compact font-weight-bold">FEATURES</NItem>
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
      <NItem className="divider text-xs py-1 text-primary compact font-weight-bold">
        FIXES
        <div slot="right">
          <Button
            size="xs"
            color="light"
            on:click={() => {
              showFixes = !showFixes;
            }}>
            {showFixes ? 'HIDE' : 'VIEW'}
          </Button>
        </div>
      </NItem>
      {#if showFixes}
        <div class="n-list compact">
          {#each $AppStore.whatsNew.fixes as fix}
            <NItem className="text-sm py-1" compact>{fix.title}</NItem>
          {/each}
        </div>
      {/if}
    {/if}
  {/if}
  <footer slot="footer">
    <div class="flex">
      <Button block color="light" on:click={closeThisUpdate}>Close</Button>
    </div>
  </footer>
</NModal>
