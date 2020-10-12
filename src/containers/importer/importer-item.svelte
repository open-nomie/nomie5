<script lang="ts">
  import ListItem from "../../components/list-item/list-item.svelte";
  import Spinner from "../../components/spinner/spinner.svelte";
  import Icon from "../../components/icon/icon.svelte";
  import { createEventDispatcher } from "svelte";
  import { Lang } from "../../store/lang";
  import Button from "../../components/button/button.svelte";

  export let emoji = "🙃";
  export let title = "Unknown";
  export let status;
  export let count = 0;

  const dispatch = createEventDispatcher();
</script>

<ListItem title={`${title} (${count})`}>
  <span slot="left">{emoji}</span>
  <slot />
  <div slot="right">
    {#if status.running}
      <Spinner size={24} />
    {:else if status.done}
      <Icon name="checkmark" className="fill-primary-bright" />
    {:else}
      <Button
        class="btn text-primary btn-clear"
        on:click={() => {
          dispatch('import');
        }}>
        {Lang.t('import.import', 'Import')}
      </Button>
    {/if}
  </div>
</ListItem>
