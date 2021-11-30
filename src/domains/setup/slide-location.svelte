<script>
  import { Lang } from '../../store/lang'
  import { UserStore } from '../../store/user-store'
  import NItem from '../../components/list-item/list-item.svelte'
  import NToggle from '../../components/toggle-switch/toggle-switch.svelte'
  import NIcon from '../../components/icon/icon.svelte'
  import Text from '../../components/text/text.svelte'

  const state = {
    theme: 'auto',
  }
</script>

<section class="slide slide-location">
  <div class="pt-3 top center-grow">
    <h1 class="mb-2 text-2xl font-bold text-center dark:text-white">
      {Lang.t('setup.use-location', `Enable Location tracking?`)}
    </h1>
    <p
      class="mx-auto mb-4 text-sm leading-snug text-center text-gray-700 w-80 dark:text-gray-200">
      When enabled, you're geo location will be saved along with your tracked
      data.
    </p>

    <div style="max-width:400px; margin:8pt auto;">
      <NItem className="solo mx-0 w-100">
        <div slot="left">
          <NIcon name="pin" />
        </div>
        Track Location
        <div slot="right" class="ml-2">
          <NToggle
            bind:value={$UserStore.alwaysLocate}
            on:change={(event) => {
              UserStore.setAlwaysLocate(event.detail)
            }} />
        </div>
      </NItem>
    </div>
  </div>

</section>
