<script lang="ts">
  import { onMount } from "svelte";
  import Button from "../../components/button/button.svelte";
  import Text from "../../components/text/text.svelte";
  import Alertbox from "../../components/alertbox/alertbox.svelte";

  let ready = false;
  let purch;
  let level = null;

  let onChangeListener;

  async function main() {
    if (window["$purch"]) {
      purch = window["$purch"];
      if (!onChangeListener) {
        onChangeListener = purch.onReady((change) => {
          ready = true;
          if (purch.hasTag("level4")) {
            level = 4;
          } else if (purch.hasTag("level3")) {
            level = 3;
          } else if (purch.hasTag("level2")) {
            level = 2;
          } else if (purch.hasTag("level1")) {
            level = 1;
          }
        });
      }
    }
  }

  onMount(main);
</script>

{#if ready}
  <div class="n-list solo p-3">

    {#if !level}
      <Text bold className="mb-1">Nomie Booster</Text>
      <Text size="sm" faded>By becoming a Booster, you support me in the continual development of Nomie.</Text>
      <Button className="mt-3" block on:click={purch.ui.toggle('available')}>Become a Booster</Button>
      <div class="text-center p-3">
        <Text size="sm" style="text-decoration:underline;" on:click={purch.ui.open}>Restore Purchases</Text>
      </div>
    {:else}
      <Text bold className="mb-2">
        Booster L{level}
        {#each Array(level) as count}⭐️{/each}
      </Text>

      <Text size="sm">
        Thank you for your support!
        {#if level >= 0}
          At this level you can
          <a href="support@happydata.org?subject=Feature Request, level-{level}">request specific features.</a>
        {/if}
      </Text>
      <Text size="sm" className="mt-2">
        If you'd like to have some flare on Reddit,
        <a href="support@happydata.org?subject=Booster Flare, level-{level}">Send me a message</a>
      </Text>
    {/if}
    <Text size="xs" faded className="mt-4">
      Powered by Purch, the Private Payment Platform by HappyData.
      <Text size="xs" tag="span" style="text-decoration:underline;" className="mt-2" on:click={purch.ui.open}>View Purchases</Text>
    </Text>
  </div>
{/if}
