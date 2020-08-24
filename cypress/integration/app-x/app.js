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
    cy.get(".n-toolbar-grid > .btn").eq(0).click();
    cy.wait(200);
    cy.get(".n-toolbar-grid > .btn").eq(1).click();
    cy.wait(200);
    cy.get(".n-toolbar-grid > .btn").eq(1).click();
    cy.wait(400);
    cy.get(".n-toolbar-grid > .btn").eq(1).click();
    cy.wait(400);
    cy.get(".n-toolbar-grid > .btn").eq(1).click();
    cy.wait(400);
    cy.get(".top > :nth-child(2)").click();
    cy.wait(200);
    cy.get(".n-toolbar-grid > .btn").eq(1).click();
    cy.wait(1000);
  };

  const selectStarters = () => {
    cy.get(".n-modal-frame .tracker-option").eq(0).click();
    cy.wait(200);
    cy.get(".n-modal-frame .tracker-option").eq(1).click();
    cy.wait(200);
    cy.get(".n-modal-frame .tracker-option").eq(2).click();
    cy.wait(200);
    cy.get(".n-modal-frame .tracker-option").eq(3).click();
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
    cy.get(".tracker-water .score").should("contain", "11");
  };

  const startTimer = () => {
    cy.get(".tracker-sleep").click();
    cy.wait(500);
    cy.get(".btn-success").click();
  };

  const createSimpleTracker = () => {
    // const next = () => {
    //   cy.get(".footer-slot button").eq(1).click();
    // };
    // cy.get(".tracker-undefined").click();
    // cy.wait(300);
    // cy.get(".pop-menu button").eq(1).click();
    // next();
    // cy.get(".n-input input").type("Simple Tracker");
    // next();
    // cy.get(".input-emoji").type("😂");
    // next();
    // cy.wait(400);
    // cy.get('[style="background-color: rgb(255, 160, 0);"]').click();
    // next();
    // cy.get(".onoffswitch-label").click();
    // next();
    // cy.get("select").as("select").invoke("val", "1").trigger("change");
    // next();
    // cy.get(".tracker-simple_tracker").should("exist");
    // cy.get(".tracker-simple_tracker").click();
    // cy.wait(400);
    // cy.get(".tracker-simple_tracker .score").should("be", "1");
  };

  const createMultiTracker = () => {
    const next = () => {
      cy.get(".layout-footer button").eq(1).click();
    };
    cy.get(".tracker-undefined").click();
    cy.wait(300);
    cy.get(".pop-menu button").eq(1).click();
    cy.wait(300);
    cy.get(".n-item.type-note").click();
    cy.wait(300);
    next();
    cy.get(".container > .ml-1");
    cy.wait(300);
    cy.get(".n-input input").type("Check up");
    next();
    cy.get(".input-emoji").type("✅");
    next();
    cy.wait(400);
    cy.get('[style="background-color: rgb(255, 160, 0);"]').click();
    next();
    cy.get("textarea").type("#mood #sleep_quality");
    next();
    trackMulti();
    cy.wait(400);

    // cy.get(".onoffswitch-label").click();
    // next();
    // cy.get("select").as("select").invoke("val", "1").trigger("change");
    // next();
    // cy.get(".tracker-simple_tracker").should("exist");
    // cy.get(".tracker-simple_tracker").click();
    // cy.wait(400);
    // cy.get(".tracker-simple_tracker .score").should("be", "1");
  };

  const trackMood = (addOrSave = "save") => {
    cy.get(".tracker-mood").click();
    cy.wait(1000);
    cy.get(".tracker-input.slider input").as("range").invoke("val", 8).trigger("change");
    cy.wait(400);
    if (addOrSave == "save") {
      cy.get(".main > .btn").click();
      cy.wait(400);
      cy.get(".tracker-mood .score").should("contain", "8");
    } else {
      cy.get(".right .btn").eq(2).click();
    }
    // cy.get(".n-modal-footer > .footer > .btn-primary").click();
  };

  const trackMulti = (addOrSave = "save") => {
    cy.get(".tracker-check_up").click();
    cy.wait(500);
    cy.get(".tracker-input.slider input").as("range").invoke("val", 8).trigger("change");
    cy.wait(100);
    cy.get(".footer > .right > .btn").click();
    cy.wait(500);
    cy.get(".tracker-input.slider input").as("range").invoke("val", 5).trigger("change");
    cy.wait(100);
    cy.get(".footer > .right > .btn").click();
    cy.wait(500);
    cy.get("#textarea-capture-note").should("contain.value", "#mood(8)");
    cy.wait(500);
    cy.get(".save-button").click();
    // cy.get(".n-modal-footer > .footer > .btn-primary").click();
  };

  const useTrackers = () => {
    trackWater();
    trackMood();
    startTimer();
  };

  const createTrackers = () => {
    createSimpleTracker();
  };

  const testTips = () => {
    cy.wait(400);
    cy.get(".n-tips .n-row > .d-flex > .btn").click();
    cy.wait(100);
    cy.get(".n-tips .n-row > .d-flex > .btn").click();
    cy.wait(100);
    cy.get(".n-tips .n-row > .d-flex > .btn").click();
    cy.wait(100);
    cy.get(".n-tips .n-row > .d-flex > .btn").click();
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
    cy.get('[href="/history"]').click();
    cy.wait(400);
  };

  const enableFeatures = () => {
    cy.get('[href="/settings"]').click();
    cy.wait(200);
    // Enable People
    cy.get("[name=onoffswitch]").eq(0).type("true", { force: true });
    cy.wait(200);
    // Enable Dashboard
    cy.get("[name=onoffswitch]").eq(1).type("true", { force: true });
    cy.wait(200);
    // Go back home
    cy.get('.n-row > [href="/"]').click();

    cy.wait(200);
  };

  const initBasic = () => {
    window.localStorage.clear();
    window.indexedDB.deleteDatabase("localforage");
    onboard();
    selectStarters();
    enableFeatures();
  };

  const exportData = () => {
    cy.get('[href="/settings"]').click();
    cy.wait(400);
  };

  const testPerson = () => {
    // Type
    cy.get("#textarea-capture-note").type("hello there @bob, I hope you are well! Also, let's add @billy, @frank and @chunk");
    cy.get(".save-button").click();
    cy.get('[href="/people"]').click();
    cy.wait(400);
    // cy.get(".n-item .title").should("contain.value", "bob");
    cy.get(".n-item").click();
    cy.wait(400);
    cy.get(".person-checkin textarea").type(" and I are going to test +nomie!");
    cy.get(".btn-group > :nth-child(5)").click();
    cy.get(".person-checkin > .btn-block").click();
    cy.wait(2000);
    cy.get('[slot="left"] > .btn > .n-icon').click();
    cy.wait(400);
    // View Logs
    cy.get(".person-modal .n-modal-header .btn-group .btn").eq(0).click();
    cy.get(".person-modal .log-list-loader > .n-list")
      .find(".n-item")
      .then((listing) => {
        // const count = Cypress.$(listing).length;
        expect(listing).to.have.length(2);
      });
    // Close modal
    cy.get(".person-modal .left > .btn > .n-icon").click();
    cy.wait(400);
    cy.get('.n-row > [href="/"]').click();
  };

  it("Should On Boarding with Local", () => {
    initBasic();
    // exportData();
  });

  it("Should properly handle adding a person via a note", () => {
    testPerson();
  });

  // it("Should properly track using the tracker buttons", () => {
  //   // testTips();
  //   useTrackers();
  // });

  // it("Should create and be able to use a multi-tracker", () => {
  //   createMultiTracker();
  // });

  // it("should be able to create a log via a note", () => {
  //   testCaptureForm();
  // });

  // it("should have all the things in history", () => {
  //   testHistory();
  // });
});

