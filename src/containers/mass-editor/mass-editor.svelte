<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  import NModal from "../../components/modal/modal.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import NInput from "../../components/input/input.svelte";
  import NItem from "../../components/list-item/list-item.svelte";
  import NProgress from "../../components/progress-bar/progress-bar.svelte";
  import regex from "../../utils/regex";

  // Utils
  import PromiseStep from "../../utils/promise-step/promise-step";
  import Storage from "../../modules/storage/storage";
  import math from "../../utils/math/math";
  import Logger from "../../utils/log/log";

  import arrayUtils from "../../utils/array/array_utils";

  //vendors
  import Spinner from "../../components/spinner/spinner.svelte";

  // Stores
  import { LedgerStore } from "../../store/ledger";
  import { Interact } from "../../store/interact";
  import Text from "../../components/text/text.svelte";

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
    example: null,
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

    findInBook(bookPath, logs) {
      logs.forEach((log) => {
        let searchReg = new RegExp(regex.escape(state.replace), "g");
        if (log.note.search(searchReg) > -1) {
          state.foundCount++;
          state.found = state.found || [];
          // Push found results
          state.found.push({
            book: bookPath,
            log: log,
          });
        }
      });
      return state.found;
    },

    async getAndFindChunks(bookPaths) {
      let promises = [];
      for (var i = 0; i < bookPaths.length; i++) {
        let path = bookPaths[i];
        let getBook = Storage.get(path);
        promises.push(getBook);
        getBook.then((logs) => {
          methods.findInBook(path, logs);
        });
      }
      return Promise.all(promises);
    },

    async find() {
      if (state.replace) {
        state.found = [];
        state.finding = true;
        state.findingProress = 0;
        // Let all books
        let bookPaths = await LedgerStore.listBooks();
        // Break them into chunks of 10
        let chunkedBookPaths = arrayUtils.chunk(bookPaths, 10);
        // Loop over (using for loop for await)
        for (var i = 0; i < chunkedBookPaths.length; i++) {
          let thisBatch = chunkedBookPaths[i];
          // Check this chunk
          let processed = await methods.getAndFindChunks(thisBatch);
          // Update the pgoress bar
          state.findingProgress = Math.round((i / chunkedBookPaths.length) * 100);
        }
        state.example = 0;
        state.finishedFinding = true;
      } // end if we have something to replace
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
      Interact.confirm(`Replace ${state.found.length} item(s)?`, "This cannot be undone.").then((res) => {
        if (res) {
          // do the replace
          state.replacing = true;
          methods.executeReplace();
        }
      });
    },

    showReplace(str) {
      let searchReg = new RegExp(regex.escape(state.replace), "g");
      return str.replace(searchReg, `**${state.replace}**${state.with}`);
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
      let searchReg = new RegExp(regex.escape(state.replace), "g");
      //Step over each replacing within the books
      PromiseStep(bookPaths, (path) => {
        return new Promise((resolve) => {
          // Get book
          let index = bookPaths.indexOf(path) + 1;
          // Prep for errors. Todo: if errors then show them
          let errors = [];
          // Get the current book
          Storage.get(path).then((book) => {
            // Map new notes with the content replaced
            book = book.map((row) => {
              if (row.note.search(searchReg) > -1) {
                row.note = row.note.replace(searchReg, state.with);
                state.replacedCount++;
              }
              return row;
            });
            // Update progress bar
            state.replacingProgress = Math.round((index / bookPaths.length) * 100);
            // Save the new Book
            Storage.put(path, book)
              .then(() => {
                resolve(true);
              })
              .catch((e) => {
                errors.push(e.message);
                resolve(false);
              });
          });
        });
      }).then(() => {
        // Finish the Steps
        state.finishedReplacing = true;
        // Notify the User
        Interact.confirm(`Replace Complete`, `${state.replacedCount} notes have been updated`).then(() => {
          dispatch("close");
        });
      });
    },
    foundToMap() {
      let found = {};
      state.found.forEach((item) => {
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
    },
  };
</script>

{#if show}
  <NModal class="mass-editor flex-shrink-off" title="Find and Replace">

    <div class="p-2 pb-3">
      {#if state.error}
        <NItem>
          <div class="alert alert-danger">{state.error}</div>
        </NItem>
      {/if}

      {#if !state.finding}
        <NItem description="Find and replace specific content from all of your notes. For example renaming a tag." />
        <NItem>
          <NInput compact bind:value={state.replace} placeholder="Replace this:" help="e.g. #sleep_time" />
        </NItem>
        <NItem>
          <NInput compact bind:value={state.with} placeholder="with this:" help="e.g. #sleep" />
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
        <NItem className="pb-2" title={`${state.finishedFinding ? 'Find Complete' : 'Finding...'}`}>
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
          <NItem style="min-height:120px; width:100%">
            <div>
              <Text size="sm" leading2 faded>Sample {state.example + 1} of {state.found.length}</Text>
              <Text size="sm">{methods.showReplace(state.found[state.example || 0].log.note)}</Text>
            </div>
            <button class="btn btn-clear btn-icon tap-icon" slot="left" on:click={methods.previousSample}>
              <NIcon name="chevronLeft" />
            </button>
            <button class="btn btn-clear btn-icon tap-icon" slot="right" on:click={methods.nextSample}>
              <NIcon name="chevronRight" />
            </button>
          </NItem>
        {/if}
      {/if}

    </div>

    <div slot="footer" class="n-row">

      {#if state.finding && state.finishedFinding}
        <button class="btn btn-clear" on:click={methods.back}>Back</button>
        <button class="btn btn-primary" on:click={methods.replace}>Replace All...</button>
      {:else if !state.finding && !state.found}
        <button class="btn btn-clear" on:click={methods.close}>Cancel</button>
        <button class="btn btn-primary" on:click={methods.find}>Find All...</button>
      {:else}
        <button class="btn btn-clear" on:click={methods.back}>Back</button>
      {/if}
    </div>

  </NModal>
{/if}
