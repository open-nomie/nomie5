<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import { navigate } from "svelte-routing";
  import NPage from "../../containers/layout/page.svelte";
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  import AppLayout from "../layout/app.svelte";

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
  import { TrackerStore } from "../../store/trackers";

  let step = 0;
  let maxSteps = 4;
  let stepChange = false;
  let stepCount = 0;

  const cancel = async () => {
    let confirmed = await Interact.confirm(
      "Are you sure?",
      "Any changes will be lost"
    );
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
      }
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
      }
    };
    const emoji = {
      component: StepEmoji,
      title: "Select the emoji",
      validate() {
        return $TrackerDesignerStore.tracker.emoji;
      }
    };
    const calc = {
      title: "Totals Calculation",
      component: StepCalc,
      validate() {
        return $TrackerDesignerStore.tracker.math;
      }
    };
    const color = {
      title: "Pick a Tracker Color",
      component: StepColor,
      validate() {
        return $TrackerDesignerStore.tracker.color;
      }
    };
    const type = {
      title: "Pick the Tracker Type",
      component: StepType,
      validate() {
        return $TrackerDesignerStore.tracker.type;
      }
    };
    const defaultValue = {
      title: "Set Tracker Defaults",
      component: StepDefaults,
      validate() {
        return $TrackerDesignerStore.tracker.type;
      }
    };
    const uom = {
      title: "Unit of Measurement",
      component: StepUOM,
      validate() {
        return $TrackerDesignerStore.tracker.uom;
      }
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
        _steps = [type, label, emoji, color, defaultValue, calc, positivity];
        break;
      default:
        _steps = [
          type,
          label,
          emoji,
          color,
          uom,
          defaultValue,
          calc,
          positivity
        ];
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

<AppLayout showTabs={false}>

  <div
    slot="header"
    class="bg-bg pt-1 tracker-preview"
    style="background-color:{$TrackerDesignerStore.tracker.color};
    box-shadow:0px 10px 10px -9px {$TrackerDesignerStore.tracker.color}">

    <div class="n-toolbar-grid">
      <button class="btn btn-clear text-white left" on:click={cancel}>
        <NIcon name="close" className="fill-white" size="32" />
      </button>
      <div class="main text-white text-center">
        <div>#{step + 1}. {activeStep.title}</div>
        <NStepper steps={stepCount} current={step} />
      </div>
    </div>

    <div class="n-row align-top">
      <div class="text-bold filler text-center mb-2">
        <NTrackerButton tracker={$TrackerDesignerStore.tracker} />
      </div>
    </div>

  </div>

  <main slot="content" class="bg-solid main-body pt-4 pb-4">
    {#if activeStep}
      <svelte:component this={activeStep.component} />
    {/if}
  </main>

  <footer slot="footer" class="bg-solid">
    <div class="container-sm">
      <NToolbar className="">
        <button
          on:click={previousStep}
          disabled={step == 0}
          class="btn btn-block btn-dark mr-1 my-0">
          Previous
        </button>
        <button
          on:click={nextStep}
          class="btn btn-block ml-1 my-0 btn-primary"
          disabled={!canGoNext}>
          {step == getSteps().length - 1 ? Lang.t('general.create', 'Create') : Lang.t('general.next', 'Next')}
        </button>
      </NToolbar>
    </div>
  </footer>

</AppLayout>
