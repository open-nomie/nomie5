<script>
  // Components
  import Keypad from "./keypad.svelte";
  // Stores
  import { UserStore } from "../../store/user-store";

  let pin;
  $: view = pin ? pin.replace(/\d(?!$)/g, " • ") : "Enter Pin";
  $: locked = $UserStore.locked || false;
  $: accessPin = $UserStore.meta.pin || null;

  const methods = {
    submit() {
      if (`${pin} ` === `${accessPin} `) {
        UserStore.unlock();
      } else {
        methods.shake();
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

<div class="full-screen flex-column bg-primary {$UserStore.locked && accessPin ? 'visible' : 'hidden'}">
  <h1>{view}</h1>
  <Keypad bind:value={pin} on:submit={methods.submit} />
</div>
