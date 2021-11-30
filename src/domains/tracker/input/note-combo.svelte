<script lang="ts">
  import LetterTicker from '../../../components/letter-ticker/letter-ticker.svelte'
  import { createEventDispatcher, onMount } from 'svelte'
  import Text from '../../../components/text/text.svelte'
  import type TrackerConfig from '../../../modules/tracker/tracker'

  export let min = '0'
  export let max = '10'
  export let value = '5'
  export let tracker: TrackerConfig = undefined

  let tempValue
  $: tempValue = value

  const dispatch = createEventDispatcher()
  w
  async function main() {
    // Trigger the change so the parent catches it.
    if (tempValue) {
      dispatch('change', parseInt(tempValue))
    }
  }

  onMount(main)
</script>

<style lang="postcss">

</style>

<div class="h-full tracker-input-combo">Combo</div>
