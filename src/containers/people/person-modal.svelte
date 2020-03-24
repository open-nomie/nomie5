<script>
  import Modal from "../../components/modal/modal.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NInput from "../../components/input/input.svelte";
  import { Interact } from "../../store/interact.js";
  import { PeopleStore } from "../../store/people-store.js";
  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import PersonCheckin from "./person-check-in.svelte";
  import Dymoji from "../../components/dymoji/dymoji.svelte";
  import tick from "../../utils/tick/tick";
  import LogItem from "../../components/list-item-log/list-item-log.svelte";
  import FrappeChart from "../../components/charts/frappe.svelte";
  import html2canvas from "html2canvas";
  import domtoimage from "dom-to-image-chrome-fix";
  import Person from "../../modules/person/person";

  let domVisible = false;

  let avatarBase64 = null;

  let activePerson;
  let lastActivePersonKey;

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

  // $: if (avatarBase64) {
  //   getAvatarImage(avatarBase64).then(smallAvatar64 => {
  //     activePerson.setAvatar(smallAvatar64);
  //     document.body.removeChild(document.getElementById("photo-holder"));
  //   });
  // }

  const saveActivePerson = async () => {
    try {
      await PeopleStore.savePerson(activePerson);
      Interact.toast("Saved");
    } catch (e) {
      Interact.alert("Error", e.message);
    }
  };

  const getAvatarImage = async imageBase64 => {
    let wrapper = document.createElement("div");
    wrapper.id = "photo-holder";
    wrapper.style.width = "100px";
    wrapper.style.height = "100px";
    // wrapper.style.backgroundImage = `url(${imageBase64})`;
    // wrapper.style.backgroundSize = "cover";
    // wrapper.style.backgroundRepeat = "no-repeat";
    // wrapper.style.backgroundPosition = "center center";
    wrapper.style.position = "fixed";
    wrapper.style.bottom = "10px";
    wrapper.style.left = "10px";
    wrapper.style.zIndex = 3000;
    wrapper.style.overflow = "hidden";

    let image = document.createElement("img");
    image.src = imageBase64;
    image.style.width = "100%";
    image.style.height = "auto";
    wrapper.appendChild(image);

    document.body.appendChild(wrapper);

    try {
      await tick(400);
      let canvas = await html2canvas(wrapper, { width: 90, height: 90 });
      let avatar64 = canvas.toDataURL("image/jpeg", 0.2);
      return avatar64;
    } catch (e) {
      console.log("Error", e);
      return null;
    }
  };

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

  const selectPhoto = async evt => {
    const toBase64 = file =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

    let input = evt.target;
    let files = evt.target.files;
    avatarBase64 = await toBase64(files[0]);
    let smallAvatar64 = await getAvatarImage(avatarBase64);
    document.body.removeChild(document.getElementById("photo-holder"));
    await tick(10);
    activePerson.avatar = smallAvatar64;
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
            class="form-control"
            id="avatarFileInput"
            placeholder="Avatar"
            type="file"
            accept="png,jpeg,jpg"
            on:change={selectPhoto} />
        </NItem>
        <NItem className="text-primary" on:click={saveActivePerson}>
          Save Changes
        </NItem>
        <div class="filler mt-2" />
        <NItem className="text-red">Delete User...</NItem>
      </div>
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
