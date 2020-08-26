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
  <div class="top center-grow pt-3">

    <Text size="md" bold className="mb-2">{Lang.t('setup.choose-theme', `Choose your Theme`)}</Text>
    <Button
      delay={20}
      className="btn-block my-3 btn btn-content {state.theme == 'light' ? 'active' : ''}"
      on:click={() => {
        UserStore.setTheme('light');
        state.theme = 'light';
      }}>
      <div class="text-lg">Light</div>
    </Button>
    <Button
      delay={20}
      className="btn-block my-3 btn btn-content {state.theme == 'dark' ? 'active' : ''}"
      on:click={() => {
        UserStore.setTheme('dark');
        state.theme = 'dark';
      }}>
      <div class="text-lg">Dark</div>
    </Button>
    <Button
      delay={20}
      className="btn-block my-3 btn btn-content {state.theme == 'auto' ? 'active' : ''}"
      on:click={() => {
        UserStore.setTheme('auto');
        state.theme = 'auto';
      }}>
      <div class="text-lg">Automatic</div>
    </Button>
  </div>

</section>
