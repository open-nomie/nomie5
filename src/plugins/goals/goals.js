/**
 * Goals... INCOMPLETE
 */

import GoalsDefault from './goals.svelte';
import GoalsSettings from './settings.svelte';

export default {
	emoji: '🥇',
	name: 'Goals',
	id: 'nomie-goals',
	pages: {
		settings: GoalsSettings,
		default: GoalsDefault,
	},
	// tab: {
	// 	icon: 'star-outline',
	// 	label: 'Goals',
	// },
};
