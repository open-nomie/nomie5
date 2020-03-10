<script>
  import Modal from "../../components/modal/modal.svelte";
  import { Interact } from "../../store/interact.js";
  import { PeopleStore } from "../../store/people-store.js";
  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import PersonCheckin from "./person-check-in.svelte";
  import Dymoji from "../../components/dymoji/dymoji.svelte";
  import tick from "../../utils/tick/tick";
  import LogItem from "../../components/list-item-log/list-item-log.svelte";
  import FrappeChart from "../../components/charts/frappe.svelte";

  let domVisible = false;

  $: if ($Interact.people.active) {
    domVisible = true;
  }

  const close = async () => {
    domVisible = false;
    await tick(200);
    Interact.person(null);
  };

  const closeAndRefresh = async () => {
    await close();
    PeopleStore.getStats();
  };

  const getPersonLogs = () => {
    let stats = PeopleStore.currentStats();
    if (stats[$Interact.people.active]) {
      return stats[$Interact.people.active].logs;
    } else {
      return [];
    }
  };

  const state = {
    view: "check-in"
  };

  const changeView = view => {
    state.view = view;
  };
</script>

<Modal className="stats-modal" show={domVisible} type="bottom-slideup">
  <header
    slot="header"
    class="n-column w-100 stats-header"
    on:swipedown={close}>
    <div class="n-row">
      <button class="btn btn-clear btn-icon zmdi zmdi-close" on:click={close} />
      <div class="title filler text-center font-weight-bold">
        <Dymoji username={$Interact.people.active} size={26} radius={0.3} />
        &nbsp; {$Interact.people.active}
      </div>
      <button class="btn btn-sm btn-clear btn-icon zmdi zmdi-edit" />
    </div>
    <div class="stat-header n-row f-grow pt-2">
      <ButtonGroup
        size="sm"
        buttons={[{ label: 'Logs', active: state.view === 'logs', click() {
              changeView('logs');
            } }, { label: 'Check-In', active: state.view === 'check-in', click() {
              changeView('check-in');
            } }, { label: 'Stats', active: state.view === 'stats', click() {
              changeView('stats');
            } }]} />
    </div>
  </header>

  <main>
    {#if state.view == 'check-in'}
      <PersonCheckin on:checkedIn={closeAndRefresh} />
    {:else if state.view == 'logs'}
      <div class="logs p-2">
        {#each getPersonLogs() as log}
          <LogItem {log} />
        {/each}
      </div>
    {:else if state.view == 'stats'}
      <div class="stats p-2">
        <FrappeChart title={`@${$Interact.people.active}`} />
      </div>
    {/if}
  </main>

</Modal>
