<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import Input from "../input/input.svelte";
  export let className = "";
  const dispatch = createEventDispatcher();

  function change(evt: any) {
    let input = evt.target;
    let files = evt.target.files;
    dispatch("files", files);
    dispatch("file", files[0]);
  }
</script>

<Input {className} placeholder="Avatar" type="file" accept="png,jpeg,jpg" on:change={change} />
