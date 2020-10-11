<script>
  import { Lang } from "../../store/lang";
  import { UserStore } from "../../store/user-store";
  import NItem from "../../components/list-item/list-item.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import Text from "../../components/text/text.svelte";
  import Button from "../../components/button/button.svelte";

  const state = {
    theme: "auto",
  };
</script>

<section class="slide slide-4 slide-welcome {state.activeSlide === 5 ? 'active' : 'hidden'} {state.transitioning ? 'move' : ''}">
  <div class="top center-grow pt-3 mx-auto" style="width:300px;">
    <Text size="md" bold>{Lang.t('setup.pick-data-storage', `Choose your data's location...`)}</Text>
    <Text size="xs" className="mb-4" faded>You can always change this later.</Text>

    <Button
      className="mb-2"
      block
      size="lg"
      delay={20}
      color={$UserStore.storageType == 'local' ? 'primary' : 'light'}
      on:click={() => {
        UserStore.setStorage('local');
      }}>
      {Lang.t('storage.local_title', 'This Device Only')}
    </Button>
    <Text size="xs" faded className="" center>
      Stored on this device only. Good for playing around, but if you're serious - use the blockstack option.
    </Text>

    <hr class="divider my-3 w-100" />

    <Button
      className="mb-2"
      block
      size="lg"
      delay={20}
      color={$UserStore.storageType == 'blockstack' ? 'primary' : 'light'}
      on:click={() => {
        UserStore.setStorage('blockstack');
      }}>
      Encrypted in the Cloud
    </Button>
    <Text size="xs" faded center>
      Multiple device support with end-to-end encryption, using a free
      <strong>
        <a href="https://blockstack.com" target="_blank">Blockstack</a>
      </strong>
      account
    </Text>

  </div>

</section>
