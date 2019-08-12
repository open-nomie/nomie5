import App from './App.svelte';
// Vendors
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

// Register Service Worker
if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register('/service-worker.js', { scope: './' })
		.then(registration => {
			console.log('Nomie Service Worker Registered');
		})
		.catch(e => {
			console.log('Service worker registration failed', e.message);
		});
}

const app = new App({
	target: document.body,
	props: {
		name: 'Nomie Web',
	},
});
export default app;
