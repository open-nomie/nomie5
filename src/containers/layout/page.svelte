<script>
  // svlete
  import { navigate } from "svelte-routing";
  // components
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  //props
  export let className = undefined;
  export let withBack = false;
  // Dynamic
  $: hasHeader = arguments[1].$$slots.hasOwnProperty("header");
  $: hasSubHeader = arguments[1].$$slots.hasOwnProperty("sub-header");
  $: if (hasSubHeader) {
  }

  // methods
</script>

<style>

</style>

<div
  class="page {className} page-{className}
  {hasSubHeader ? 'with-sub-header' : hasHeader ? 'with-header' : ''}">

  {#if hasHeader}
    <NToolbar pinTop>
      {#if withBack}
        <button
          class="btn btn-clear pl-0 pr-3"
          on:click={() => {
            window.history.back();
          }}>
          <i class="zmdi zmdi-chevron-left mr-2" />
          Back
        </button>
      {/if}
      <slot name="header" />
    </NToolbar>
  {/if}
  {#if hasSubHeader}
    <NToolbar pinTop className="sub-header">
      <slot name="sub-header" />
    </NToolbar>
  {/if}

  <slot />

</div>
