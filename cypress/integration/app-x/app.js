/// <reference types="Cypress" />

context("App", () => {
  beforeEach(() => {});

  const visit = () => {
    cy.visit("http://localhost:5000");
    cy.wait(1000);
  };
  const onboard = () => {
    cy.visit("http://localhost:5000");
    cy.wait(1000);
    cy.get(".layout-footer .n-toolbar .btn").eq(0).click();
    cy.wait(200);
    cy.get(".layout-footer .n-toolbar .btn").eq(0).click();
    cy.wait(200);
    cy.get(".layout-footer .n-toolbar .btn").eq(1).click();
    cy.wait(400);
    cy.get(".layout-footer .n-toolbar .btn").eq(1).click();
    cy.wait(400);
    cy.get(".layout-footer .n-toolbar .btn").eq(1).click();
    cy.wait(400);
    cy.get(".top > :nth-child(2)").click();
    cy.wait(400);
    cy.get(".layout-footer .n-toolbar .btn").eq(1).click();
    cy.wait(1000);
  };

  const selectStarters = () => {
    cy.get(".tracker-mood").click();
    cy.wait(200);
    cy.get(".tracker-sleep").click();
    cy.wait(200);
    cy.get(".tracker-water").click();
    cy.wait(200);
    cy.get(".tracker-pooped").click();
    cy.wait(200);
    cy.get(".tracker-sex").click();
    cy.wait(200);
    cy.get(".tracker-sleep_quality").click();
    cy.wait(200);
    cy.get(".library-modal > .n-modal > .n-modal-footer > .btn").click();
    cy.wait(300);
    // cy.get(".left > .btn > .n-icon").click();
  };

  const trackWater = () => {
    cy.get(".tracker-water").click();
    cy.wait(500);
    cy.get(".r-0.b-0").click();
    cy.get(".r-3.b-0").click();
    cy.wait(300);
    cy.get(".r-3.b-0").click();
    cy.get(".main > .btn").click();
    cy.wait(600);
  };

  const startTimer = () => {
    cy.get(".tracker-sleep").click();
    cy.wait(500);
    cy.get(".btn-success").click();
  };

  

  const trackMood = (addOrSave = "save") => {
    cy.get(".tracker-mood").click();
    cy.wait(1000);
    cy.get(".tracker-input.slider input").as("range").invoke("val", 8).trigger("change");
    cy.wait(400);
    if (addOrSave == "save") {
      cy.get(".main > .btn").click();
      cy.wait(400);
    } else {
      cy.get(".right .btn").eq(2).click();
    }
    // cy.get(".n-modal-footer > .footer > .btn-primary").click();
  };


  const useTrackers = () => {
    trackWater();
    trackMood();
    startTimer();
  };

  const testTips = () => {
    cy.wait(400);
    cy.get(".n-tips > .mx-auto > :nth-child(5) > .n-icon").click();
    cy.wait(100);
    cy.get(".n-tips > .mx-auto > :nth-child(5) > .n-icon").click();
    cy.wait(100);
    cy.get(".n-tips > .mx-auto > :nth-child(5) > .n-icon").click();
    cy.wait(100);
    cy.get(".n-tips > .mx-auto > :nth-child(5) > .n-icon").click();
    cy.wait(100);
    cy.get(".n-stepper > :nth-child(5)").should("have.class", "active");
    cy.get(".n-tips .btn-close").click();
    cy.wait(100);
    cy.get(".visible > .alert-dialog-window > .p-1 > .btn-primary").click();
  };

  const testCaptureForm = () => {
    cy.get("#textarea-capture-note").type("#sample #data #mood(6)");
    cy.get(".save-button").click();
    cy.wait(200);
    cy.get("#textarea-capture-note").should("contain.value", "");
  };

  const testHistory = () => {
    cy.get(".tab-History").click();
    cy.wait(400);
  };

  const enableFeatures = () => {
    cy.get(".tab-Settings").click();
    cy.wait(200);
    // Enable People
    cy.get("[name=onoffswitch]").eq(0).type("true", { force: true });
    cy.wait(200);
    // Enable Dashboard
    cy.get("[name=onoffswitch]").eq(1).type("true", { force: true });
    cy.wait(200);
    // Go back home
    cy.get(".tab-Track").click();

    cy.wait(200);
  };

  const testDashboard = () => {
    cy.wait(200);
    cy.get(".tab-Dash").click();
    cy.wait(400);
    // Click on the Add Widghet
    cy.get(".center-all > .btn").click();
    cy.wait(100);
    cy.get("select").eq(0).select("barchart");
    cy.wait(100);
    cy.get("select").eq(1).select("this-week");
    cy.wait(300);
    cy.get('[slot="right"] > .n-text').click();
    // Select Trackers
    cy.wait(200);
    cy.get(".list > :nth-child(1)").click();
    cy.wait(1000);
    // Select mood
    cy.get(".n-modal-body .list .n-item").eq(2).click();
    // click done
    cy.wait(200);
    cy.get(".n-row > .btn-primary").click();
    cy.wait(200);
    // hit save

    cy.get("div.n-modal-header> div > button").eq(1).click();
    cy.wait(1000);
  };

  const longPressTracker = (tag) => {
    cy.wait(100);
    cy.get(`.tracker-${tag}`).trigger("mousedown");
  };

  const testDeleteingTracker = () => {
    cy.get(".tab-Track").click();
    longPressTracker("water");
    cy.wait(400);
    cy.get(".list > :nth-child(7)").click();
    cy.wait(400);
    // Hit Cancel first -- to see if this gets deleted
    cy.get(".visible > .alert-dialog-window > .p-1 > .btn-transparent").click();
    cy.wait(500);
    cy.get(".trackers").then((node) => {
      expect(node.html().search(".tracker-water")).to.be.gt(-1);
    });
    cy.wait(500);
    longPressTracker("water");
    cy.wait(400);
    cy.get(".list > :nth-child(7)").click();
    cy.wait(400);
    cy.get(".visible > .alert-dialog-window > .p-1 > .btn-primary").click();
    cy.wait(600);
    cy.get(".trackers").then((node) => {
      expect(node.html().search(".tracker-water")).to.be.eq(-1);
    });
  };

  const testPin = () => {
    cy.get(".tab-Settings").click();
    cy.wait(1000);
    cy.get(".features [name=onoffswitch]").eq(3).type("true", { force: true });
    cy.wait(1000);
    cy.get(".slot-holder > .form-control").type(1234);
    cy.wait(600);
    cy.get(".visible > .alert-dialog-window > .p-1 > .btn-primary").click();

    // Bad Pin
    cy.wait(1000);
    cy.get(".keypad > :nth-child(2)").click();
    cy.wait(100);
    cy.get(".keypad > :nth-child(1)").click();
    cy.wait(100);
    cy.get(".keypad > :nth-child(3)").click();
    cy.wait(100);
    cy.get(".keypad > :nth-child(4)").click();
    cy.wait(100);
    cy.get(".keypad > :nth-child(12)").click();
    cy.wait(1000);
    cy.get(".alert-dialog.visible > .alert-dialog-window > .p-1 > .btn").click();
    cy.wait(300);

    // Good Pin
    cy.wait(1000);
    cy.get(".keypad > :nth-child(1)").click();
    cy.wait(100);
    cy.get(".keypad > :nth-child(2)").click();
    cy.wait(100);
    cy.get(".keypad > :nth-child(3)").click();
    cy.wait(100);
    cy.get(".keypad > :nth-child(4)").click();
    cy.wait(100);
    cy.get(".keypad > :nth-child(12)").click();

    cy.wait(500);
    cy.get(".tab-Track").click();
  };

  const initBasic = () => {
    window.localStorage.clear();
    window.indexedDB.deleteDatabase("localforage");
    onboard();
    selectStarters();
  };

  const exportData = () => {
    cy.get(".tab-Settings").click();
    cy.wait(400);
  };

  const testPerson = () => {
    // Type
    cy.get("#textarea-capture-note").type("hello there @bob, I hope you are well! Also, let's add @billy, @frank and @chunk");
    cy.get(".save-button").click();
    cy.get(".tab-People").click();
    cy.wait(400);
    // Tap on the check-in for the person created
    cy.get(".n-list .n-item .right .btn").eq(2).click();
    cy.wait(400);
    cy.get(".person-checkin textarea").type(" and I are going to test +nomie!");
    // Select a positivity
    cy.get(".n-positivity-selector > :nth-child(4)").click();
    cy.get(".person-checkin > .btn-block").click();
    cy.wait(2000);
    // Click the person check in again.
    cy.get(".n-list .n-item .right .btn").eq(2).click();
    cy.wait(400);
    // View Logs
    cy.get(".person-modal .n-modal-header .btn-group .btn").eq(0).click();
    cy.get(".person-modal .log-list-loader > .n-list")
      .find(".n-item")
      .then((listing) => {
        // const count = Cypress.$(listing).length;
        expect(listing).to.contain("@bob");
      });
    // Close modal
    cy.get(".person-modal .left > .btn > .n-icon").click();
    cy.wait(400);
    goHome();
  };

  const testTabs = () => {
    goHome();
    cy.wait(200);
    // Click tab icon
    cy.get("header > .n-toolbar-grid > .right > .btn").click();
    cy.wait(300);
    cy.get(".form-control").type("Test Tab");
    cy.wait(100);
    cy.get(".visible > .alert-dialog-window > .p-1 > .btn-primary").click();
    cy.wait(100);
    // Click Add Button
    cy.get(".btn-group.mr-1").click();
    cy.wait(300);
    cy.get(".pop-menu button").eq(1).click();
    cy.wait(400);
    cy.get(".tracker-selector-modal .n-item").eq(0).click();
    cy.wait(400);
    cy.get(".n-row > .btn-primary").click();
    // cy.wait(400);
    // cy.get(".tracker-water").then((node) => {
    //   expect(node.text()).to.contain("Drank Water");
    // });
    cy.wait(500);
    cy.get(".board-all").click();
  };

  const createTracker = (options={})=>{
    // Click Add Tracker
    cy.get('.tracker-add > .item-ball').click();
    cy.wait(200);
    // click create a tracker in pop menu
    cy.get('.list > :nth-child(1)').click();
    cy.wait(200);
    cy.get('.n-tracker-editor .emoji-editor input').type(options.emoji || '🎭');
    cy.get('.n-tracker-editor .tracker-label input').type(options.label || `Test ${options.type || 'Tracker'}`)

    options.type = options.type || "tick"

    // open advanced 
    cy.get('.advanced-toggler').click();
    cy.wait(200);

    // Open the Tracker Type Selector
    cy.get('.tracker-type').click();
    cy.wait(400);

    switch(options.type) {
      case 'tick':
        cy.get('.pop-button-0').click();
        cy.wait(400);
        if(options.one_tap) {
          cy.get('.tracker-one-tap .onoffswitch').click();
          
        }
      break

      case "value":
        cy.get('.pop-button-1').click();
        cy.wait(100);
      break;

      case "range":
        cy.get('.pop-button-2').click();
        cy.wait(100);
      break;

      case "picker":
        cy.get('.pop-button-3').click();
        cy.wait(100);
      break;

      case "timer":
        cy.get('.pop-button-4').click();
        cy.wait(100);
      break;

      case "note":
        cy.get('.pop-button-5').click();
        cy.wait(100);
        cy.get('.tracker-note > .n-input-wrapper textarea').type(options.note)
      break;
    }

    if(options.math) {
      cy.get('.tracker-math > .n-input-wrapper > .n-input > select').select(options.math);
    }

    if(options.default) {
      cy.get('.tracker-default input').type(options.default);
    }

    cy.wait(300);
    // Save Button
    cy.get('.n-tracker-editor > .n-modal-frame > .n-modal > .n-modal-header > .n-toolbar-grid > .right').click();
    
  }



  const goHome = async () => {
    return cy.get(".tab-Track").click();
  };

//   tick
// value
// range
// picker
// timer
// note

  const tests = [
    {
      it: "should onboard with localstorage",
      run: initBasic,
    },
    {
      it: "should create a tally tracker",
      run: ()=>{
        return createTracker({
          type: 'tick',
          label: "Tick Tracker",
          emoji: "🏄‍♀️",
          one_tap: true
        })
      }
    },
    {
      it: "should create a value tracker",
      run: ()=>{
        return createTracker({
          type: 'value',
          label: "Value Tracker",
          emoji: "💰",
          default: 12
        })
      }
    },
    {
      it: "should create a note tracker",
      run: ()=>{
        return createTracker({
          type: 'note',
          label: "Note Tracker",
          emoji: "📒",
          note: "#value_tracker #tick_tracker"
        })
      }
    },
    {
      it: "should create a timer tracker",
      run: ()=>{
        return createTracker({
          type: 'timer',
          label: "Timer Tracker",
          emoji: "⏰"
        })
      }
    },
    { it: "should enable features", run: enableFeatures },
    { it: "Should properly track using the tracker buttons", run: useTrackers },
    { it: "should test adding a tab", run: testTabs },
    { it: "should delete a tracker", run: testDeleteingTracker },
    // { it: "should create a multi tracker", run: createMultiTracker },
    { it: "should test the PIN", run: testPin },
    { it: "should be able to create a log via a note", run: testCaptureForm },
    { it: "Should properly test the tips", run: testTips },
    { it: "Should properly handle adding a person via a note", run: testPerson },
    // { it: "should create a simple tracker", run: createSimpleTracker },
    { it: "should test the dashboard", run: testDashboard },
    { it: "should have all the things in history", run: testHistory },
  ];
  

  tests.forEach((test)=>{
    it(test.it, ()=>test.run())
  })