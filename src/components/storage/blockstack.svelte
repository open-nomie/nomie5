<script>
  import NItem from "../list-item/list-item.svelte";
  import { UserStore } from "../../store/user-store";
  import { Lang } from "../../store/lang";
  import { Interact } from "../../store/interact";

  const methods = {
    async signOut() {
      let confirmed = await Interact.confirm(
        "Remove Blockstack Account from Nomie?",
        "Your data in blockstack will be fine, but you will need to reconnect."
      );
      if (confirmed) {
        UserStore.signout();
      }
    },
  };
</script>

<div class="blockstack stoage-option">
  <NItem>
    <div class="title truncate">{$UserStore.profile.username || 'Blockstack'}</div>
    <div slot="right">
      <button class="btn btn-small btn-clear text-primary" on:click={methods.signOut}>{Lang.t('settings.sign-out')}</button>
    </div>
  </NItem>
</div>
