import App from './App.svelte';
// Vendors
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const app = new App({
	target: document.body,
	props: {
		name: 'Nomie Web',
	},
});
export default app;
