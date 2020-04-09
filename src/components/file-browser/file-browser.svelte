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
    file: null,
    loading: true
  };

  // Not working
  export let path = undefined;
  // Old fashion way is working

  let lastPath = null;

  $: if (path && path !== lastPath) {
    init();
  }

  async function init() {
    state.file = null;
    lastPath = path;
    if (path.substr(0, 1) == "/") {
      path = path.replace("/", "");
    }
    path = path.replace(/\/\//g, "/");
    let ogPath = path.split("/");
    if (ogPath.length > 0) {
      let fileName = ogPath[ogPath.length - 1];
      if (isFile(fileName)) {
        state.file = fileName;
        state.path = ogPath;
      } else {
        state.path = ogPath;

        state.files = extractFiles();
      }
    }
    state.title = ogPath.join("/");
    state.path = ogPath;
  }

  async function back() {
    history.back();
    await tick(100);
    init();
    // if (state.path.length) {
    //   state.path.pop();
    //   await tick(10);
    //   state.files = extractFiles();
    // } else {
    //   history.back();
    // }
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

  onMount(async () => {
    state.loading = true;
    console.log("On Mount?");
    Storage.getEngine().onReady(async () => {
      let files = await Storage.list();
      state.tree = Treeify(files);
      state.files = extractFiles();
      state.loading = false;
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
    let content = await Storage.get(state.path.join("/"));
    return JSON.stringify(content, null, 2);
  }

  function isFile(name) {
    const filesArray = ["last-usage", "nomie-capture"];
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
  function getPath(file) {
    let path;
    if (state.path.length == 1) {
      let root = state.path[0];
      if (root.substr(0, 1) == "/") {
        root = root.substr(1, root.length - 2);
      }
      path = `/files/${root}/${file}`;
    } else {
      path = `/files/${state.path.join("/")}/${file}`;
    }
    return path.replace("//", "/");
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

  .code-view {
    background-color: var(--color-solid-1);
    color: var(--color-inverse-1);
  }
  pre {
    font-size: 12px;
    padding: 10px;
  }
</style>

{#if !state.file}
  <NPage className="n-file-browser">
    <div class="n-toolbar-grid container" slot="header">
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
      <div class="n-list mt-2 container">

        {#if state.loading}
          <div class="p-4 n-panel center-all">
            <NSpinner />
          </div>
        {/if}
        {#each state.files as file}
          {#if !isFile(file)}
            <NItem
              className="clickable bottom-line"
              on:click={() => {
                navigate(getPath(file));
              }}>
              {file}
              <div slot="right">
                <span class="text-sm text-faded-1">Folder</span>
                <NIcon name="chevronRight" className="fill-faded-2" />
              </div>
            </NItem>
          {:else}
            <NItem
              className="clickable bottom-line"
              on:click={() => {
                navigate(getPath(file));
              }}>
              {file}
              <div slot="right">
                <span class="text-sm text-faded-1">File</span>
                <NIcon name="chevronRight" className="fill-faded-2" />
              </div>
            </NItem>
          {/if}
        {/each}
      </div>
    </div>
  </NPage>
{:else}
  <NPage className="n-file-browser">
    <div class="n-toolbar-grid container" slot="header">
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
    <div class="content code-view">
      <div class="container">
        {#await readFile()}
          <div class="n-panel center-all">
            <NSpinner />
          </div>
        {:then content}
          <pre>{content}</pre>
        {:catch error}
          <div class="text-red">{error.message}</div>
        {/await}
      </div>
    </div>
  </NPage>
{/if}
