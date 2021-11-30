<script>
  import { Lang } from '../../store/lang'
  import { UserStore } from '../../store/user-store'
  import Text from '../../components/text/text.svelte'
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
      className="mb-3 {state.theme === 'light' ? 'bg-primary-600' : 'bg-white text-primary-600 dark:bg-black dark:text-white'}"
      block
      size="lg"
      delay={20}
      color={state.theme == 'light' ? 'primary' : ''}
      on:click={() => {
        UserStore.setTheme('light')
        state.theme = 'light'
      }}>
      Light
    </Button>
    <Button
      className="mb-3 {state.theme === 'dark' ? 'bg-primary-600' : 'bg-white text-primary-600 dark:bg-black dark:text-white'}"
      delay={20}
      block
      size="lg"
      color={state.theme == 'dark' ? 'primary' : ''}
      on:click={() => {
        UserStore.setTheme('dark')
        state.theme = 'dark'
      }}>
      Dark
    </Button>
    <Button
      className="mb-3 {state.theme === 'auto' ? 'bg-primary-600' : 'bg-white text-primary-600 dark:bg-black dark:text-white'}"
      delay={20}
      block
      size="lg"
      color={state.theme == 'auto' ? 'primary' : ''}
      on:click={() => {
        UserStore.setTheme('auto')
        state.theme = 'auto'
      }}>
      Automatic
    </Button>
  </div>

</section>
