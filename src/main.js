import App from "./App.svelte";
// Vendors
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

// Register service worker if not localhost
if (
  "serviceWorker" in navigator &&
  window.location.origin.search(/(localhost)/) == -1
) {
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
  target: document.body,
  props: {
    name: "Nomie 4"
  }
});

export default app;
