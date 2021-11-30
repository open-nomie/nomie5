<script>
  import { Lang } from '../../store/lang'
  import { UserStore } from '../../store/user-store'
  import Button from '../../components/button/button.svelte'
</script>

<section class="slide slide-time-format">
  <div class="pt-3 mx-auto top center-grow" style="width:300px;">
    <h1 class="mb-4 text-2xl font-bold text-center dark:text-white">
      {Lang.t('setup.choose-first-day-of-week', `Pick first day of the week`)}
    </h1>

    <Button
      className="mb-3 {$UserStore.meta.firstDayOfWeek === '1' ? 'bg-primary-500 text-white font-bold' : 'bg-white dark:bg-black text-primary-600'}"
      block
      type="clear"
      size="lg"
      delay={20}
      on:click={() => {
        $UserStore.meta.firstDayOfWeek = '1'
        UserStore.saveMeta()
      }}>
      {`${Lang.t('settings.sunday', 'Sunday')}`}
    </Button>
    <Button
      className="mb-3 {$UserStore.meta.firstDayOfWeek === '2' ? 'bg-primary-500 text-white font-bold' : 'bg-white dark:bg-black text-primary-600'}"
      block
      type="clear"
      size="lg"
      delay={20}
      on:click={() => {
        $UserStore.meta.firstDayOfWeek = '2'
        UserStore.saveMeta()
      }}>
      {`${Lang.t('settings.monday', 'Monday')}`}
    </Button>
  </div>

</section>
