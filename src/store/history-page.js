// svelte
import { writable } from 'svelte/store';
// vendors
import dayjs from 'dayjs';

export const HistoryPage = writable({
	date: dayjs(new Date()),
	time_format: 'YYYY-MM',
	logs: [],
	trackers: {},
	ledger: null,
	searchTerm: '',
	searchResults: null,
	searchMode: false,
	selected: {},
	selectCount: 0,
	editMode: false,
	showDatePicker: false,
	location: {
		name: null,
		lat: null,
		lng: null,
	},
	locations: [],
	loading: true,
	showAllLocations: false,
	searchYear: dayjs().format('YYYY'),
});
