<script>
  import ListItem from "../../components/list-item/list-item.svelte";
  import List from "../../components/list/list.svelte";
  import { FirebaseStore, signOutOfNomieCloud } from "./FirebaseStore";
</script>

<List>
  <ListItem clickable detail>
    <div slot="left">⭐️</div>
    Plan Level
    <div slot="right">
      {#if $FirebaseStore.plan}
        <div
          class="uppercase py-1 flex items-center text-xs text-white font-bold px-2 rounded-lg bg-gray-500"
        >
          {$FirebaseStore.planName}
        </div>
      {/if}
    </div>
  </ListItem>
  <ListItem clickable detail on:click={signOutOfNomieCloud}>
    <div slot="left">✌️</div>
    Logout of Nomie Cloud
  </ListItem>
</List>
