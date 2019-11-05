<script>
  import { slide } from "svelte/transition";
  export let img = undefined;
  export let title = "";
  export let message = [];
</script>

<style lang="scss">
  .slide {
    padding: 20px 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    max-width: 400px;
    height: calc(100vh - 100px);
    max-height: 700px;
    overflow: scroll;

    img {
      max-width: 100%;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0px 10px 15px -8px rgba(0, 0, 0, 0.32);
      flex-shrink: 0;
      flex-grow: 0;
    }

    h1 {
      font-size: 1.2rem;
      font-weight: bolder;
      text-align: center;
      max-width: 240px;
      margin-left: auto;
      margin-right: auto;
    }
    .content {
      padding: 0 0 20px;
      font-size: 1rem;
    }
    p {
      font-size: 0.8rem;
      font-weight: 200;
      opacity: 0.77;
      text-align: center;
    }
  }
</style>

<div class="slide" transition:slide>
  {#if img}
    <div>
      <img src={img} width="100%" alt={title} />
    </div>
  {/if}
  {#if title}
    <h1 class={img ? 'mt-3' : ''}>{title}</h1>
  {/if}
  <div class="content">
    {#if message.length}
      {#each message as message, mi}
        <p>{message}</p>
      {/each}
    {/if}
    <slot />
  </div>
</div>
