<script>
  import { Lang } from '../../store/lang'
  import { UserStore } from '../../store/user-store'
  import NItem from '../../components/list-item/list-item.svelte'
  import NIcon from '../../components/icon/icon.svelte'
  import Text from '../../components/text/text.svelte'
  import Button from '../../components/button/button.svelte'

  const state = {
    theme: 'auto',
  }
</script>

<section
  class="slide slide-4 slide-welcome {state.transitioning ? 'move' : ''}">
  <div class="pt-3 mx-auto text-center top center-grow" style="width:300px;">

    <h1 class="mb-4 text-2xl font-bold text-center dark:text-white">
      {Lang.t('setup.data-location', `Data Storage`)}
    </h1>

    <p class="mb-4 text-sm leading-snug text-gray-800 dark:text-gray-200">
      <strong>⚠️ WARNING: Data is stored only on this device.</strong>
      It is critical that you back up your data (Nomie will try and remind you).
      If you don't, data on your phone may be lost if Apple or Google needs to
      free up space.
    </p>
    <Button
      className="mb-2"
      block
      size="lg"
      delay={20}
      color={$UserStore.storageType == 'local' ? 'primary' : 'light'}
      on:click={() => {
        UserStore.setStorage('local')
        window.location.href = '/'
      }}>
      {Lang.t('general.I_Understand', 'I understand')}
    </Button>

    <!-- <hr class="my-3 divider w-100" />

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
