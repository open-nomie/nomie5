<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import { navigate } from "svelte-routing";
  import NPage from "../../containers/layout/page.svelte";
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  import NLayout from "../layout/layout.svelte";

  import NTrackerButton from "../../containers/board/tracker-button.svelte";
  import NStepper from "../../components/stepper/stepper.svelte";
  import NIcon from "../../components/icon/icon.svelte";
  import StepLabel from "./step-label.svelte";
  import StepEmoji from "./step-emoji.svelte";
  import StepType from "./step-type.svelte";
  import StepColor from "./step-color.svelte";
  import StepUOM from "./step-uom.svelte";
  import StepDefaults from "./step-defaults.svelte";
  import StepCalc from "./step-calc.svelte";
  import StepPositivity from "./step-positivity.svelte";

  // Stores
  import { Lang } from "../../store/lang";
  import { Interact } from "../../store/interact";
  import { TrackerStore } from "../../store/tracker-store";
  import Text from "../../components/text/text.svelte";
  import Button from "../../components/button/button.svelte";
  import Icon from "../../components/icon/icon.svelte";

  let step = 0;
  let maxSteps = 4;
  let stepChange = false;
  let stepCount = 0;

  const cancel = async () => {
    let confirmed = await Interact.confirm("Are you sure?", "Any changes will be lost");
    if (confirmed) {
      TrackerDesignerStore.clear();
      navigate("/");
    }
  };

  const saveTracker = async () => {
    let saved = await TrackerStore.saveTracker($TrackerDesignerStore.tracker);
    TrackerDesignerStore.clear();
    navigate("/");
  };

  const nextStep = () => {
    let steps = getSteps();
    if (step < steps.length - 1) {
      step++;
    } else if (step == steps.length - 1) {
      saveTracker();
    }
  };

  const previousStep = () => {
    if (step > -1) {
      step = step - 1;
    }
  };

  const getSteps = () => {
    const label = {
      component: StepLabel,
      title: "Tracker label",
      validate() {
        return $TrackerDesignerStore.tracker.label.length > 1;
      },
    };
    const positivity = {
      component: StepPositivity,
      title: "Positivity",
      validate() {
        if ($TrackerDesignerStore.tracker.score == "custom") {
          return ($TrackerDesignerStore.tracker.score_calc || []).length > 0;
        } else {
          return true;
        }
      },
    };
    const emoji = {
      component: StepEmoji,
      title: "Select the emoji",
      validate() {
        return $TrackerDesignerStore.tracker.emoji;
      },
    };
    const calc = {
      title: "Totals Calculation",
      component: StepCalc,
      validate() {
        return $TrackerDesignerStore.tracker.math;
      },
    };
    const color = {
      title: "Pick Tracker Color",
      component: StepColor,
      validate() {
        return $TrackerDesignerStore.tracker.color;
      },
    };
    const type = {
      title: "Pick Tracker Type",
      component: StepType,
      validate() {
        return $TrackerDesignerStore.tracker.type;
      },
    };
    const defaultValue = {
      title: "Set Tracker Defaults",
      component: StepDefaults,
      validate() {
        return $TrackerDesignerStore.tracker.type;
      },
    };
    const uom = {
      title: "Unit of Measurement",
      component: StepUOM,
      validate() {
        return $TrackerDesignerStore.tracker.uom;
      },
    };

    let _steps = [];
    switch ($TrackerDesignerStore.tracker.type) {
      case "tick":
        _steps = [type, label, emoji, color, defaultValue, positivity];
        break;
      case "note":
        _steps = [type, label, emoji, color, defaultValue];
        break;
      case "timer":
        _steps = [type, defaultValue, label, emoji, color, defaultValue, calc, positivity];
        break;
      case "picker":
        _steps = [type, label, emoji, color, defaultValue];
        break;
      default:
        _steps = [type, label, emoji, color, uom, defaultValue, calc, positivity];
        break;
    }
    stepCount = _steps.length;
    return _steps;
  };

  let activeStep = getSteps()[step];
  let canGoNext = false;

  $: if (step !== null) {
    let steps = getSteps();
    activeStep = steps[step];
  }
  $: if ($TrackerDesignerStore.tracker) {
    let steps = getSteps();
    canGoNext = activeStep.validate();
  }
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";
  :global(.tracker-preview) {
    margin-bottom: 10px;
  }
  :global(.tracker-preview .n-stepper) {
    max-width: 400px;
    width: 100%;
    margin: 0 auto;
  }
  :global(.tracker-preview .item-ball .username) {
    display: none;
  }
  .main-body {
    @include media-breakpoint-up(md) {
      padding-top: 100px !important;
    }
  }
</style>

<NLayout showTabs={false}>

  <div slot="header" class="tracker-preview" style="background-color:{$TrackerDesignerStore.tracker.color};">

    <div class="n-toolbar-grid h-100" style="min-height:60px">
      <div class="left">
        <Button color="circle" className="tap-icon" on:click={cancel}>
          <NIcon name="close" className="fill-white" size="24" />
        </Button>
      </div>
      <div class="main text-white text-center">
        <Text size="sm" style="color:#FFF">Step {step + 1}: {activeStep.title}</Text>
      </div>
    </div>

    <!-- <div class="n-row align-top">
      <div class="text-bold filler text-center mb-2">
        <NTrackerButton tracker={$TrackerDesignerStore.tracker} />
      </div>
    </div> -->

  </div>

  <main slot="content" class="bg-bg main-body pt-4 pb-4">
    {#if activeStep}
      <svelte:component this={activeStep.component} />
    {/if}
  </main>

  <footer slot="footer" class="" style="height:60px; background-color:var(--footer-background)">
    <div class="container-sm pt-1">
      <NToolbar className="">
        <Button on:click={previousStep} disabled={step == 0} color="transparent" block className="mr-1 my-2">
          {Lang.t('general.back', 'Back')}
        </Button>
        <Button on:click={nextStep} block color="transparent" disabled={!canGoNext} className="mt-0 text-primary-bright">
          {step == getSteps().length - 1 ? Lang.t('general.create', 'Create') : Lang.t('general.next', 'Next')}
          <Icon name="chevronRight" size="20" className="fill-primary-bright" />
        </Button>
      </NToolbar>
    </div>
  </footer>
</NLayout>
