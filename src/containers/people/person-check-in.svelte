<script>
  import { Interact } from "../../store/interact.js";
  import { Lang } from "../../store/lang.js";
  import { LedgerStore } from "../../store/ledger.js";
  import NomieLog from "../../modules/nomie-log/nomie-log";
  import Spinner from "../../components/spinner/spinner.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import AutoComplete from "../../components/auto-complete/auto-complete.svelte";
  import NButtonGroup from "../../components/button-group/button-group.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

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
      dispatch("checkedIn");
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
    <NButtonGroup
      inverse
      labelClass="text-xl"
      buttons={[{ label: '😩', active: state.score === -2, click: () => {
            state.score = -2;
          } }, { label: '😞', active: state.score === -1, click: () => {
            state.score = -1;
          } }, { label: '😐', active: state.score === 0, click: () => {
            state.score = 0;
          } }, { label: '🙂', active: state.score === 1, click: () => {
            state.score = 1;
          } }, { label: '😁', active: state.score === 2, click: () => {
            state.score = 2;
          } }]} />
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
  {:else if state.checkedIn}
    <button class="btn btn-block btn-green mt-4">
      <span class="zmdi zmdi-check text-white" />
    </button>
  {/if}
</div>
