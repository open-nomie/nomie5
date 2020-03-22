<script>
  export let label = undefined;
  export let value = undefined;
  // export let color = undefined;
  export let emoji = undefined;
</script>

<style lang="scss" type="text/scss">
  @import "../../scss/utils/__utils.scss";
  .n-tag-badge {
    display: inline-flex;
    align-items: center;
    background-color: #fff;
    box-shadow: 0px 3px 5px -2px rgba(0, 0, 0, 0.1);
    border: solid 1px rgba($primaryBright, 0.2);
    color: $primaryBright;
    padding-left: 6px;
    padding-right: 2px;
    border-radius: 20px;
    margin-right: 6px;
    line-height: 15px;
  }
  .n-tag-badge .value {
    display: inline-block;
    padding: 2px 4px 2px;
    background-color: rgba(255, 255, 255, 0.2);
    min-width: 20px;
    border-radius: 20px;
    text-align: center;
    margin-left: 4px;
  }
  .n-tag-badge .emoji {
    margin-right: 3px;
    opacity: 0.7;
  }
</style>

<div class="n-tag-badge badge badge-sm">
  {#if emoji}
    <div class="emoji">{emoji}</div>
  {/if}
  <div class="label">{label}</div>
  <div class="value">{value}</div>
</div>
