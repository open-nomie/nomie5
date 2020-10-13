<script lang="ts">
  import Text from "../../components/text/text.svelte";
  // Components
  import Keypad from "./keypad.svelte";
  // Stores
  import nid from "../../modules/nid/nid";
  import { Interact } from "../../store/interact";
  import Interactions from "../interactions/interactions.svelte";
  import { Lang } from "../../store/lang";
  import Button from "../../components/button/button.svelte";
  import Icon from "../../components/icon/icon.svelte";

  let _pin;

  $: if ($Interact.pin.show === false) {
    _pin = "";
  }

  const methods = {
    submit() {
      // encode the pin and send it up
      let final = _pin || "";

      if (final.length < 7 && final.length > 0) {
        $Interact.pin.onPin(nid(_pin));
      } else {
        Interact.error("Pin must be between 1 and 6 characters");
      }
    },
    cancelInput() {
      Interact.cancelPin();
    },
  };
</script>

<style>
  h1 {
    color: #fff;
    margin-bottom: 20px;
    border-bottom: solid 1px rgba(255, 255, 255, 0.2);
    padding-bottom: 20px;
    width: 100%;
    text-align: center;
  }
  :global(.pin-holder) {
    background-color: rgba(255, 255, 255, 0.12);
    max-width: 280px;
    width: 280px;
    max-height: 40px;
    border-radius: 6px;
    margin-bottom: 12px;
    justify-content: center;
  }
  :global(.pin-close-btn) {
    position: fixed !important;
    top: 20px;
    left: 20px;
  }
</style>

<div
  aria-modal
  aria-label="Lock Screen"
  aria-hidden={!$Interact.pin.show}
  class="lock-screen full-screen flex-column bg-primary-bright {$Interact.pin.show ? 'visible' : 'hidden'}">
  <Text center size="sm" faded className="text-white mb-2">{Lang.t('settings.pin-requirements', '1 to 6 digits')}</Text>
  <h1>{$Interact.pin.title}</h1>
  {#if $Interact.pin.show}
    <!-- Pin Display -->
    <Text center size="xl" className="text-white pin-holder n-row">
      {#each _pin.split('') as d}•{/each}
    </Text>
    <!-- Keypad Input -->
    <Keypad bind:value={_pin} on:submit={methods.submit} />
    {#if $Interact.pin.canClose}
      <Button icon color="clear" className="pin-close-btn" ariaLabel="Cancel" on:click={methods.cancelInput}>
        <Icon name="close" className="fill-white" size="32" />
      </Button>
    {/if}
  {/if}

</div>
