import App from "./App.svelte";
// Vendors
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekOfYear);
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);
import dayOfYear from "dayjs/plugin/dayOfYear";
dayjs.extend(dayOfYear);


const app = new App({
  target: document.body,
});

export default app;
