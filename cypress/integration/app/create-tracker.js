context("App", () => {
  beforeEach(() => {});

  const gotoDesign = () => {
    cy.visit("http://localhost:5000/tracker/design");
    cy.wait(1000);
  };

  const createTracker = () => {
    cy.get(".tracker-undefined").click();
  };

  it("Should On Boarding with Local", () => {
    //   window.localStorage.clear();
    //   window.indexedDB.deleteDatabase("localforage");
    gotoDesign();
    createTracker();
  });
});
