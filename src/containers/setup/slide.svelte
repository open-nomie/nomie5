<script>
  import { slide } from "svelte/transition";
  export let img = undefined;
  export let title = "";
  export let message = [];
</script>

<style lang="scss">
  .slide {
    padding: 20px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    max-width: 400px;
    height: 100vh;
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
      font-size: 1.6rem;
      margin-top: 40px;
      font-weight: bolder;
    }
    .content {
      padding: 20px 0;
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
    <h1>{title}</h1>
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
