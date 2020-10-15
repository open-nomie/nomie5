<script>
  export let className = "";
  export let center = false;
  export let inset = false;
  export let pad = false;
</script>

<style>
  hr.divider {
    margin: 0;
    padding: 0;
    border: none;
    border-top: solid 1px var(--color-grey-7);
    border-bottom: none;
  }
  hr.divider.center {
    margin-left: 24px !important;
    margin-right: 24px !important;
  }
  hr.divider.inset {
    margin-left: 16px;
  }
</style>

<hr class="divider {className} {center ? 'center' : ''} {inset ? 'inset' : ''} {pad ? 'my-3' : ''}" />
