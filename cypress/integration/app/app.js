/// <reference types="Cypress" />

context("App", () => {
  beforeEach(() => {});

  const onboard = () => {
    cy.visit("http://localhost:5000");
    cy.wait(1000);
    cy.get(".footer-buttons > .btn").click();
    cy.wait(400);
    cy.get(":nth-child(3) > strong").click();
    cy.wait(400);
    cy.get(":nth-child(3) > strong").click();
    cy.wait(400);
    // select local storage
    cy.get(".btn-content:nth-child(2)").click();
    cy.wait(200);
    cy.get(":nth-child(3) > strong").click();
    cy.wait(400);
  };

  const selectStarters = () => {
    cy.get(".n-modal-frame .tracker-mood").click();
    cy.wait(500);
    cy.get(".n-modal-frame .tracker-sleep").click();
    cy.wait(500);
    cy.get(".n-modal-frame .tracker-sex").click();
    cy.wait(500);
    cy.get(".n-modal-footer > .btn").click();
    cy.wait(500);
  };

  const trackerOneTap = () => {
    cy.wait(500);
    cy.get(".n-board .tracker-sex").click();
    cy.wait(500);
  };

  it("Should On Boarding with Local", () => {
    window.localStorage.clear();
    window.indexedDB.deleteDatabase("localforage");
    onboard();
    selectStarters();
    trackerOneTap();
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
