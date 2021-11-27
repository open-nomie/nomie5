<script>
  import { Lang } from '../../store/lang'
  import { UserStore } from '../../store/user-store'
  import dayjs from 'dayjs'
  import Text from '../../components/text/text.svelte'
  import Button from '../../components/button/button.svelte'
</script>

<section class="slide slide-time-format">
  <div class="pt-3 mx-auto top center-grow" style="width:300px;">
    <h1 class="mb-4 text-2xl font-bold text-center dark:text-white">
      {Lang.t('setup.choose-first-day-of-week', `Pick first day of the week`)}
    </h1>

    <Button
      className="mb-3"
      block
      type="clear"
      size="lg"
      delay={20}
      color={$UserStore.meta.firstDayOfWeek === '1' ? 'primary' : ''}
      on:click={() => {
        $UserStore.meta.firstDayOfWeek = '1'
        UserStore.saveMeta()
      }}>
      {`${Lang.t('settings.sunday', 'Sunday')}`}
    </Button>
    <Button
      className="mb-3"
      block
      type="clear"
      size="lg"
      delay={20}
      color={$UserStore.meta.firstDayOfWeek === '2' ? 'primary' : ''}
      on:click={() => {
        $UserStore.meta.firstDayOfWeek = '2'
        UserStore.saveMeta()
      }}>
      {`${Lang.t('settings.monday', 'Monday')}`}
    </Button>
  </div>

</section>
