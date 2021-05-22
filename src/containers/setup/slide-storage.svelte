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
    <Text size="xxl" className="mb-4 text-3xl" bold>{Lang.t('setup.data-location', `Data Storage`)}</Text>

    <Text size="sm" className="leading-6 mb-4" center>
      <strong>⚠️ Data is stored only on this device.</strong>
      It is critical that you back up your data (Nomie will try and remind you). If you don't, data on your phone may be lost if Apple or
      Google needs to free up space.
    </Text>
    <Button
      className="mb-2"
      block
      size="lg"
      delay={20}
      color={$UserStore.storageType == 'local' ? 'primary' : 'light'}
      on:click={() => {
        UserStore.setStorage('local');
      }}
    >
      {Lang.t('general.I_Understand', 'I understand')}
    </Button>

    <!-- <hr class="divider my-3 w-100" />

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
    </Text> -->

  </div>

</section>
