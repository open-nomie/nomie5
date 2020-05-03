<script>
  import { Lang } from "../../store/lang";
  import { UserStore } from "../../store/user";
  import dayjs from "dayjs";

  const state = {
    theme: "auto"
  };
</script>

<section class="slide slide-time-format">
  <div class="top center-grow pt-3">

    <h1 class="mt-4">
      {Lang.t('setup.choose-time-format', `Choose Time Format`)}
    </h1>
    <button
      class="btn-block my-3 btn btn-content {$UserStore.meta.is24Hour ? 'active' : ''}"
      on:click={() => {
        $UserStore.meta.is24Hour = true;
        UserStore.saveMeta();
      }}>
      <div class="text-lg">{dayjs().format('HH:mm')}</div>
    </button>
    <button
      class="btn-block my-3 btn btn-content {!$UserStore.meta.is24Hour ? 'active' : ''}"
      on:click={() => {
        $UserStore.meta.is24Hour = false;
        UserStore.saveMeta();
      }}>
      <div class="text-lg">{dayjs().format('h:mm a')}</div>
    </button>
  </div>

</section>
