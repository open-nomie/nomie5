<script>
  import { Lang } from "../../store/lang";
  import { UserStore } from "../../store/user-store";
  import dayjs from "dayjs";
  import Text from "../../components/text/text.svelte";
  import Button from "../../components/button/button.svelte";
</script>

<section class="slide slide-time-format">
  <div class="top center-grow pt-3 mx-auto" style="width:300px;">
    <Text size="md" bold className="mb-4">{Lang.t('setup.choose-first-day-of-week', `Pick first day of the week`)}</Text>
    <Button
      className="mb-3"
      block
      size="lg"
      delay={20}
      color={$UserStore.meta.firstDayOfWeek === '1' ? 'primary' : 'light'}
      on:click={() => {
        $UserStore.meta.firstDayOfWeek = '1';
        UserStore.saveMeta();
      }}>
      {`${Lang.t('settings.sunday', 'Sunday')}`}
    </Button>
    <Button
      className="mb-3"
      block
      size="lg"
      delay={20}
      color={$UserStore.meta.firstDayOfWeek === '2' ? 'primary' : 'light'}
      on:click={() => {
        $UserStore.meta.firstDayOfWeek = '2';
        UserStore.saveMeta();
      }}>
      {`${Lang.t('settings.monday', 'Monday')}`}
    </Button>
  </div>

</section>
