<script>
  import { Lang } from "../../store/lang";
  import { UserStore } from "../../store/user-store";
  import Text from "../../components/text/text.svelte";
  import Button from "../../components/button/button.svelte";

  const state = {
    theme: "auto",
  };
</script>

<section class="slide slide-theme">
  <div class="top center-grow pt-3 mx-auto" style="width:300px;">
    <Text size="md" bold className="mb-4">{Lang.t('setup.choose-theme', `Choose your Theme`)}</Text>
    <Button
      className="mb-3"
      block
      size="lg"
      delay={20}
      color={state.theme == 'light' ? 'primary' : 'light'}
      on:click={() => {
        UserStore.setTheme('light');
        state.theme = 'light';
      }}>
      Light
    </Button>
    <Button
      className="mb-3"
      delay={20}
      block
      size="lg"
      color={state.theme == 'dark' ? 'primary' : 'light'}
      on:click={() => {
        UserStore.setTheme('dark');
        state.theme = 'dark';
      }}>
      Dark
    </Button>
    <Button
      className="mb-3"
      delay={20}
      block
      size="lg"
      color={state.theme == 'auto' ? 'primary' : 'light'}
      on:click={() => {
        UserStore.setTheme('auto');
        state.theme = 'auto';
      }}>
      Automatic
    </Button>
  </div>

</section>
