<script>
  // Svelte
  import { slide } from "svelte/transition";
  import { Interact } from "../../store/interact";
  import Button from "../button/button.svelte";
  import ListItem from "../list-item/list-item.svelte";
  import Text from "../text/text.svelte";
  import Interactions from "../../containers/interactions/interactions.svelte";
  import { tap } from "@sveltejs/gestures";

  // Props
  let showDom = false;

  $: if ($Interact.toast.show) {
    showDom = true;
  } else {
    showDom = false;
  }

  function click() {
    if ($Interact.toast.click) {
      $Interact.toast.click();
    } else {
      Interact.dismissToast();
    }
  }
</script>

<style lang="postcss" >
  .n-toast {
	 z-index: 10003;
	 position: fixed;
	 bottom: 0px;
	 height: 140px;
	 left: 0;
	 right: 0;
	 display: flex;
	 justify-content: center;
	 align-items: flex-end;
	 padding-bottom: env(safe-area-inset-bottom);
	 transition: all 0.2s ease-in-out;
	 padding-left: 16px;
	 padding-right: 16px;
}
 .n-toast.hidden {
	 transform: translateY(200px) scale(0.8);
	 opacity: 0;
	 pointer-events: none;
}
 .n-toast.visible {
	 transform: none;
	 opacity: 1;
}
 .n-toast .n-toast-panel {
  @apply bg-black;
  @apply bg-opacity-80;
  @apply backdrop-filter;
  @apply backdrop-blur-sm;
  @apply backdrop-saturate-150;
  @apply rounded-md;

  min-height: 36px;
  max-width: 600px;
  min-width: 300px;
  padding: 4px 0;
  flex-grow: 0;
  border: solid 1px rgba(0, 0, 0, 0.1);
  box-shadow: 0px 26px 18px rgba(0, 0, 0, 0.2);
  flex-shrink: 1;
  display: flex;
  align-items: center;
  margin-bottom: 15%;
}
 
</style>

<div
  class="n-toast {showDom ? 'visible' : 'hidden'}"
  aria-modal
  aria-label="Notification"
  aria-hidden={showDom ? 'false' : 'true'}
  on:click={click}>
  <div class="n-toast-panel">
    <ListItem style="background-color:transparent">
      <Text size="md" style="color:#FFF" truncate>{$Interact.toast.message}</Text>
      {#if $Interact.toast.description}
        <Text size="sm" style="color:#FFF; opacity:0.75; margin-top:2px; line-height:1.1em;">{$Interact.toast.description}</Text>
      {/if}
      <div slot="right">
        {#if $Interact.toast.buttonLabel && $Interact.toast.click}
          <Button
            color="clear"
            style="font-weight:bold; color:#FFF; text-transform:uppercase; font-size:0.9em"
            on:click={$Interact.toast.click}>
            {$Interact.toast.buttonLabel}
          </Button>
        {/if}
      </div>
    </ListItem>
  </div>
</div>
