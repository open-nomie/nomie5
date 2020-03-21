<script>
  import { Lang } from "../../store/lang";
  import Storage from "../../modules/storage/storage";
  import md5 from "md5";
  export let tip = null;
  export let className = "";

  let hiddenTips = Storage.local.get("hidden-tips") || [];

  let id = null;
  let show = false;

  $: if (tip) {
    id = md5(tip);
    show = hiddenTips.indexOf(id) == -1;
  }

  const hideTip = () => {
    hiddenTips.push(id);
    Storage.local.put("hidden-tips", hiddenTips);
    show = false;
  };
</script>

<style lang="scss">
  .tip {
    box-shadow: var(--box-shadow-float);
    max-width: 700px;
    border: solid 1px rgba(155, 155, 155, 0.4);
    padding: 18px;
    font-size: 0.8rem;
    margin: 16px;
    border-radius: 12px;
    text-align: center button {
      width: 120px;
      margin-top: 16px;
    }
  }
</style>

{#if show}
  <div class="tip {className} pulse">
    <div class="text text-inverse">
      {tip}
      <slot />
    </div>
    <div class="n-row">
      <button
        class="btn block w-100 btn-sm mt-2 btn-primary"
        on:click={hideTip}>
        {Lang.t('general.hide-tip', 'Hide Tip')}
      </button>
    </div>
  </div>
{/if}
