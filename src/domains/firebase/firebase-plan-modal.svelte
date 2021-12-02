<script lang="ts">
  import { onMount } from "svelte";
  import Button from "../../components/button/button.svelte";
  import Modal2 from "../../components/modal/modal2.svelte";
  import Panel from "../../components/panel/panel.svelte";
  import ToolbarGrid from "../../components/toolbar/toolbar-grid.svelte";
  import Toolbar from "../../components/toolbar/toolbar.svelte";
  import { Interact } from "../../store/interact";
  import { switchStorage } from "../settings/settings-functions";

  import {
    firebaseApp,
    FirebaseStore,
    signOutOfNomieCloud,
  } from "./FirebaseStore";

  import {
    getStripePayments,
    getProducts,
    createCheckoutSession,
  } from "@stripe/firestore-stripe-payments";

  import Spinner from "../../components/spinner/spinner.svelte";

  const payments = getStripePayments(firebaseApp, {
    productsCollection: "products",
    customersCollection: "customers",
  });

  let showDom: boolean = false;

  const switchToFree = async () => {
    const confirmed = await Interact.confirm(
      "Switch to Local Device Only?",
      "You can always switch back without later."
    );
    if (confirmed) switchStorage("local", true);
  };

  $: if ($FirebaseStore && $FirebaseStore.showPlan) {
    setTimeout(() => {
      showDom = true;
    }, 200);
  } else {
    setTimeout(() => {
      showDom = false;
    }, 200);
  }

  let selectedPlan;
  let loadingCheckout: boolean = false;
  let products: Array<any> = [];

  const checkout = async () => {
    loadingCheckout = true;
    const session = await createCheckoutSession(payments, {
      price: selectedPlan.prices[0].id,
    });
    window.location.assign(session.url);
  };

  const loadProducts = async () => {
    const freshProducts = [];
    const prods = await getProducts(payments, {
      includePrices: true,
      activeOnly: true,
    });

    for (const product of prods) {
      freshProducts.push(product);
    }
    products = freshProducts;
    selectedPlan = products[0];
  };

  const getPrice = (id: string) => {
    if (id === "pro") {
      return 20;
    } else {
      return 10;
    }
  };

  onMount(() => {
    loadProducts();
  });
</script>

<Modal2 visible={showDom} id="firebase-modal">
  <Panel className="h-full">
    <header slot="header" class="px-4">
      <ToolbarGrid>
        <button
          slot="left"
          on:click={signOutOfNomieCloud}
          class="text-primary-500 whitespace-nowrap">Logout</button
        >
        <h1 class="ntitle w-full text-center">Nomie Cloud</h1>
        <button
          slot="right"
          on:click={switchToFree}
          class="text-primary-500 whitespace-nowrap">Free Plan</button
        >
      </ToolbarGrid>
    </header>

    <main class="px-4">
      <section
        aria-label="About Nomie Cloud"
        class="px-4 dark:text-white font-bold"
      >
        <p class="py-2">
          Access Nomie on multiple devices with your data fully encrypted
          end-to-end with NomieCloud.
        </p>
      </section>

      <section class="flex items-center plans">
        {#each products as product, index}
          <button
            on:click={() => (selectedPlan = product)}
            class="plan-option {selectedPlan == product ? 'selected' : ''}"
          >
            <div class="font-semibold">{product.name}</div>
            <div>${getPrice(product.stripe_metadata_planId)} Month</div>
          </button>
        {/each}
      </section>

      {#if selectedPlan}
        <section class="plan-details p-4">
          <h3 class="ntitle text-center mb-4">What's Included</h3>

          <ul class="grid grid-cols-2 text-xs dark:text-blue-200 gap-1">
            {#if selectedPlan.stripe_metadata_planId == "base"}
              <li class="font-semibold text-black dark:text-white">
                20 API Slots
              </li>
            {/if}

            {#if selectedPlan.stripe_metadata_planId == "pro"}
              <li class="font-semibold text-black dark:text-white">
                Unlimited API Slots
              </li>
              <li class="font-semibold text-black dark:text-white">
                Multiple Profiles
              </li>
            {/if}
            {#if selectedPlan.stripe_metadata_planId == "pro" || selectedPlan.stripe_metadata_planId == "base"}
              <li>End-to-End Encryption</li>
              <li>Use Multiple Devices</li>
            {/if}

            <li>Unlimited Notes</li>
            <li>Unlimited Trackers</li>
            <li>Unlimited Events</li>
            <!-- {#if !selectedPlan.features.cloud}
            <li>Data on this device only</li>
            <li>Full offline support</li>
          {/if} -->
          </ul>
        </section>
      {/if}
      <Toolbar className="mt-4">
        <Button
          disabled={loadingCheckout}
          className="w-full py-2 font-bold"
          color="primary"
          on:click={checkout}
        >
          {#if loadingCheckout}
            <Spinner size={24} />
          {/if}
          Get Started
        </Button>
      </Toolbar>
    </main>
  </Panel>
</Modal2>

<style global lang="postcss">
  .plans {
    @apply items-stretch;
    @apply px-4;
    @apply my-5;
  }
  .plan-option {
    @apply w-full;
    @apply flex flex-col;
    @apply rounded-xl;
    @apply p-4;
    @apply text-black dark:text-white;
    @apply leading-snug;
  }
  .plan-option.selected {
    @apply ring-2 ring-primary-500;
  }
  .plan-details {
    @apply rounded-sm;
    @apply items-center;
  }
</style>
