<script>
  import { Lang } from "../../store/lang";
  import { UserStore } from "../../store/user-store";
  import dayjs from "dayjs";
  import Text from "../../components/text/text.svelte";
  import Button from "../../components/button/button.svelte";

  const state = {
    theme: "auto",
  };
</script>

<section class="slide slide-time-format">
  <div class="top center-grow pt-3">
    <Text size="md" bold className="mb-2">{Lang.t('setup.choose-first-day-of-week', `Pick first day of the week`)}</Text>
    <Button
      className="btn-block my-3 btn btn-content {$UserStore.meta.firstDayOfWeek === '1' ? 'active' : ''}"
      on:click={() => {
        $UserStore.meta.firstDayOfWeek = '1';
        UserStore.saveMeta();
      }}>
      <div class="text-lg">{Lang.t('settings.sunday')}</div>
    </Button>
    <Button
      className="btn-block my-3 btn btn-content {$UserStore.meta.firstDayOfWeek === '2' ? 'active' : ''}"
      on:click={() => {
        $UserStore.meta.firstDayOfWeek = '2';
        UserStore.saveMeta();
      }}>
      <div class="text-lg">{Lang.t('settings.monday')}</div>
    </Button>

  </div>

</section>
