<script>
  import { Lang } from "../../store/lang";
  import { UserStore } from "../../store/user-store";
  import NItem from "../../components/list-item/list-item.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import Text from "../../components/text/text.svelte";

  const state = {
    theme: "auto",
  };
</script>

<section class="slide slide-4 slide-welcome {state.activeSlide === 5 ? 'active' : 'hidden'} {state.transitioning ? 'move' : ''}">
  <div class="top center-grow">
    <Text size="md" bold className="mb-2">{Lang.t('setup.pick-data-storage', `Choose your data's location...`)}</Text>

    <button
      class=" btn btn-content {$UserStore.storageType == 'local' ? 'active' : ''}"
      on:click={() => {
        UserStore.setStorage('local');
      }}>
      <Text lineHeightMd bold>{Lang.t('storage.local_title', 'This Device Only')}</Text>
      <Text size="xs" faded className="">Stored unencrypted ONLY on this device.</Text>
    </button>
    <button
      class="btn btn-content {$UserStore.storageType == 'blockstack' ? 'active' : ''}"
      on:click={() => {
        UserStore.setStorage('blockstack');
      }}>
      <Text lineHeightMd bold>Encrypted in the Cloud</Text>
      <Text size="xs" faded>
        Multiple device support with end-to-end encryption
        <strong>by Blockstack.</strong>
      </Text>

    </button>
    <p class="text-faded-3 mt-2">
      You can always change this later.
      <br />
      <a href="https://blockstack.com" target="_blank">Learn more about Blockstack</a>
    </p>
  </div>

</section>
