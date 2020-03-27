<script>
  // Components
  import Modal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NInput from "../../components/input/input.svelte";
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import Dymoji from "../../components/dymoji/dymoji.svelte";
  import LogItem from "../../components/list-item-log/list-item-log.svelte";
  import BarChart from "../../components/charts/bar-chart.svelte";
  import FrappeChart from "../../components/charts/frappe.svelte";

  import ActivePersonStats from "./active-person-stats.svelte";

  // Container Items
  import PersonCheckin from "./person-check-in.svelte";

  // Modules / Utils
  import tick from "../../utils/tick/tick";
  import Person from "../../modules/person/person";
  import StatsProcessor from "../../modules/stats/stats";

  // Vendors
  import html2canvas from "html2canvas";
  import domtoimage from "dom-to-image-chrome-fix";
  import dayjs from "dayjs";

  import { LedgerStore } from "../../store/ledger";
  import { Interact } from "../../store/interact.js";
  import { PeopleStore } from "../../store/people-store.js";

  let domVisible = false;
  let avatarBase64 = null;

  let activePerson;
  let activeStats;
  let lastActivePersonKey;
  let activeLogs;

  $: if (
    $Interact.people.active &&
    lastActivePersonKey !== $Interact.people.active
  ) {
    lastActivePersonKey = $Interact.people.active;
    domVisible = true;
    activePerson = new Person($PeopleStore.people[$Interact.people.active]);
  }

  $: if (activePerson.avatar) {
    console.log("Avatar Change");
  }

  const state = {
    view: "check-in"
  };

  // async function getActivePersonStats() {
  //   let active = $Interact.people.active;
  //   activePerson = new Person($PeopleStore.people[active]);
  //   let logs = await LedgerStore.search(`@${active}`, dayjs().format("YYYY"));
  //   activeStats = new StatsProcessor(logs, null);
  // }

  async function saveActivePerson() {
    try {
      await PeopleStore.savePerson(activePerson);
      Interact.toast("Saved");
    } catch (e) {
      Interact.alert("Error", e.message);
    }
  }

  async function getAvatarImage(imageBase64) {
    let image = document.getElementById("photo-holder-image");
    image.src = imageBase64;
    await tick(200);
    console.log(`width ${image.naturalHeight}/${image.naturalWidth}`);
    let wrapper = document.getElementById("photo-holder");
    if (image.naturalHeight > image.naturalWidth) {
      wrapper.setAttribute("data-orientation", "vertical");
    } else if (image.naturalHeight < image.naturalWidth) {
      wrapper.setAttribute("data-orientation", "horizontal");
    } else {
      wrapper.setAttribute("data-orientation", "square");
    }

    try {
      await tick(400);
      let canvas = await html2canvas(wrapper, { width: 90, height: 90 });
      let avatar64 = canvas.toDataURL("image/jpeg", 0.2);
      return avatar64;
    } catch (e) {
      alert(e.message);
      return null;
    }
  }

  async function close() {
    domVisible = false;
    await tick(200);
    Interact.person(null);
  }

  async function closeAndRefresh() {
    await close();
    PeopleStore.getStats();
  }

  async function loadActiveLogs() {
    let active = $Interact.people.active;
    activePerson = new Person($PeopleStore.people[active]);
    activeLogs = await LedgerStore.queryPerson(
      active,
      dayjs().subtract(1, "year"),
      dayjs()
    );
    console.log("activeLogs", activeLogs);
  }

  async function selectPhoto(evt) {
    const toBase64 = file =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

    let input = evt.target;
    let files = evt.target.files;
    let avatarBase64 = await toBase64(files[0]);
    await tick(20);
    let smallAvatar64 = await getAvatarImage(avatarBase64);
    await tick(20);
    document.getElementById("photo-holder-image").src = null;
    await tick(10);
    activePerson.avatar = smallAvatar64;
  }

  async function changeView(view) {
    state.view = view;
    if (view == "logs") {
      loadActiveLogs();
    }
  }
</script>

<Modal className="stats-modal" show={domVisible} type="bottom-slideup">
  <header
    slot="header"
    class="n-column w-100 stats-header"
    on:swipedown={close}>
    <div class="n-row">
      <button class="btn btn-clear btn-icon zmdi zmdi-close" on:click={close} />
      <div class="title filler text-center font-weight-bold">
        <Dymoji person={activePerson} size={26} radius={0.3} />
        &nbsp; {activePerson.getDisplayName()}
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
            } }, { label: 'Edit', active: state.view === 'edit', click() {
              changeView('edit');
            } }]} />
    </div>
  </header>

  <main>
    {#if state.view == 'check-in'}
      <PersonCheckin on:checkedIn={closeAndRefresh} />
    {:else if state.view == 'edit'}
      <div class="edit pt-2">
        <NItem>
          <NInput
            type="text"
            placeholder="Display Name"
            bind:value={activePerson.displayName} />
        </NItem>
        <NItem>
          <div
            slot="left"
            on:click={() => {
              document.getElementById('avatarFileInput').click();
            }}>
            {#if activePerson.avatar}
              <Dymoji avatar={activePerson.avatar} size={50} radius={0.3} />
            {:else}
              <Dymoji
                username={activePerson.displayName}
                size={50}
                radius={0.3} />
            {/if}
          </div>
          <input
            class="form-control pb-2"
            id="avatarFileInput"
            placeholder="Avatar"
            type="file"
            accept="png,jpeg,jpg"
            on:change={selectPhoto} />
        </NItem>

        <div class="filler mt-5 pt-2" />
        <NItem className="text-red text-sm">Delete User...</NItem>
      </div>
    {:else if state.view == 'logs'}
      <div class="logs p-2">
        {#if activeLogs}
          {#each activeLogs as log}
            <LogItem {log} />
          {/each}
        {/if}
      </div>
    {:else if state.view == 'stats'}
      <div class="stats p-2">
        <ActivePersonStats />
      </div>
    {/if}
  </main>

  <footer slot="footer" class="n-row w-100">
    {#if state.view == 'edit'}
      <button class="btn btn-block btn-secondary" on:click={saveActivePerson}>
        Save Changes
      </button>
    {/if}
  </footer>

</Modal>
