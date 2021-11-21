<script>
  import { Lang } from '../../store/lang'
  import Storage from '../../modules/storage/storage'
  import NStepper from '../../components/stepper/stepper.svelte'
  import NIcon from '../../components/icon/icon.svelte'
  import { Interact } from '../../store/interact'
  import nid from '../../modules/nid/nid'
  import Button from '../button/button.svelte'
  import { ChevronLeft, ChevronRight, X } from 'svelte-hero-icons'

  export let tips = []
  export let className = ''

  let hiddenTips = Storage.local.get('hidden-tips') || []

  let id = null
  let show = false

  const state = {
    activeTip: 0,
  }

  $: if (tips) {
    id = nid(JSON.stringify(tips))
    show = hiddenTips.indexOf(id) == -1
  } else {
    show = false
  }

  async function hideTips() {
    let confirmed = await Interact.confirm('Hide Tips?')
    if (confirmed) {
      hiddenTips.push(id)
      Storage.local.put('hidden-tips', hiddenTips)
      show = false
    }
  }

  function nextTip() {
    if (state.activeTip == tips.length - 1) {
      state.activeTip = 0
    } else {
      state.activeTip++
    }
  }
  function previousTip() {
    if (state.activeTip == 0) {
      state.activeTip = tips.length - 1
    } else {
      state.activeTip--
    }
  }
</script>

<style lang="postcss">
  .n-tip-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  .btn-close {
    position: relative;
    top: auto;
    bottom: auto;
    left: auto;
    right: auto;
    width: 14px;
    height: 14px;
    background-color: transparent;
    box-shadow: none;
  }
  .n-tips {
    margin: 16px;
    width: 100%;
    max-width: 400px;
    padding: 16px 0;
    flex-grow: 1;
    position: relative;
    border-radius: 6px;
  }
  .n-tips .tip {
    text-align: center;
  }
</style>

{#if show}
  <section class="n-tip-wrapper bg-blue-500 text-white px-4 {className} relative">
    <Button className="px-2 opacity-60" title="PrviousTip Tip" color="clear" icon on:click={previousTip}>
      <NIcon icon={ChevronLeft} size={42} className="text-white" />
    </Button>
    <div
      class="n-tips mx-auto bg-solid rounded-md p-2"
      style="max-width:280px;">

      <div class="flex mb-2 px-4">
        <div class="tip filler text-base leading-tight">
          <strong>Tip #{state.activeTip + 1}</strong>
          {tips[state.activeTip]}
        </div>
      </div>

      <nav class="flex px-2 items-center justify-center" aria-label="Navigate the Nomie tips">

        <NStepper steps={tips.length} current={state.activeTip} />
        <Button title="Hide Tips" color="clear" icon on:click={hideTips}>
          <NIcon icon={X} size={18} className="text-white" />
        </Button>

      </nav>

    </div>
    <Button className="px-2 opacity-60" title="Next Tip" color="clear" icon on:click={nextTip}>
      <NIcon icon={ChevronRight} size={42} className="text-white" />
    </Button>
  </section>
{/if}
