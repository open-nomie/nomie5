<script>
  import { TrackerDesignerStore } from "./tracker-designer-store";
  import { navigate } from "svelte-routing";
  import NPage from "../../containers/layout/page.svelte";
  import NToolbar from "../../components/toolbar/toolbar.svelte";
  import AppLayout from "../layout/app.svelte";

  import NTrackerButton from "../../containers/board/tracker-button.svelte";
  import NStepper from "../../components/stepper/stepper.svelte";

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
    let confirmed = await Interact.confirm("Cancel creating this tracker?");
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
      title: "Pick a Color for this tracker",
      component: StepColor,
      validate() {
        return $TrackerDesignerStore.tracker.color;
      }
    };
    const type = {
      title: "Pick the tracker type",
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
  .tracker-preview {
    border-bottom-left-radius: 20%;
    border-bottom-right-radius: 20%;
    margin-bottom: 10px;
  }
</style>

<AppLayout showTabs={false}>

  <main slot="content" class="n-panel bg-solid scroll-y vertical n-panel-fixed">

    <div
      class="bg-bg pt-1 tracker-preview"
      style="background-color:{$TrackerDesignerStore.tracker.color};
      box-shadow:0px 10px 10px -9px {$TrackerDesignerStore.tracker.color}">

      <div class="n-row">
        <button class="btn btn-clear text-solid" on:click={cancel}>
          <i class="zmdi zmdi-close text-lg" />
        </button>
        <div class=" text-bold filler text-center">
          <NTrackerButton tracker={$TrackerDesignerStore.tracker} />

        </div>
        <button class="btn btn-clear">
          <i class="zmdi zmdi-close text-lg opacity-0" />
        </button>
      </div>
      <div class="n-row text-white">
        <div class="filler" />
        {activeStep.title}
        <div class="filler" />
      </div>

      <div class="p-2 px-5 mx-auto" style="max-width:80%;">
        <NStepper steps={stepCount} current={step} />
      </div>

    </div>

    {#if activeStep}
      <svelte:component this={activeStep.component} />
    {/if}
    <NToolbar />
  </main>

  <footer slot="footer">
    <NToolbar>
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
  </footer>

</AppLayout>
