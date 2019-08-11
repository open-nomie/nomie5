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
import Goals from './goals/goals';

let plugins = [Goals];

export default plugins;
