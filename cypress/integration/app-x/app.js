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
  };

  const startTimer = () => {
    cy.get(".tracker-sleep").click();
    cy.wait(500);
    cy.get(".btn-success").click();
  };

  const createSimpleTracker = (name = "Simple Tracker", emoji = "🤘") => {
    let trackerTag = name.replace(/ /, "_").toLowerCase();
    const next = () => {
      cy.get(".n-layout footer button.btn.btn-block").eq(1).click();
    };
    cy.get(".tracker-undefined").click();
    cy.wait(300);
    cy.get(".pop-menu button").eq(1).click();
    next();
    cy.get(".n-input input").type(name);
    next();
    cy.get(".input-emoji").type(emoji);
    next();
    cy.wait(400);
    cy.get('[style="background-color: rgb(255, 160, 0);"]').click();
    next();
    cy.get(".onoffswitch-label").click();
    next();
    cy.get("select").as("select").invoke("val", "1").trigger("change");
    next();
    cy.get(`.tracker-${trackerTag}`).should("exist");
    cy.get(`.tracker-${trackerTag}`).click();
    cy.wait(400);
    cy.get(`.tracker-${trackerTag} .score`).should("be", "1");
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
    cy.get("#textarea-capture-note").should("contain.value", "#check_up ");
    cy.wait(500);
    cy.get(".save-button").click();
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
    cy.get(".tracker-undefined").click();
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

  it("Should On Boarding with Local", () => {
    initBasic();
    // exportData();
  });

  const goHome = async () => {
    return cy.get(".tab-Track").click();
  };

  it("should enable features", () => {
    enableFeatures();
  });

  it("Should properly track using the tracker buttons", () => {
    useTrackers();
  });

  it("should test adding a tab", () => {
    testTabs();
  });

  it("should delete a tracker", () => {
    testDeleteingTracker();
  });

  it("should create a multi tracker", () => {
    createMultiTracker();
  });

  it("should test the PIN", () => {
    testPin();
  });

  it("should be able to create a log via a note", () => {
    testCaptureForm();
  });

  it("Should properly test the tips", () => {
    testTips();
  });

  it("Should properly handle adding a person via a note", () => {
    testPerson();
  });

  it("should create a simple tracker", () => {
    createSimpleTracker();
  });

  it("should test the dashboard", () => {
    testDashboard();
  });

  it("should have all the things in history", () => {
    testHistory();
  });
});
