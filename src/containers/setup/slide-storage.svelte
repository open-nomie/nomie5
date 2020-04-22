<script>
  import { Lang } from "../../store/lang";
  import { UserStore } from "../../store/user";
  import NItem from "../../components/list-item/list-item.svelte";
  import NIcon from "../../components/icon/icon.svelte";

  const state = {
    theme: "auto"
  };
</script>

<section
  class="slide slide-4 slide-welcome {state.activeSlide === 5 ? 'active' : 'hidden'}
  {state.transitioning ? 'move' : ''}">
  <div class="top center-grow">

    <h1 class="mt-4">
      {Lang.t('setup.pick-data-storage', `Choose your data's location...`)}
    </h1>
    <button
      class=" btn btn-content {$UserStore.storageType == 'local' ? 'active' : ''}"
      on:click={() => {
        UserStore.setStorage('local');
      }}>
      <div class="text-md font-weight-bold">On this Device Only</div>
      <div class="text-sm" className="">
        Stored unencrypted ONLY on this device.
      </div>
    </button>
    <button
      class="btn btn-content {$UserStore.storageType == 'blockstack' ? 'active' : ''}"
      on:click={() => {
        UserStore.setStorage('blockstack');
      }}>
      <div class="text-md font-weight-bold">Encrypted in the Cloud</div>
      <div class="text-sm">
        Multiple device support with end-to-end encryption
        <strong>by Blockstack.</strong>
      </div>
    </button>
    <p class="text-faded-3">
      You can always change this later.
      <a href="https://blockstack.com" target="_blank">
        Learn more about Blockstack
      </a>
    </p>
  </div>

</section>
