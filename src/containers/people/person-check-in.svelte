<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  // Modules
  import NomieLog from "../../modules/nomie-log/nomie-log";

  // Components
  import Spinner from "../../components/spinner/spinner.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import AutoComplete from "../../components/auto-complete/auto-complete.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NButtonGroup from "../../components/button-group/button-group.svelte";
  import NPositivitySelector from "../../components/positivity-selector/positivity-selector.svelte";

  // utils
  import tick from "../../utils/tick/tick";

  // Stores
  import { Interact } from "../../store/interact.js";
  import { Lang } from "../../store/lang.js";
  import { LedgerStore } from "../../store/ledger.js";

  const state = {
    note: ` @${$Interact.people.active} `,
    checkingIn: false,
    checkedIn: false,
    score: 0
  };
  const getPlaceholder = () => {
    return `What are you and @${$Interact.people.active} up to?`;
  };
  let checkIn = async () => {
    state.checkingIn = true;
    try {
      let log = new NomieLog({
        note: state.note
      });
      log.score = state.score;
      let saved = await LedgerStore.saveLog(log);
      state.checkingIn = false;
      state.checkedIn = true;
      await tick(600);
      dispatch("checkedIn", saved);
    } catch (e) {
      Interact.alert("Error", e.message);
      state.checkingIn = false;
    }
  };
</script>

<div class="person-checkin p-3">
  <div class="text-sm p-2 text-faded-2">{getPlaceholder()}</div>
  <div class="text-area-holder">
    <textarea
      class="form-control text-md p-2"
      id="textarea-note"
      rows="6"
      placeholder={getPlaceholder()}
      bind:value={state.note} />
    <AutoComplete
      input={state.note}
      on:select={evt => {
        let payload = evt.detail;
        state.note = payload.note;
        document.getElementById('textarea-note').focus();
      }} />
  </div>
  <div class="mt-2">
    <NPositivitySelector
      score={state.score}
      size="xl"
      on:change={evt => {
        state.score = evt.detail;
      }} />

  </div>
  {#if !state.checkingIn && !state.checkedIn}
    <button class="btn btn-block btn-primary mt-4" on:click={checkIn}>
      Check-In
    </button>
  {:else if state.checkingIn}
    <button class="btn btn-block btn-light mt-4" disabled>
      <Spinner size={24} className="mr-3" />
      <div class="ml-2">Checking In...</div>
    </button>
  {/if}
  <div
    class="text-center mt-4 animate up {state.checkedIn ? 'visible' : 'hidden'}">
    <NIcon name="checkmarkOutline" size="60" className="fill-green" />
  </div>
</div>
