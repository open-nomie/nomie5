<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  import NModal from "../../components/modal/modal.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NInput from "../../components/input/input.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NProgress from "../../components/progress-bar/progress-bar.svelte";

  // Utils
  import PromiseStep from "../../utils/promise-step/promise-step";
  import Storage from "../../modules/storage/storage";
  import math from "../../utils/math/math";
  import Logger from "../../utils/log/log";

  //vendors
  import Spinner from "../../components/spinner/spinner.svelte";

  // Stores
  import { LedgerStore } from "../../store/ledger";
  import { Interact } from "../../store/interact";

  export let show = false;

  const console = new Logger("📝 Mass-editor");

  let state = {
    replace: null,
    with: null,
    found: null,
    error: null,
    findingProgress: null,
    foundCount: 0,
    replacedCount: 0,
    replacingProgress: null,
    finishedFinding: false,
    finishedReplacing: false,
    example: null
  };

  const methods = {
    back() {
      state.found = null;
      state.error = null;
      state.finding = false;
      state.replacing = false;
      state.foundCount = 0;
      state.finishedFinding = false;
      state.example = null;
      state.replacedCount = 0;
    },

    async find() {
      // Clear errors
      state.error = null;
      // If replace is set
      if (state.replace) {
        // Clear previously found results
        state.found = [];
        // Set finding and progress
        state.finding = true;
        state.findingProgress = 0;
        // Get all user books
        let books = await LedgerStore.listBooks();
        // Step over (one at a time) each book, and search it.
        PromiseStep(books, async bookPath => {
          // Get this paths book by index
          let index = books.indexOf(bookPath) + 1;
          let book = await Storage.get(bookPath);
          // Set progress to index / length of books
          state.findingProgress = Math.round((index / books.length) * 100);
          // Loop over each log in the book
          book.forEach(log => {
            // If log.note has the search term
            if (log.note.search(state.replace) > -1) {
              state.foundCount++;
              state.found = state.found || [];
              // Push found results
              state.found.push({
                book: bookPath,
                log: log
              });
            }
          });
          return Promise.resolve(true);
        }).then(finishedFinding => {
          state.example = 0;
          state.finishedFinding = true;
        });
      } else {
        state.error = "Both 'replace' and 'with' are required";
      }
    },
    clear() {
      state.replace = null;
      state.with = null;
      state.found = null;
      state.error = null;
      state.finding = false;
      state.replacing = false;
      state.foundCount = 0;
      state.finishedFinding = false;
      state.example = null;
      state.replacedCount = 0;
    },
    close() {
      methods.clear();
      dispatch("close");
    },
    replace() {
      Interact.confirm(
        `Replace ${state.found.length} item(s)?`,
        "This cannot be undone."
      ).then(res => {
        if (res) {
          // do the replace
          state.replacing = true;
          methods.executeReplace();
        }
      });
    },
    /**
     * Execute the Actual Replace
     */
    executeReplace() {
      state.replacingProgress = 0;
      // Get map of books
      let map = methods.foundToMap();
      let bookPaths = Object.keys(map);
      // Set Searching Regex
      let searchReg = new RegExp(`${state.replace}`, "g");
      //Step over each replacing within the books
      PromiseStep(bookPaths, path => {
        return new Promise(resolve => {
          // Get book
          let index = bookPaths.indexOf(path) + 1;
          // Prep for errors. Todo: if errors then show them
          let errors = [];
          // Get the current book
          Storage.get(path).then(book => {
            // Map new notes with the content replaced
            book = book.map(row => {
              if (row.note.search(searchReg) > -1) {
                row.note = row.note.replace(searchReg, state.with);
                state.replacedCount++;
              }
              return row;
            });
            // Update progress bar
            state.replacingProgress = Math.round(
              (index / bookPaths.length) * 100
            );
            // Save the new Book
            Storage.put(path, book)
              .then(() => {
                resolve(true);
              })
              .catch(e => {
                errors.push(e.message);
                resolve(false);
              });
          });
        });
      }).then(() => {
        // Finish the Steps
        state.finishedReplacing = true;
        // Notify the User
        Interact.confirm(
          `Replace Complete`,
          `${state.replacedCount} notes have been updated`
        ).then(() => {
          dispatch("close");
        });
      });
    },
    foundToMap() {
      let found = {};
      state.found.forEach(item => {
        found[item.book] = found[item.book] || [];
        found[item.book].push(item.log);
      });
      return found;
    },
    nextSample() {
      if (state.example + 1 < state.found.length) {
        state.example = state.example + 1;
      }
    },
    previousSample() {
      if (state.example > 0) {
        state.example = state.example - 1;
      }
    }
  };
</script>

{#if show}
  <NModal class="mass-editor" title="Find and Replace">

    <div class="p-2 pb-3">
      {#if state.error}
        <NItem>
          <div class="alert alert-danger">{state.error}</div>
        </NItem>
      {/if}

      {#if !state.finding}
        <NItem
          description="Find and replace specific content from all of your notes.
          For example renaming a tag." />
        <NItem>
          <NInput
            class="form-control"
            bind:value={state.replace}
            placeholder="Replace this:"
            help="e.g. #sleep_time" />
        </NItem>

        <NItem>
          <NInput
            class="form-control"
            bind:value={state.with}
            placeholder="with this:"
            help="e.g. #sleep" />
        </NItem>
      {/if}

      {#if state.replacing}
        <NItem className="pb-2" title="Replacing">
          <NProgress percentage={state.replacingProgress} />
          <span slot="left">
            {#if state.finishedReplacing}
              <NIcon name="checkmarkOutline" className="fill-green" />
            {:else}
              <Spinner size="30" />
            {/if}
          </span>
        </NItem>
      {:else if state.finding}
        <NItem
          className="pb-2"
          title={`${state.finishedFinding ? 'Find Complete' : 'Finding...'}`}>
          <span slot="left">
            {#if state.finishedFinding}
              <NIcon name="checkmarkOutline" className="fill-green" />
            {:else}
              <Spinner size="30" />
            {/if}
          </span>
          <span slot="right">{state.foundCount} Found</span>
          <div class="pt-1">
            <NProgress percentage={state.findingProgress} />
          </div>
        </NItem>
        {#if state.found.length > 0 && state.example !== null}
          <div class="p-1 mt-2">
            <NItem>
              <div class="text-md">
                Sample {state.example + 1} of {state.found.length}
                <div class="note">
                  {state.found[state.example || 0].log.note}
                </div>
              </div>
              <button
                class="btn btn-clear btn-icon tap-icon"
                slot="left"
                on:click={methods.previousSample}>
                <NIcon name="chevronLeft" />
              </button>
              <button
                class="btn btn-clear btn-icon tap-icon"
                slot="right"
                on:click={methods.nextSample}>
                <NIcon name="chevronRight" />
              </button>
            </NItem>
          </div>
        {/if}
      {/if}

    </div>

    <div slot="footer" class="n-row">

      {#if state.finding && state.finishedFinding}
        <button class="btn btn-clear" on:click={methods.back}>Back</button>
        <button class="btn btn-primary" on:click={methods.replace}>
          Replace All...
        </button>
      {:else if !state.finding && !state.found}
        <button class="btn btn-clear" on:click={methods.close}>Cancel</button>
        <button class="btn btn-primary" on:click={methods.find}>
          Find All...
        </button>
      {:else}
        <button class="btn btn-clear" on:click={methods.back}>Back</button>
      {/if}
    </div>

  </NModal>
{/if}
