<script lang="ts">
  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import Button from "../../components/button/button.svelte";
  import Divider from "../../components/divider/divider.svelte";
  import Input from "../../components/input/input.svelte";
  import List from "../../components/list/list.svelte";
  import Modal2 from "../../components/modal/modal2.svelte";
  import Panel from "../../components/panel/panel.svelte";
  import ToolbarGrid from "../../components/toolbar/toolbar-grid.svelte";
  import Toolbar from "../../components/toolbar/toolbar.svelte";
  import { Interact } from "../../store/interact";
  import { switchStorage } from "../settings/settings-functions";
  import { createAccount, FirebaseStore, signIn } from "./FirebaseStore";

  let showDom: boolean = false;

  $: if ($FirebaseStore && $FirebaseStore.showLogin) {
    setTimeout(() => {
      showDom = true;
    }, 200);
  } else {
    setTimeout(() => {
      showDom = false;
    }, 200);
  }

  let view = "register";

  let email: string = "";
  let password: string = "";

  let selectedPlanId: "base" | "pro" | string = "base";
  let plans = [
    // {
    //   id: "free",
    //   label: "Free",
    //   usd: 0,
    //   features: {
    //     cloud: false,
    //   },
    // },
    {
      id: "base",
      label: "Base",
      usd: 10,
      features: {
        limited_api: true,
        cloud: true,
      },
    },
    {
      id: "pro",
      label: "Pro",
      usd: 20,
      features: { unlimited_api: true, cloud: true, profiles: true },
    },
  ];

  let selectedPlan = plans[0];
  let lastSelectedPlanId = "";

  $: if (selectedPlanId && lastSelectedPlanId !== selectedPlanId) {
    selectedPlan = plans.find((p) => p.id == selectedPlanId);
    console.log({ selectedPlan });
  }

  const switchToFree = async () => {
    const confirmed = await Interact.confirm(
      "Switch to Local Device Only?",
      "You can always switch back without later."
    );
    if (confirmed) switchStorage("local", true);
  };

  const doSignIn = async () => {
    await signIn(email, password)
      .catch((e) => {
        Interact.error(e.message);
        console.error(e);
      })
      .then(() => {
        Interact.toast("Login Successful!");
      });
  };
  const doRegister = async () => {
    await createAccount(email, password)
      .catch((e) => {
        Interact.error(e.message);
        console.error(e);
      })
      .then(() => {
        Interact.toast("Registration Successful!");
      });
  };
</script>

<Modal2 visible={showDom} id="firebase-modal">
  <Panel className="h-full">
    <header slot="header" class="px-4">
      <ToolbarGrid>
        <h1 class="ntitle w-full text-center">Nomie Cloud</h1>
        <button
          slot="right"
          on:click={switchToFree}
          class="text-primary-500 whitespace-nowrap">Switch to FREE</button
        >
      </ToolbarGrid>
      <Toolbar>
        <ButtonGroup
          buttons={[
            {
              label: "Sign-In",
              active: view === "sign-in",
              click() {
                view = "sign-in";
              },
            },
            {
              label: "Create Account",
              active: view === "register",
              click() {
                view = "register";
              },
            },
          ]}
        />
      </Toolbar>
    </header>

    <main class="px-4">
      {#if view == "sign-in"}
        <List solo>
          <Input
            bind:value={email}
            listItem
            type="email"
            name="email"
            placeholder="Email"
            label="Email Address"
          />
          <Divider center />
          <Input
            listItem
            bind:value={password}
            type="password"
            name="password"
            placeholder="Password"
            label="Password"
          />
        </List>
        <Toolbar className="mt-4">
          <Button
            on:click={doSignIn}
            disabled={email.length < 3 || password.length < 5}
            className="w-full py-2 font-bold"
            color="primary">Login to Your Account</Button
          >
        </Toolbar>
        <button
          class="my-2 w-full text-center underline text-primary-500"
          on:click={() => (view = "reset-password")}>Forgot Password?</button
        >
      {/if}
      {#if view == "reset-password"}
        <List solo>
          <Input
            listItem
            type="email"
            name="email"
            placeholder="Email"
            label="Email Address"
          />
        </List>
        <Toolbar className="mt-4">
          <Button
            className="w-full py-2 font-bold text-primary-500"
            on:click={() => (view = "sign-in")}>Cancel</Button
          >
          <Button className="w-full py-2 font-bold" color="danger">Reset</Button
          >
        </Toolbar>
      {/if}
      {#if view === "register"}
        <section
          aria-label="About Nomie Cloud"
          class="px-4 dark:text-white font-bold"
        >
          <p class="py-2">
            Access Nomie on multiple devices with your data fully encrypted
            end-to-end with NomieCloud.
          </p>
        </section>
        <List solo>
          <Input
            bind:value={email}
            listItem
            type="email"
            name="email"
            placeholder="Email Address"
            label="Email Address"
          />
          <Divider center />
          <Input
            listItem
            bind:value={password}
            name="password"
            type="password"
            placeholder="Choose a Password"
            label="Password"
          />
        </List>
        <section class="flex items-center plans">
          {#each plans as plan, index}
            <button
              on:click={() => (selectedPlanId = plan.id)}
              class="plan-option {selectedPlanId == plan.id ? 'selected' : ''}"
            >
              <div class="font-semibold">{plan.label}</div>
              <div>${plan.usd} Month</div>
            </button>
          {/each}
        </section>

        <section class="plan-details p-4">
          <h3 class="ntitle mb-2">{selectedPlan.label} Plan Includes</h3>

          <ul class="grid grid-cols-2 text-xs dark:text-blue-200 gap-1">
            {#if selectedPlan.features.limited_api}
              <li class="font-semibold text-black dark:text-white">
                20 API Slots
              </li>
            {/if}

            {#if selectedPlan.features.unlimited_api}
              <li class="font-semibold text-black dark:text-white">
                Unlimited API Slots
              </li>
              <li class="font-semibold text-black dark:text-white">
                Multiple Profiles
              </li>
            {/if}
            {#if selectedPlan.features.cloud}
              <li>Full End-to-End Encryption</li>
              <li>Multiple Devices Support</li>
              <li>Partial offline support</li>
            {/if}

            <li>Unlimited Notes</li>
            <li>Unlimited Trackers</li>
            <li>Unlimited Events</li>
            {#if !selectedPlan.features.cloud}
              <li>Data on this device only</li>
              <li>Full offline support</li>
            {/if}
          </ul>
        </section>
        <Toolbar className="mt-4">
          <Button
            on:click={doRegister}
            disabled={email.length < 3 || password.length < 5}
            className="w-full py-2 font-bold"
            color="primary">Create Account</Button
          >
        </Toolbar>
      {/if}
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
