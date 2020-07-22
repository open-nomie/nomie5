<script>
  import Add24 from "carbon-icons-svelte/lib/Add24";
  import AddAlt24 from "carbon-icons-svelte/lib/AddAlt24";
  import Calendar24 from "carbon-icons-svelte/lib/Calendar24";
  import Events24 from "carbon-icons-svelte/lib/Events24";
  import Settings24 from "carbon-icons-svelte/lib/Settings24";
  import Search24 from "carbon-icons-svelte/lib/Search24";
  import UserFollow24 from "carbon-icons-svelte/lib/UserFollow24";
  import ChartBar24 from "carbon-icons-svelte/lib/ChartBar24";
  import Close24 from "carbon-icons-svelte/lib/Close24";
  import Time24 from "carbon-icons-svelte/lib/Time24";
  import Star24 from "carbon-icons-svelte/lib/Star24";
  import Send24 from "carbon-icons-svelte/lib/Send24";
  import SendFilled24 from "carbon-icons-svelte/lib/SendFilled24";
  import Location24 from "carbon-icons-svelte/lib/Location24";
  import NewTab24 from "carbon-icons-svelte/lib/NewTab24";
  import CloseFilled24 from "carbon-icons-svelte/lib/CloseFilled24";
  import CloseOutline24 from "carbon-icons-svelte/lib/CloseOutline24";
  import ChevronLeft24 from "carbon-icons-svelte/lib/ChevronLeft24";
  import ChevronRight24 from "carbon-icons-svelte/lib/ChevronRight24";
  import ChevronDown24 from "carbon-icons-svelte/lib/ChevronDown24";
  import OverflowMenuHorizontal24 from "carbon-icons-svelte/lib/OverflowMenuHorizontal24";
  import ChevronSort24 from "carbon-icons-svelte/lib/ChevronSort24";
  import TrashCan24 from "carbon-icons-svelte/lib/TrashCan24";
  import Dashboard24 from "carbon-icons-svelte/lib/Dashboard24";
  import Share24 from "carbon-icons-svelte/lib/Share24";
  import SubtractAlt24 from "carbon-icons-svelte/lib/SubtractAlt24";
  import ArrowLeft24 from "carbon-icons-svelte/lib/ArrowLeft24";
  import Download24 from "carbon-icons-svelte/lib/Download24";
  import Renew24 from "carbon-icons-svelte/lib/Renew24";
  import Copy24 from "carbon-icons-svelte/lib/Copy24";
  import Checkmark24 from "carbon-icons-svelte/lib/Checkmark24";
  import CheckmarkFilled24 from "carbon-icons-svelte/lib/CheckmarkFilled24";
  import CheckmarkOutline24 from "carbon-icons-svelte/lib/CheckmarkOutline24";
  import RadioButton24 from "carbon-icons-svelte/lib/RadioButton24";
  import ChevronUp24 from "carbon-icons-svelte/lib/ChevronUp24";
  import Edit24 from "carbon-icons-svelte/lib/Edit24";
  import RadioButtonChecked24 from "carbon-icons-svelte/lib/RadioButtonChecked24";
  import Menu24 from "carbon-icons-svelte/lib/Menu24";
  import Grid24 from "carbon-icons-svelte/lib/Grid24";

  export let name = "add";
  export let style = undefined;
  export let className = "";
  export let title = "";
  export let size = "";

  const icons = {
    add: Add24,
    addOutline: AddAlt24,
    calendar: Calendar24,
    people: Events24,
    settings: Settings24,
    search: Search24,
    userAdd: UserFollow24,
    chart: ChartBar24,
    close: Close24,
    closeFilled: CloseFilled24,
    closeOutline: CloseOutline24,
    more: OverflowMenuHorizontal24,
    chevronUp: ChevronUp24,
    chevronDown: ChevronDown24,
    chevronLeft: ChevronLeft24,
    chevronRight: ChevronRight24,
    time: Time24,
    pin: Location24,
    star: Star24,
    send: Send24,
    sendFilled: SendFilled24,
    newTab: NewTab24,
    sort: ChevronSort24,
    delete: TrashCan24,
    remove: SubtractAlt24,
    share: Share24,
    arrowBack: ArrowLeft24,
    download: Download24,
    refresh: Renew24,
    copy: Copy24,
    checkmark: Checkmark24,
    checkmarkFilled: CheckmarkFilled24,
    checkmarkOutline: CheckmarkOutline24,
    radio: RadioButton24,
    radioFilled: RadioButtonChecked24,
    edit: Edit24,
    menu: Menu24,
    grid: Grid24,
    dashboard: Dashboard24
  };

  function getStyle() {
    let styles = [];
    if (style) {
      styles.push(style);
    }
    if (size) {
      styles.push(`height:${size}px; width:${size}px`);
    }
    return styles.join(";");
  }

  let props = {};
  $: props = {
    class: `n-icon ${className} icon-${name}`,
    title,
    style: getStyle()
  };
</script>

<style>
  :global(.n-icon) {
    fill: var(--color-inverse);
  }
  :global(.tap-icon .n-icon, .tap-icon .n-icon) {
    fill: var(--color-primary-bright);
  }
  :global(.n-icon-extra path, .n-icon-extra) {
    fill: var(--color-inverse);
  }
</style>

{#if icons[name]}
  <svelte:component this={icons[name]} {...props} />
{:else if name == 'tracker'}
  <svg
    width="24"
    {style}
    {title}
    class="n-icon-extra {className} icon-{name}"
    height="24"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      class="fill"
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12.2667 3.86667H19.7333C24.3725 3.86667 28.1333 7.62748 28.1333
      12.2667V19.7333C28.1333 24.3725 24.3725 28.1333 19.7333
      28.1333H12.2667C7.62748 28.1333 3.86667 24.3725 3.86667
      19.7333V12.2667C3.86667 7.62748 7.62748 3.86667 12.2667 3.86667ZM2
      12.2667C2 6.59654 6.59654 2 12.2667 2H19.7333C25.4035 2 30 6.59654 30
      12.2667V19.7333C30 25.4035 25.4035 30 19.7333 30H12.2667C6.59654 30 2
      25.4035 2 19.7333V12.2667ZM16 19.7333C13.9381 19.7333 12.2667 18.0619
      12.2667 16C12.2667 13.9381 13.9381 12.2667 16 12.2667C18.0619 12.2667
      19.7333 13.9381 19.7333 16C19.7333 18.0619 18.0619 19.7333 16
      19.7333ZM10.4 16C10.4 12.9072 12.9072 10.4 16 10.4C19.0928 10.4 21.6
      12.9072 21.6 16C21.6 19.0928 19.0928 21.6 16 21.6C12.9072 21.6 10.4
      19.0928 10.4 16Z"
      fill="black" />
  </svg>
{/if}
