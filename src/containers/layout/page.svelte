<script>
  // svlete
  import { navigate } from "svelte-routing";
  // components
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  import NLayout from "../layout/layout.svelte";
  //props
  export let className = undefined;
  // export let withBack = false;
  export let title = undefined;
  // Dynamic
  $: hasHeader = (arguments[1].$$slots || {}).hasOwnProperty("header") || title;
  $: hasSubHeader = (arguments[1].$$slots || {}).hasOwnProperty("sub-header");

  // methods
</script>

<style>
  .title {
    color: var(--color-inverse);
    font-size: 1em;
  }
</style>

<NLayout pageTitle={title} {className}>
  <div slot="header">
    <slot name="header" />
    {#if hasSubHeader}
      <NToolbar className="sub-header">
        <slot name="sub-header" />
      </NToolbar>
    {/if}
  </div>
  <div slot="content">
    <slot />
  </div>
</NLayout>
