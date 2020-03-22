<script>
  // svlete
  import { navigate } from "svelte-routing";
  // components
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  import AppLayout from "../layout/app.svelte";
  //props
  export let className = undefined;
  export let withBack = false;
  export let title = undefined;
  // Dynamic
  $: hasHeader = (arguments[1].$$slots || {}).hasOwnProperty("header") || title;
  $: hasSubHeader = (arguments[1].$$slots || {}).hasOwnProperty("sub-header");
  $: if (hasSubHeader) {
  }

  // methods
</script>

<style>
  .title {
    color: var(--color-inverse);
    font-size: 1rem;
  }
</style>

<AppLayout>
  <div slot="header">
    {#if hasHeader}
      <NToolbar>
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
        {#if title}
          <div class="title filler">{title}</div>
        {/if}
        <slot name="header" />
      </NToolbar>
    {/if}
    {#if hasSubHeader}
      <NToolbar className="sub-header">
        <slot name="sub-header" />
      </NToolbar>
    {/if}
  </div>
  <div slot="content">
    <slot />
  </div>
</AppLayout>
