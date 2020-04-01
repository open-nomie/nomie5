import App from "./App.svelte";
// Vendors
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekOfYear);
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);

// Register service worker if not localhost
if ("serviceWorker" in navigator && window.location.origin.search(/(localhost)/) == -1) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js", { scope: "./" })
      .then(registration => {})
      .catch(e => {
        console.error("Service worker registration failed", e.message);
      });
  });
}

const app = new App({
  target: document.body
});

export default app;
