<script>
  // Svelte
  import { onMount } from "svelte";

  // Vendors
  import localforage from "localforage";

  // Modules
  import Storage from "../../modules/storage/storage";

  // Components
  import NItem from "../../components/list-item/list-item.svelte";

  // Stores
  import { Interact } from "../../store/interact";
  import { UserStore } from "../../store/user";

  const state = {
    showFiles: false,
    files: []
  };

  const methods = {
    initialize() {
      state.files = [];
      return Storage.list().then(files => {
        state.files = files;
        return state.files;
      });
    },
    addFilesRef(name) {
      if (state.files.indexOf(name) == -1) {
        state.files.push(name);
      }
    },

    deleteFile(file) {
      Interact.confirm(
        `Holup! Delete ${file}?`,
        `This can cause serious problems if you don't know what you're doing.`,
        "Yes, Delete"
      ).then(res => {
        if (res === true) {
          Storage.delete(file).then(() => {
            setTimeout(() => {
              methods.initialize();
            });
          });
        }
      });
    }
  };

  onMount(() => {
    methods.initialize();
  });
</script>

<div class="n-storage">
  <div class="list">
    <NItem
      title="Files ({state.files.length})"
      on:click={() => {
        state.showFiles = !state.showFiles;
      }}
      className="clickable">
      <span slot="left" class="zmdi zmdi-folder text-primary btn-icon" />
      <span slot="right" class="text-primary">
        {#if state.showFiles}Hide{:else}Show Files{/if}
      </span>
    </NItem>

    {#if state.showFiles}
      {#each state.files as file (file)}
        <NItem>
          <div class="truncate">
            {file.substr(0, 20)}{file.length > 20 ? '...' : ''}
          </div>
          <button
            class="btn btn-sm btn-clear text-danger"
            slot="right"
            on:click={() => {
              methods.deleteFile(file);
            }}>
            Delete
          </button>
        </NItem>
      {/each}
    {/if}

  </div>
</div>
