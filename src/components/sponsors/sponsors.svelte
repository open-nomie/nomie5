<script lang="ts">
  import HScroller from "../h-scroller/h-scroller.svelte";
  import sponsors from "../../config/sponsors";
  import Button from "../button/button.svelte";
  import Avatar from "../avatar/avatar.svelte";
  import Text from "../text/text.svelte";
  import { Device } from "../../store/device-store";
  import _ from "lodash";
  import Grid from "../grid/grid.svelte";
  export let style = "";
  export let className = "";
</script>

<style>
  :global(.nbtn.sponsorship) {
    width: auto;
    height: auto;
    flex-shrink: 0;
    flex-grow: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    max-width: 200px;
    margin: 4px;
    text-align: left;
    padding: 8px;
    border-radius: 20px;
    box-shadow: var(--box-shadow-tight);
    background-color: var(--color-solid);
    /* border: solid 1px var(--color-solid-2); */
  }
</style>

<HScroller style="height:90px; {style}" {className} wrapperClass="px-1">
  <Grid columns={sponsors.length} style="width:auto; flex-shrink:0;">
    {#each _.shuffle(sponsors) as sponsor}
      <Button
        className="sponsorship"
        type="clear"
        on:click={() => {
          Device.open(sponsor.url);
        }}>
        <div slot="left">
          <Avatar size={54} src={sponsor.avatar} label={sponsor.name} emoji={sponsor.emoji} className="mr-1" />
        </div>
        {#if sponsor.name}
          <Text size="sm">{sponsor.name}</Text>
        {/if}
        {#if sponsor.description}
          <Text size="xs" faded>{sponsor.description}</Text>
        {/if}
      </Button>
    {/each}
  </Grid>
</HScroller>
