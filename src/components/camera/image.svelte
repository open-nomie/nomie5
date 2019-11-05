<script>
  import Storage from "../../modules/storage/storage";
  export let path;
  export let className = null;
  export let style = undefined;
  export let display = "img";
  export let height = "300px";

  const image = async () => {
    return Storage.get(path);
  };
</script>

<style>
  .camera-image-div {
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    width: 100%;
    flex-grow: 1;
    flex-shrink: 1;
  }
</style>

{#await image() then src}
  {#if display === 'div'}
    <div
      alt="Nomie Photo"
      class="camera-image camera-image-div {className}"
      style="height:300px; background-image:url({src});" />
  {:else}
    <img
      {src}
      alt="Nomie Photo"
      class="camera-image camera-image-img {className}"
      style="{style}; height:{height}" />
  {/if}
{/await}
