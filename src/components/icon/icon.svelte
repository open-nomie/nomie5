<script lang="ts">
  import buttonView from "./n-icons/button-view.svelte";
  import detailView from "./n-icons/detail-view.svelte";
  import RadioButtonChecked24 from "carbon-icons-svelte/lib/RadioButtonChecked24";
  import Shuffle24 from "carbon-icons-svelte/lib/Shuffle24";
  import RadioButton24 from "carbon-icons-svelte/lib/RadioButton24";
  // Hero Icons
  import {
    ArrowCircleUp,
    ArrowLeft,
    ArrowUp,
    ArrowsExpand,
    Calendar,
    ChartBar,
    Check,
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ClipboardCopy,
    Clock,
    Cog,
    DotsHorizontal,
    Download,
    FolderAdd,
    Link,
    LocationMarker,
    Menu,
    MinusCircle,
    PaperAirplane,
    Pencil,
    Plus,
    PlusCircle,
    PresentationChartLine,
    Refresh,
    Search,
    Share,
    SortAscending,
    Star,
    SwitchHorizontal,
    Trash,
    User,
    UserAdd,
    UserGroup,
    ViewBoards,
    ViewGrid,
    Home,
    X,
    XCircle,
    DotsVertical,
    ChartPie,
    DotsCircleHorizontal,
    ViewList,
    Eye,
    EyeOff,
    Map,
    Annotation,
    Beaker,
    Bell,
    LockClosed,
    ArrowRight,
    Cake,
    LightBulb,
  } from "svelte-hero-icons";

  export let name = "add";
  export let style = undefined;
  export let className = "";
  export let title = "";
  export let size = "";

  const icons = {
    add: Plus,
    bell: Bell,
    lock: LockClosed,
    annotation: Annotation,
    beaker: Beaker,
    addOutline: PlusCircle,
    arrowBack: ArrowLeft,
    arrowRight: ArrowRight,
    arrowUp: ArrowUp,
    arrowsLeftRight: SwitchHorizontal,
    calendar: Calendar,
    chart: ChartBar,
    cake: Cake,
    expand: ArrowsExpand,
    checkmark: Check,
    checkmarkFilled: CheckCircle,
    checkmarkOutline: CheckCircle,
    chevronDown: ChevronDown,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    chevronUp: ChevronUp,
    close: X,
    closeFilled: XCircle,
    closeOutline: XCircle,
    copy: ClipboardCopy,
    home: Home,
    dashboard: ViewBoards,
    delete: Trash,
    download: Download,
    edit: Pencil,
    pieChart: ChartPie,
    grid: ViewGrid,
    link: Link,
    list: ViewList,
    bulb: LightBulb,
    map: Map,
    menu: Menu,
    more: DotsHorizontal,
    moreOutline: DotsCircleHorizontal,
    moreVertical: DotsVertical,
    newTab: FolderAdd,
    people: UserGroup,
    pin: LocationMarker,
    radio: RadioButton24,
    radioFilled: RadioButtonChecked24,
    refresh: Refresh,
    remove: MinusCircle,
    report: PresentationChartLine,
    search: Search,
    sendFilled: ArrowCircleUp,
    airplane: PaperAirplane,
    settings: Cog,
    share: Share,
    shuffle: Shuffle24,
    sort: SortAscending,
    star: Star,
    time: Clock,
    tracker: ViewGrid,
    userAdd: UserAdd,
    user: User,
    buttonView: buttonView,
    detailView: detailView,
    eye: Eye,
    eyeOff: EyeOff,
  };
</script>

<style>
  .n-icon {
    display: inline-flex;
  }
</style>

{#if icons[name]}
  <span class="n-icon n-icon-{name} {className}" {style} aria-label={title}>
    <svelte:component this={icons[name]} size={`${size || 24}`} />
  </span>
{/if}
