<script>
  import { Lang } from "../../store/lang";
  import Storage from "../../modules/storage/storage";
  import NStepper from "../../components/stepper/stepper.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import { Interact } from "../../store/interact";
  import md5 from "md5";
  export let tips = [];
  export let className = "";

  let hiddenTips = Storage.local.get("hidden-tips") || [];

  let id = null;
  let show = false;

  const state = {
    activeTip: 0,
  };

  $: if (tips) {
    id = md5(JSON.stringify(tips));
    show = hiddenTips.indexOf(id) == -1;
  } else {
    show = false;
  }

  async function hideTips() {
    let confirmed = await Interact.confirm("Hide Tips?");
    if (confirmed) {
      hiddenTips.push(id);
      Storage.local.put("hidden-tips", hiddenTips);
      show = false;
    }
  }

  function nextTip() {
    if (state.activeTip == tips.length - 1) {
      state.activeTip = 0;
    } else {
      state.activeTip++;
    }
  }
  function previousTip() {
    if (state.activeTip == 0) {
      state.activeTip = tips.length - 1;
    } else {
      state.activeTip--;
    }
  }
</script>

<style lang="scss">
  .n-tip-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: 0 16px;
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
    // background-color: var(--color-solid);
    // box-shadow: var(--box-shadow-float);

    .tip {
      font-size: 0.8rem;
      line-height: 1.2rem;
      text-align: center;
      color: var(--color-inverse-2);
    }
  }
</style>

{#if show}
  <section class="n-tip-wrapper {className}">
    <div class="n-tips">
      <div class="n-row mb-2">

        <button class="btn btn-clear btn-icon tap-icon" on:click={previousTip}>
          <NIcon name="chevronLeft" />
        </button>
        <div class="tip filler">TIP #{state.activeTip + 1}: {tips[state.activeTip]}</div>
        <div class="d-flex flex-row arrows">
          <button class="btn btn-clear btn-icon tap-icon" on:click={nextTip}>
            <NIcon name="chevronRight" />
          </button>
        </div>
      </div>
      <div style="max-width:150px" class="mx-auto n-row">
        <NStepper steps={tips.length} current={state.activeTip} dark />
        <button class="btn-close text-lg flex-grow-off" on:click={hideTips}>
          <NIcon name="close" size="9" />
        </button>
      </div>
    </div>
  </section>
{/if}
