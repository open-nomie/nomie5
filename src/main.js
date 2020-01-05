import App from "./App.svelte";
// Vendors
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

// Register Service Worker if dev.nomie.app or nomie.app
if (
  "serviceWorker" in navigator &&
  window.location.origin.search("nomie.app") > -1
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js", { scope: "./" })
      .then(registration => {
        // TODO: handle anything required for service worker
      })
      .catch(e => {
        console.log("Service worker registration failed", e.message);
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
