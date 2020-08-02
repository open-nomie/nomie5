<script>
  import NItem from "../list-item/list-item.svelte";
  import { UserStore } from "../../store/user-store";
  import { Lang } from "../../store/lang";

  const methods = {
    signOut() {
      UserStore.signout();
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
