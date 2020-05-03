<script>
  // Components
  import Modal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NInput from "../../components/input/input.svelte";
  import NLogListLoader from "../../components/log-list/log-list-loader.svelte";
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NToolbarGrid from "../../components/toolbar/toolbar-grid.svelte";
  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import Dymoji from "../../components/dymoji/dymoji.svelte";
  import LogItem from "../../components/list-item-log/list-item-log.svelte";
  import BarChart from "../../components/charts/bar-chart.svelte";

  // Container Items
  import PersonCheckin from "./person-check-in.svelte";

  // Modules / Utils
  import tick from "../../utils/tick/tick";
  import Person from "../../modules/person/person";

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

  const state = {
    view: "check-in"
  };

  async function deleteUser() {
    let confirmed = await Interact.confirm(
      `Remove ${activePerson.username}?`,
      "This only deletes them from your list, NO log data will be deleted."
    );
    if (confirmed) {
      await PeopleStore.deletePerson(activePerson);
      Interact.toast(`${activePerson.username} removed`);
      close();
    }
  }

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

  async function loadActiveLogs() {
    let active = $Interact.people.active;
    activePerson = new Person($PeopleStore.people[active]);
    activeLogs = await LedgerStore.queryPerson(
      active,
      dayjs().subtract(1, "year"),
      dayjs()
    );
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
  }
</script>

<style lang="scss">
  .file-input-wraper {
    height: 1px;
    overflow: hidden;
  }
  :global(.person-checkin .btn-group .active div) {
    font-size: 2rem !important;
  }
</style>

<Modal
  className="person-modal"
  bodyClass="bg-solid-1"
  show={domVisible}
  type="bottom-slideup">
  <header class="w-100" slot="header" on:swipedown={close}>
    <NToolbarGrid>
      <button
        slot="left"
        class="btn btn-clear btn-icon tap-icon"
        on:click={close}>
        <NIcon name="close" />
      </button>
      <div class="main">
        <div class="n-row">
          <Dymoji person={activePerson} size={26} radius={0.3} />
          &nbsp; {activePerson.getDisplayName()}
        </div>
      </div>
      <button
        slot="right"
        class="btn btn-sm tap-icon"
        on:click={() => {
          close();
          Interact.openStats(`@${activePerson.getUsername()}`);
        }}>
        <NIcon name="chart" size="22" />
      </button>

    </NToolbarGrid>
    <NToolbar>
      <ButtonGroup
        size="sm"
        buttons={[{ label: 'Logs', active: state.view === 'logs', click() {
              changeView('logs');
            } }, { label: 'Check-In', active: state.view === 'check-in', click() {
              changeView('check-in');
            } }, { label: 'Edit', active: state.view === 'edit', click() {
              changeView('edit');
            } }]} />
    </NToolbar>
  </header>

  <main>
    {#if state.view == 'check-in'}
      <PersonCheckin on:checkedIn={close} />
    {:else if state.view == 'edit'}
      <div class="edit p-3">

        <NItem className="bg-transparent">
          <NInput
            type="text"
            placeholder="Display Name"
            bind:value={activePerson.displayName} />
        </NItem>

        <NItem className="bg-transparent">
          <NInput
            type="textarea"
            placeholder="Notes"
            bind:value={activePerson.notes} />
        </NItem>

        <NItem className="bg-transparent">
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

          <button
            class="btn btn-fill btn-light btn-block"
            on:click={() => {
              document.getElementById('avatarFileInput').click();
            }}>
            Select Photo...
          </button>
          <div class="file-input-wraper">
            <input
              class="form-control pb-2"
              id="avatarFileInput"
              placeholder="Avatar"
              type="file"
              accept="png,jpeg,jpg"
              on:change={selectPhoto} />
          </div>

        </NItem>

        <NItem className="bg-transparent">
          <button
            class="btn btn-block btn-secondary my-4"
            on:click={saveActivePerson}>
            Save @{activePerson.username}
          </button>
        </NItem>

        <NItem
          className="bg-transparent text-red text-sm text-center"
          on:click={deleteUser}>
          Delete @{activePerson.username}...
        </NItem>
      </div>
    {:else if state.view == 'logs'}
      <NLogListLoader compact term={`@${activePerson.username}`} />
    {/if}
  </main>

</Modal>
