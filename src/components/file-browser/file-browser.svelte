<script>
  import { onMount } from "svelte";
  import { Router, Route, navigate } from "svelte-routing";
  import NToolbar from "../toolbar/toolbar.svelte";
  import NSpinner from "../spinner/spinner.svelte";
  import NItem from "../list-item/list-item.svelte";
  import NIcon from "../icon/icon.svelte";
  import NBackButton from "../back-button/back-button.svelte";
  import NPage from "../../containers/layout/page.svelte";
  import tick from "../../utils/tick/tick";

  import Storage from "../../modules/storage/storage";

  import { Interact } from "../../store/interact";

  const state = {
    title: "File Browser",
    path: [],
    tree: {},
    files: [],
    animateForward: false,
    animateBack: false,
    file: null
  };

  // Not working
  export let file = undefined;
  // Old fashion way is working
  let path = window.location.href.split("/");
  path.splice(0, 4);

  if (path.length > 0) {
    state.file = path.join("/");
  }

  let lastPath = [];
  // Shitty Animation
  $: if (state.path && state.path.join("") !== lastPath.join("")) {
    if (state.path.length < lastPath.length) {
      state.animateBack = true;
      setTimeout(() => {
        state.animateForward = true;
        state.animateBack = false;
        setTimeout(() => {
          state.animateForward = false;
        }, 200);
        lastPath = [...state.path];
      }, 200);
    } else {
      state.animateForward = true;
      setTimeout(() => {
        state.animateForward = false;
        state.animateBack = true;
        setTimeout(() => {
          state.animateBack = false;
        }, 200);
        lastPath = [...state.path];
      }, 200);
    }
  }

  async function back() {
    if (state.path.length) {
      state.path.pop();
      await tick(10);
      state.files = extractFiles();
    } else {
      history.back();
    }
  }

  function extractFiles() {
    if (state.path.length) {
      let obj = { ...state.tree };
      state.path.forEach(name => {
        if (obj.hasOwnProperty(name)) {
          obj = obj[name];
        }
      });
      return Object.keys(obj);
    } else {
      return Object.keys(state.tree);
    }
  }

  /**
   * From https://joelgriffith.net/array-reduce-is-pretty-neat/
   */
  function Treeify(files) {
    var fileTree = {};

    if (files instanceof Array === false) {
      throw new Error("Expected an Array of file paths, but saw " + files);
    }

    function mergePathsIntoFileTree(prevDir, currDir, i, filePath) {
      if (i === filePath.length - 1) {
        prevDir[currDir] = "file";
      }

      if (!prevDir.hasOwnProperty(currDir)) {
        prevDir[currDir] = {};
      }

      return prevDir[currDir];
    }

    function parseFilePath(filePath) {
      var fileLocation = filePath.split("/");
      if (fileLocation.length === 1) {
        return (fileTree[fileLocation[0]] = "file");
      }
      fileLocation.reduce(mergePathsIntoFileTree, fileTree);
    }
    files.forEach(parseFilePath);
    return fileTree;
  }

  function goto(path) {
    state.path.push(path);
    state.files = extractFiles(state.path);
  }

  onMount(async () => {
    Storage.getEngine().onReady(async () => {
      let files = await Storage.list();
      state.tree = Treeify(files);
      state.files = extractFiles();
    });
    await Storage.init();
  });

  async function deleteFile(file) {
    let confirm = await Interact.confirm(
      `Really delete ${file}?`,
      `This can cause serious issues if you don't know what you're doing.`,
      "Yes, Delete"
    );
    if (confirm) {
      await Storage.delete(file);
      Interact.toast("Deleted");
      back();
    }
  }

  async function readFile() {
    let content = await Storage.get(state.file);
    return JSON.stringify(content, null, 2);
  }

  function isFile(name) {
    const filesArray = ["last-usage"];
    if (name.split(".").length > 1) {
      return true;
    } else if (filesArray.indexOf(name) > -1) {
      return true;
    } else if (state.path[state.path.length - 1] == "books") {
      return true;
    } else {
      return false;
    }
  }
</script>

<style lang="scss">
  .n-list.animate {
    transition: all 0.2s ease-in-out;
    transform: translateX(0);
    opacity: 1;
    &.animate-forward {
      transform: translateX(-100px);
      opacity: 0;
    }
    &.animate-back {
      transform: translateX(100px);
      opacity: 0;
    }
  }
  pre {
    font-size: 12px;
    color: var(--color-inverse);
    padding: 10px;
  }
</style>

{#if !state.file}
  <NPage className="n-file-browser">
    <div class="n-toolbar-grid" slot="header">
      <div class="left">
        <button class="btn" on:click={back}>
          <NIcon name="arrowBack" />
        </button>
      </div>
      <div class="main">
        <h1>{state.title}</h1>
      </div>
    </div>
    <div class="content n-panel vertical scroll-y">
      <div
        class="n-list mt-2 container animate {state.animateForward ? 'animate-forward' : ''}
        {state.animateBack ? 'animate-back' : ''}">
        {#each state.files as file}
          {#if !isFile(file)}
            <NItem
              className="clickable bottom-line"
              on:click={() => {
                goto(file);
              }}>
              {file}
              <div slot="right">
                <NIcon name="chevronRight" className="fill-faded-2" />
              </div>
            </NItem>
          {:else}
            <NItem
              className="clickable bottom-line"
              on:click={() => {
                navigate(`files/${state.path.join('/')}/${file}`);
              }}>
              {file}
            </NItem>
          {/if}
        {/each}
      </div>
    </div>
  </NPage>
{:else}
  <NPage className="n-file-browser">
    <div class="n-toolbar-grid" slot="header">
      <div class="left">
        <button class="btn" on:click={back}>
          <NIcon name="arrowBack" />
        </button>
      </div>
      <div class="main">
        <h1 class="truncate">{state.file}</h1>
      </div>
      <div class="right">
        <button
          class="btn btn-clear"
          on:click={() => {
            deleteFile(state.file);
          }}>
          <NIcon name="delete" className="fill-red" />
        </button>
      </div>
    </div>
    <div class="content n-panel vertical scroll-y">

      {#await readFile()}
        <NSpinner />
      {:then content}
        <pre>{content}</pre>
      {:catch error}
        <div class="text-red">{error.message}</div>
      {/await}

    </div>
  </NPage>
{/if}
