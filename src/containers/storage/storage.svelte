<script>
  import { onMount } from "svelte";
  import { Interact } from "../../store/interact";
  import NItem from "../../components/list-item/list-item.svelte";

  const state = {
    showFiles: false,
    files: []
  };

  const methods = {
    initialize() {
      state.files = [];
      return blockstack
        .listFiles(file => {
          methods.addFilesRef(file);
          return true;
        })
        .then(() => {
          state.files = state.files;
          return state.files;
        });
    },
    addFilesRef(name) {
      if (state.files.indexOf(name) == -1) {
        state.files.push(name);
      }
    },
    deleteEverything() {
      Interact.confirm(
        "DANGER ZONE!",
        `This will destroy all of your data in Nomie. Are you sure?`,
        "Destroy"
      ).then(res => {
        if (res === true) {
          Interact.confirm(
            "Sorry! One last time.. Really?",
            `You will basically be starting over from scratch... You good with that?`,
            "Destroy Data"
          ).then(res => {
            if (res === true) {
              // Clear localstorage

              let promises = [];
              state.files.forEach(file => {
                promises.push(blockstack.deleteFile(file));
              });
              Promise.all(promises)
                .then(() => {
                  localStorage.clear();
                  Interact.alert("Done", "Your data has been destroyed.").then(
                    () => {
                      window.location.href = "/";
                    }
                  );
                })
                .catch(e => {
                  localStorage.clear();
                  Interact.alert("Error Deleting", e.message);
                });
            }
          });
        }
      });
    },
    deleteFile(file) {
      Interact.confirm(
        "Holup! Delete ${file}?",
        `This can cause serious problems if you don't know what you're doing.`,
        "Yes, Delete"
      ).then(res => {
        if (res === true) {
          blockstack.deleteFile(file).then(() => {
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
    <NItem title="Storage" className="n-item-divider">
      <button
        slot="right"
        class="btn btn-clear text-primary"
        on:click={() => {
          state.showFiles = !state.showFiles;
        }}>
        {#if state.showFiles}Hide{:else}Show{/if}
      </button>
    </NItem>

    {#if state.showFiles}
      {#each state.files as file (file)}
        <NItem title={file}>
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
      <NItem title="Super Danger" className="n-item-divider" />
      <NItem title="Delete all files">
        <button
          class="btn btn-sm btn-danger"
          slot="right"
          on:click={() => {
            methods.deleteEverything();
          }}>
          Delete Everything
        </button>
      </NItem>
    {/if}
  </div>
</div>
