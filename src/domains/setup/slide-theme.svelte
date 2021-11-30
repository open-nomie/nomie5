<script>
  import { Lang } from '../../store/lang'
  import { UserStore } from '../../store/user-store'
  
  import Button from '../../components/button/button.svelte'

  const state = {
    theme: 'auto',
  }
</script>

<section class="slide slide-theme">
  <div class="pt-3 mx-auto top center-grow" style="width:300px;">
    <h1 class="mb-4 text-2xl font-bold text-center dark:text-white">
      {Lang.t('setup.choose-theme', `Choose your Theme`)}
    </h1>
    <Button
      className="mb-3 {state.theme === 'light' ? 'bg-primary-500 text-white font-bold' : 'bg-white dark:bg-black text-primary-600'}"
      block
      size="lg"
      delay={20}
      type="clear"
      on:click={() => {
        UserStore.setTheme('light')
        state.theme = 'light'
      }}>
      Light
    </Button>
    <Button
      className="mb-3 {state.theme === 'dark' ? 'bg-primary-500 text-white font-bold' : 'bg-white dark:bg-black text-primary-600'}"
      delay={20}
      block
      size="lg"
      type="clear"
      on:click={() => {
        UserStore.setTheme('dark')
        state.theme = 'dark'
      }}>
      Dark
    </Button>
    <Button
      className="mb-3 {state.theme === 'auto' ? 'bg-primary-500 text-white font-bold' : 'bg-white dark:bg-black text-primary-600'}"
      delay={20}
      block
      size="lg"
      type="clear"
      on:click={() => {
        UserStore.setTheme('auto')
        state.theme = 'auto'
      }}>
      Automatic
    </Button>
  </div>

</section>
