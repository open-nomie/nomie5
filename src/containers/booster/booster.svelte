<script lang="ts">
  import { onMount } from "svelte";
  import Button from "../../components/button/button.svelte";
  import Text from "../../components/text/text.svelte";

  let ready = false;
  let purch;
  let level = null;

  async function main() {
    if (window["$purch"]) {
      purch = window["$purch"];
      ready = true;
    }
  }

  onMount(main);
</script>

{#if ready}
  <div class="n-list solo p-3">
    {#if !level}
      <Text bold className="mb-1">Nomie Booster</Text>
      <Text size="sm" faded>By supporting becoming a Booster, you support me in the continual development of Nomie.</Text>
      <Button className="mt-3" block on:click={purch.ui.toggle('available')}>Become a Booster</Button>
    {:else}
      <div class="booster-contaienr">Booster {level} !!</div>
    {/if}
  </div>
{/if}
