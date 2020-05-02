<script>
  import ButtonGroup from "../components/button-group/button-group.svelte";
  import NItem from "../components/list-item/list-item.svelte";
  import NSearchBar from "../components/search-bar/search-bar.svelte";

  import NLayout from "../containers/layout/layout.svelte";
  import { Lang } from "../store/lang.js";
  import products from "../../src-data/products.json";

  function openProduct(product) {
    window.open(product.link);
  }
</script>

<style lang="scss">
  :global(.products) {
    .image {
      width: 80px;
      height: 80px;
      border-radius: 32%;
      overflow: hidden;
      background-position: center;
      background-size: cover;
    }
  }
</style>

<NLayout>
  <div slot="header" class="n-toolbar-grid">
    <div class="main">Shop/Support Nomie</div>
  </div>
  <main slot="content" class="products mt-4">
    <div class="n-list solo container">
      {#each products as product}
        <NItem
          className="pt-1 pb-2"
          on:click={() => {
            openProduct(product);
          }}>
          <div slot="left" class="flex-column">
            <div class="image" style="background-image:url({product.image})" />
            <div class="btn btn-badge bg-primary text-white">
              {product.price}
            </div>
          </div>
          <main>
            <div class="title">{product.title}</div>
            <div class="note text-sm">{product.summary}</div>
            <div class="text-primary text-xs">{product.integration}</div>
          </main>
        </NItem>
      {/each}
    </div>
    <NItem className="bg-transparent">
      <div class="note text-sm text-inverse-2">
        Products purchased from here will pay a small payout to Nomie.
      </div>
    </NItem>
  </main>
</NLayout>
