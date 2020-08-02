<script>
  import { Lang } from "../../store/lang";
  import { UserStore } from "../../store/user-store";

  const state = {
    theme: "auto",
  };
</script>

<section class="slide slide-theme">
  <div class="top center-grow pt-3">

    <h1 class="mt-4">{Lang.t('setup.choose-theme', `Choose your Theme`)}</h1>
    <button
      class="btn-block my-3 btn btn-content {state.theme == 'light' ? 'active' : ''}"
      on:click={() => {
        UserStore.setTheme('light');
        state.theme = 'light';
      }}>
      <div class="text-lg">Light</div>
    </button>
    <button
      class="btn-block my-3 btn btn-content {state.theme == 'dark' ? 'active' : ''}"
      on:click={() => {
        UserStore.setTheme('dark');
        state.theme = 'dark';
      }}>
      <div class="text-lg">Dark</div>
    </button>
    <button
      class="btn-block my-3 btn btn-content {state.theme == 'auto' ? 'active' : ''}"
      on:click={() => {
        UserStore.setTheme('auto');
        state.theme = 'auto';
      }}>
      <div class="text-lg">Automatic</div>
    </button>
  </div>

</section>
