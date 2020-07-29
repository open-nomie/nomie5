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

    <Text bold className="mb-1">Nomie Booster</Text>
    <Text size="sm" faded>By supporting becoming a Booster, you support me in the continual development of Nomie.</Text>
    {#if !level}
      <Button className="mt-3" block on:click={purch.ui.toggle('available')}>Become a Booster</Button>
      <div class="text-center p-3">
        <Text size="sm" style="text-decoration:underline;" on:click={purch.ui.open}>Restore Purchases</Text>
      </div>
    {:else}
      <div class="booster-contaienr">Booster {level} !!</div>
    {/if}
  </div>
{/if}
