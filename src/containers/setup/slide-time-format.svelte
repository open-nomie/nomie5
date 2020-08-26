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
    <Text size="md" bold className="mb-2">{Lang.t('setup.choose-time-format', `Which time looks right?`)}</Text>
    <Button
      className="btn-block my-3 btn btn-content {$UserStore.meta.is24Hour ? 'active' : ''}"
      on:click={() => {
        $UserStore.meta.is24Hour = true;
        UserStore.saveMeta();
      }}>
      <div class="text-lg">{dayjs().format('HH:mm')}</div>
    </Button>
    <Button
      className="btn-block my-3 btn btn-content {!$UserStore.meta.is24Hour ? 'active' : ''}"
      on:click={() => {
        $UserStore.meta.is24Hour = false;
        UserStore.saveMeta();
      }}>
      <div class="text-lg">{dayjs().format('h:mm a')}</div>
    </Button>
  </div>

</section>
