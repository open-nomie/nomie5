import WeatherSettings from './settings.svelte';
import WeatherMainPage from './default.svelte';

export default {
	emoji: '⛅️',
	name: 'Weather',
	id: 'nomie-weather',
	pages: {
		settings: WeatherSettings,
		default: WeatherMainPage,
	},
};
