<script lang="ts">
  import { tokenize } from 'nomie-utils'

  export let str = undefined
  export let titleClass = ''
  export let className = ''

  let tokenized
  let label = ''
  let meta = ''

  let lastStr
  $: if (str !== lastStr) {
    lastStr = str
    tokenized = tokenize(str)
    label = tokenized
      .filter((t) => {
        return t.type == 'generic'
      })
      .map((t) => {
        return t.raw
      })
      .join(' ')
      .trim()

    meta = tokenized
      .filter((t) => {
        return t.type !== 'generic'
      })
      .map((t) => {
        return t.raw
      })
      .join(' ')
      .trim()
  }
</script>

<style>
  .label {
    font-weight: bold;
  }
</style>

<div class="n-label-meta flex {className}">

  {#if meta.length && label.length}
    <div class="title {titleClass}">{meta}</div>
  {:else if meta.length}
    <div class="title {titleClass}">{meta}</div>
  {/if}
  {#if label.length}
    <div class="filler" />
    <div class="label mr-2 {titleClass}">{label}</div>
  {/if}

</div>