// cy.wait(200);

// cy.get(".footer-buttons > .btn")
//   .contains("Next")
//   .click();

// cy.wait(300);

// cy.get(
//   ".full-screen.visible > .alert-dialog-window > .p-2 > .btn-primary"
// ).click();

// cy.wait(200);

// cy.get(".board-actions > .btn").click();
// cy.wait(200);
// cy.get('input[name="label"]').type("Test Tracker");
// cy.get('input[name="emoji"]').type("🚦");
// cy.wait(200);
// cy.get(".n-modal-footer > .btn-primary").click();
// cy.wait(200);
// cy.get(".tracker-test_tracker > .emoji").click();
// cy.wait(200);
// cy.get(".save-button").click();
// cy.wait(1000);
// cy.get(".tracker-test_tracker .value").contains("1");
// cy.get(".tracker-test_tracker > .emoji").click();
// cy.wait(200);
// cy.get(".save-button").click();
// cy.wait(1000);
// cy.get(".tracker-test_tracker .value").contains("2");

// cy.wait(200);
// // Add a board
// cy.get(".add-board").click();
// cy.wait(400);
// // Add the name Test Board
// cy.get(".slot-holder > .form-control").type("Test Board");
// cy.wait(400);
// // Click OK
// cy.get(
//   ".full-screen.visible > .alert-dialog-window > .p-2 > .btn-primary"
// ).click();
// cy.wait(400);
// // Click confirmed ok
// cy.get(".full-screen.visible > .alert-dialog-window > .p-2 > .btn").click();
// cy.wait(400);
// //
// cy.get(".board-actions > :nth-child(1)").click();
// cy.wait(400);
// // Select "Existing Trackers"
// cy.get(".list > :nth-child(2)").click();
// cy.wait(500);
// // select first two from tracker list
// cy.get(".n-modal .list > :nth-child(1)").click();
// cy.get(".n-modal .list > :nth-child(2)").click();
// cy.get(".n-modal .n-row > .btn-primary").click();
// // We should be in the test board with the new trackers

// // Click the water tracker
// cy.get(".tracker-water").click();

// cy.wait(200);
// // Clcik the save button
// cy.get(".n-modal-footer > .footer > .btn-primary").click();

// cy.wait(400);
// cy.get(".tracker-water .value").contains("12 oz");

// cy.get('.footer-buttons > .btn')
// 	.contains('Login/Register')
// 	.click();
