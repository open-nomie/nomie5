/**
 * Plugins - extending Nomie
 * export default {
        emoji: '⛅️',
        name: 'Weather',
        id: 'nomie-weather',
        pages: {
            settings: WeatherSettings, 
            default: WeatherMainPage, //svelte component /plugins/nomie-weather
        },
    };
 */

// Import the plugins
import WeatherPlugin from './weather/weather';

let plugins = [WeatherPlugin];

export default plugins;
