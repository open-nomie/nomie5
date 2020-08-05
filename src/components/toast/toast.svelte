<script>
  // Svelte
  import { slide } from "svelte/transition";
  import { Interact } from "../../store/interact";
  import Button from "../button/button.svelte";
  import ListItem from "../list-item/list-item.svelte";
  import Interactions from "../../containers/interactions/interactions.svelte";
  import Text from "../text/text.svelte";

  // Props
  export let message = "Done";
  export let show = false;

  let showDom = false;
  let showObj = false;

  Interact.subscribe((interact) => {
    if (interact.toast.show == true) {
      console.log(`show ${interact.toast.message}`);
      showDom = true;
      setTimeout(() => {
        showObj = true;
      }, 10);
    } else if (interact.toast.show === false) {
      console.log(`Hide ${interact.toast.message}`);
      showObj = false;
      setTimeout(() => {
        showDom = false;
      }, 250);
    }
  });
</script>

<style lang="scss" type="text/scss">
  @import "../../scss/utils/_utils";
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
    &.hidden {
      transform: translateY(200px) scale(0.8);
      opacity: 0;
      pointer-events: none;
    }
    &.visible {
      transform: none;
      opacity: 1;
    }
    .n-toast-panel {
      min-height: 36px;
      max-height: 45px;
      max-width: 600px;
      min-width: 300px;
      border-radius: 6px;
      background-color: $primaryBright;
      color: #fff;
      flex-grow: 0;
      border: solid 1px rgba(0, 0, 0, 0.1);
      box-shadow: 0px 26px 18px rgba(0, 0, 0, 0.2);
      flex-shrink: 1;
      display: flex;
      align-items: center;
      margin-bottom: 15%;
    }
  }
</style>

<div class="n-toast {showObj ? 'visible' : 'hidden'}" aria-hidden={showObj ? 'false' : 'true'}>
  <div class="n-toast-panel">
    <ListItem style="background-color:transparent">
      <Text className="text-white">{$Interact.toast.message}</Text>
      <div slot="right">
        {#if $Interact.toast.buttonLabel && $Interact.toast.click}
          <Button
            color="clear"
            style="font-weight:bold; color:#FFF; text-transform:uppercase; font-size:0.9rem"
            on:click={$Interact.toast.click}>
            {$Interact.toast.buttonLabel}
          </Button>
        {/if}
      </div>
    </ListItem>
  </div>
</div>
