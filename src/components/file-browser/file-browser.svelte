<script>
  import { onMount } from "svelte";
  import NToolbar from "../toolbar/toolbar.svelte";
  import NItem from "../list-item/list-item.svelte";
  import NBackButton from "../back-button/back-button.svelte";
  import tick from "../../utils/tick/tick";

  import Storage from "../../modules/storage/storage";

  const state = {
    title: "File Browser",
    path: [],
    tree: {},
    files: [],
    animateForward: false,
    animateBack: false
  };

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
</style>

<div class="n-file-browser n-panel vertical fixed">
  <div class="n-toolbar-grid">
    <div class="left">
      <button class="btn" on:click={back}>Back</button>
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
        <NItem
          className="clickable bottom-line"
          on:click={() => {
            goto(file);
          }}>
          {file}
          <div class="zmdi zmdi-chevron-right" slot="right" />
        </NItem>
      {/each}
    </div>
  </div>
</div>
