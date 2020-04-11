/// <reference types="Cypress" />

context("App", () => {
  beforeEach(() => {});

  const onboard = () => {
    cy.visit("http://localhost:5000");
    cy.wait(1000);
    cy.get(".footer-buttons > .btn").click();
    cy.wait(400);
    cy.get(".footer-buttons > :nth-child(3)").click();
    cy.wait(400);
    cy.get(".footer-buttons > :nth-child(3)").click();
    cy.wait(400);
    cy.get(".footer-buttons > :nth-child(3)").click();
    cy.wait(400);
    cy.get(".footer-buttons > :nth-child(3)").click();
    cy.wait(400);
    cy.get(".slide-4 > .top > :nth-child(2)").click();
    cy.wait(400);
    cy.get(".footer-buttons > :nth-child(3)").click();
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
    cy.get('.n-modal-footer button[slot="footer"]').click();
  };

  const trackWater = () => {
    cy.get(".tracker-water").click();
    cy.wait(500);
    cy.get(".row-0 > .button-0").click();
    cy.wait(300);
    cy.get(".row-0 > .button-0").click();
    cy.get(".n-modal-footer > .footer > .btn-primary").click();
    cy.wait(100);
    cy.get(".tracker-water .score").should("contain", "11");
  };

  const startTimer = () => {
    cy.get(".tracker-sleep").click();
    cy.wait(500);
    cy.get(".btn-success").click();
  };

  const createSimpleTracker = () => {
    const next = () => {
      cy.get(".footer-slot button").eq(1).click();
    };

    cy.get(".tracker-undefined").click();
    cy.wait(300);
    cy.get(".pop-menu button").eq(1).click();
    next();
    cy.get(".n-input input").type("Simple Tracker");
    next();
    cy.get(".input-emoji").type("😂");
    next();
    cy.get('[style="background-color: rgb(165, 214, 167);"]').click();
    next();
    cy.get(".onoffswitch-label").click();
    next();
    cy.get("select").as("select").invoke("val", "1").trigger("change");
    next();
    cy.get(".tracker-simple_tracker").should("exist");
    cy.get(".tracker-simple_tracker").click();
    cy.wait(400);
    cy.get(".tracker-simple_tracker .score").should("be", "1");
  };

  const trackMood = (addOrSave = "save") => {
    cy.get(".tracker-mood").click();
    cy.wait(500);
    cy.get(".tracker-input.slider input").as("range").invoke("val", 8).trigger("change");
    cy.wait(100);
    if (addOrSave == "save") {
      cy.get(".n-modal-footer > .footer > .btn-primary").click();
      cy.wait(100);
      cy.get(".tracker-mood .score").should("contain", "8");
    } else {
      cy.get(".n-modal-footer > .footer > .btn").eq(2).click();
    }
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
    trackMood("add");
    cy.get("#textarea-capture-note").should("contain.value", "#mood(3)");
    // cy.get(".n-points .number").should("contain", "1");
    cy.get(".save-button").click();
    cy.wait(200);
    cy.get("#textarea-capture-note").should("contain.value", "");
  };

  it("Should On Boarding with Local", () => {
    window.localStorage.clear();
    window.indexedDB.deleteDatabase("localforage");
    onboard();
    selectStarters();
    testTips();
    useTrackers();
    createTrackers();
    // testCaptureForm();
  });
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
