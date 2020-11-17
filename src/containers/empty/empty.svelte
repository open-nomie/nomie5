<script lang="ts">
  import Avatar from "../../components/avatar/avatar.svelte";
  import Button from "../../components/button/button.svelte";
  import Text from "../../components/text/text.svelte";
  export let emoji: string = undefined;
  export let title: string = undefined;
  export let description: string = undefined;
  export let className: string = "";
  export let style: string = "";
  export let buttonLabel: string = undefined;
  export let buttonClick: any = undefined;
</script>

<style>
  .empty-box {
    flex-direction: column;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 300px;
    height: calc(100% - 20px);
    flex-grow: 1;
    flex-shrink: 0;
    padding: 20px;
    align-self: center;
    justify-self: center;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
    height: auto;
  }
</style>

<div class="empty-box {className}" {style}>
  {#if emoji}
    <Avatar {emoji} size={80} className="mb-4" />
  {/if}
  {#if title}
    <Text size="lg" bold center className="my-1">{title}</Text>
  {/if}
  {#if description}
    <Text size="sm" faded center>{description}</Text>
  {/if}
  <slot />
  {#if buttonLabel}
    <Button size="sm" color="transparent" className="mt-4 text-primary-bright" on:click={buttonClick}>{buttonLabel}</Button>
  {/if}
</div>
