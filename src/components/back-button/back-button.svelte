<script>
  import { createEventDispatcher } from 'svelte'
  import { navigate } from 'svelte-routing'

  import NIcon from '../../components/icon/icon.svelte'
  import { Device } from '../../store/device-store'
  import { Lang } from '../../store/lang'
  import Button from '../button/button.svelte'

  export let to = undefined
  export let back = undefined

  const dispatch = createEventDispatcher()
  const onClick = (event) => {
    if (back) {
      back(event)
    } else if (to) {
      navigate(to)
    } else {
      history.back()
    }
    dispatch('click', event)
  }
</script>

<Button
  shape={$Device.width < 399 ? 'nbtn-icon circle' : 'clear'}
  icon={$Device.width < 399}
  on:click={onClick}>
  <NIcon name="arrowBack" className="fill-primary-bright" />
  {#if $Device.width > 400}
    <span class="ml-2 text-primary-bright">
      {Lang.t('general.back', 'Back')}
    </span>
  {/if}
</Button>
