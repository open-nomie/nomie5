<script>
  import NModal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NText from "../../components/text/text.svelte";
  import { DeviceStore } from "../../store/device-store";

  function closeThisUpdate() {
    DeviceStore.closeUpdate();
  }
  let showFixes = false;
</script>

<NModal
  title="New in APP_VERSION"
  allowClose={true}
  on:close={() => {
    closeThisUpdate();
  }}
  show={$DeviceStore.whatsNew !== null}>
  {#if $DeviceStore.whatsNew}
    <NItem description={$DeviceStore.whatsNew.description} className="pt-2" />
    {#if $DeviceStore.whatsNew.features.length}
      <NItem
        className="divider text-xs py-1 text-primary compact font-weight-bold">
        FEATURES
      </NItem>
      <div class="n-list compact border-bottom">
        {#each $DeviceStore.whatsNew.features as feature}
          <NItem className="text-xs py-2" compact>{feature}</NItem>
        {/each}
      </div>
    {/if}
    {#if $DeviceStore.whatsNew.fixes.length}
      <NItem
        className="divider text-xs py-1 text-primary compact font-weight-bold">
        FIXES
        <button
          class="btn btn-link"
          on:click={() => {
            showFixes = !showFixes;
          }}>
          {showFixes ? 'Hide' : 'View'}
        </button>
      </NItem>
      <div class="n-list compact">
        {#each $DeviceStore.whatsNew.fixes as fix}
          <NItem className="text-xs py-2" compact>{fix}</NItem>
        {/each}
      </div>
    {/if}
  {/if}
  <footer slot="footer" />
</NModal>
