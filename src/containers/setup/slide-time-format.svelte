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
  <div class="top center-grow pt-3 mx-auto" style="width:300px;">
    <Text size="md" bold className="mb-4">{Lang.t('setup.choose-time-format', `Which time looks right?`)}</Text>
    <Button
      className="mb-3"
      block
      size="lg"
      delay={20}
      color={$UserStore.meta.is24Hour ? 'primary' : 'light'}
      on:click={() => {
        $UserStore.meta.is24Hour = true;
        UserStore.saveMeta();
      }}>
      {dayjs().format('HH:mm')}
    </Button>
    <Button
      className="mb-3"
      block
      size="lg"
      delay={20}
      color={!$UserStore.meta.is24Hour ? 'primary' : 'light'}
      on:click={() => {
        $UserStore.meta.is24Hour = false;
        UserStore.saveMeta();
      }}>
      {dayjs().format('h:mm a')}
    </Button>
  </div>

</section>
