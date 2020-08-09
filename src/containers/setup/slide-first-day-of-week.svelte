<script>
  import { Lang } from "../../store/lang";
  import { UserStore } from "../../store/user-store";
  import dayjs from "dayjs";

  const state = {
    theme: "auto",
  };
</script>

<section class="slide slide-time-format">
  <div class="top center-grow pt-3">

    <h1 class="mt-4">{Lang.t('setup.choose-first-day-of-week', `What's the first day of the week?`)}</h1>
    <button
      class="btn-block my-3 btn btn-content {$UserStore.meta.firstDayOfWeek === '1' ? 'active' : ''}"
      on:click={() => {
        $UserStore.meta.firstDayOfWeek = '1';
        UserStore.saveMeta();
      }}>
      <div class="text-lg">{Lang.t('settings.sunday')}</div>
    </button>
    <button
      class="btn-block my-3 btn btn-content {$UserStore.meta.firstDayOfWeek === '2' ? 'active' : ''}"
      on:click={() => {
        $UserStore.meta.firstDayOfWeek = '2';
        UserStore.saveMeta();
      }}>
      <div class="text-lg">{Lang.t('settings.monday')}</div>
    </button>

  </div>

</section>
