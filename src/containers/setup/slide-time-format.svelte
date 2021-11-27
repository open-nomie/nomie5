<script>
  import { Lang } from '../../store/lang'
  import { UserStore } from '../../store/user-store'
  import dayjs from 'dayjs'
  import Text from '../../components/text/text.svelte'
  import Button from '../../components/button/button.svelte'

  const state = {
    theme: 'auto',
  }
</script>

<section class="slide slide-time-format">
  <div class="pt-3 mx-auto top center-grow" style="width:300px;">
    <h1 class="mb-4 text-2xl font-bold text-center dark:text-white">
      {Lang.t('setup.choose-time-format', `Which time looks right?`)}
    </h1>

    <Button
      className="mb-3"
      block
      size="lg"
      type="clear"
      delay={20}
      color={!$UserStore.meta.is24Hour ? 'primary' : ''}
      on:click={() => {
        $UserStore.meta.is24Hour = false
        UserStore.saveMeta()
      }}>
      {dayjs().format('h:mm a')}
    </Button>
    <Button
      className="mb-3 "
      type="clear"
      block
      size="lg"
      delay={20}
      color={$UserStore.meta.is24Hour ? 'primary' : ''}
      on:click={() => {
        $UserStore.meta.is24Hour = true
        UserStore.saveMeta()
      }}>
      {dayjs().format('HH:mm')}
    </Button>
  </div>

</section>
