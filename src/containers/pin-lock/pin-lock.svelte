<script>
  // Components
  import Keypad from "./keypad.svelte";
  // Stores
  import { UserStore } from "../../store/user-store";
  import nid from "../../modules/nid/nid";

  import Storage from "../../modules/storage/storage";
  import { onMount } from "svelte";
  import { Interact } from "../../store/interact";

  let _pin;
  let pin;
  let locked = false;
  $: view = _pin ? _pin.replace(/\d(?!$)/g, " • ") : "Enter Pin";
  $: shouldLock = $UserStore.meta.lock || false;
  $: accessPin = $UserStore.meta.access_pin || null;
  $: if (accessPin) {
    if (accessPin == pin) {
      locked = false;
    } else {
      locked = shouldLock;
    }
  }

  const methods = {
    submit() {
      // encode the pin
      pin = nid(_pin);
      if (pin !== accessPin) {
        Interact.alert(`Invalid Pin`, "Please try again.");
      }
    },
    shake() {
      alert("Incorrect Pin");
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
</style>

<div class="lock-screen full-screen flex-column bg-primary-bright {locked && accessPin ? 'visible' : 'hidden'}">
  <h1>{view}</h1>
  <Keypad bind:value={_pin} on:submit={methods.submit} />
</div>
