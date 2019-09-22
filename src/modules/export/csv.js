import { LedgerStore } from '../../store/ledger';
import { TrackerStore } from '../../store/trackers';
import Tracker from '../../modules/tracker/tracker';
import dayjs from 'dayjs';

export default class CSV {
	constructor() {}

	logsToCSV(logs, trackersToInclude) {
		let header = ['epoch', 'start', 'end', 'tracker', 'value', 'note', 'lat', 'lng', 'location'];
		let rows = [header];
		// Get an array of tag names from the trackers
		let tagsToInclude = trackersToInclude.map(tracker => tracker.tag);
		// Loop over logs
		logs.forEach(log => {
			// Extract log tracker tags
			let logTrackers = Object.keys(log.trackers);
			// Loop over tracker tags
			logTrackers.forEach(trackerTag => {
				// Is it a match?
				if (tagsToInclude.indexOf(trackerTag) > -1) {
					// Include it..
					rows.push([
						log.end,
						new Date(log.start).toISOString(),
						new Date(log.end).toISOString(),
						trackerTag,
						log.trackers[trackerTag].value,
						log.note.replace(/(\"|\,|\n|\r)/g, ' '), // Remove csv breaking chars
						log.lat,
						log.lng,
						log.location.replace(/(\"|\,|\n|\r)/g, ' '), // Remove csv breaking chars
					]);
				}
			});
		});
		return rows;
	}

	/**
	 * Download a CSV file
	 *
	 * @param {String} filename
	 * @param {Array} rows
	 */
	download(filename, rows) {
		let file = rows.join('\r\n');
		this.filename = filename || 'nomie4.csv';

		if (navigator.msSaveBlob) {
			// IE 10+
			navigator.msSaveBlob(new Blob([file], { type: 'text/csv;charset=utf-8;' }), filename);
		} else {
			let encodedUri = 'data:text/csv;charset=UTF-8,' + encodeURIComponent(file);
			let link = document.createElement('a');
			link.setAttribute('href', encodedUri);
			link.setAttribute('download', filename);
			document.body.appendChild(link); // Firefox
			link.click();
		}
	}

	/**
	 * Generate the CSV
	 * generate({ start, end, [trackers] })
	 *
	 * @param {Object} options
	 */
	async generate(options) {
		options = options || {};
		let start = options.start;
		let end = options.end;
		let trackers = options.trackers;

		// Loop over provided trackers - make them real trackers
		trackers.map(tracker => {
			if (typeof tracker == 'string') {
				return new Tracker({ tag: tracker });
			} else {
				return new Tracker(tracker);
			}
		});
		// Get the logs for the provided time period
		let logs = await LedgerStore.query({
			start,
			// end TODO: See why end date is not working in query
		});

		// Expand and filter the logs
		logs = logs
			.map(record => {
				record.expand(); // get more data like trackers and values
				return record;
			})
			.filter(log => {
				// remove anything that doesn't match the trackers provided
				let hasMatchingTracker = false;
				let logTrackerTags = Object.keys(log.trackers);
				// loop over trackers provided to see if they match
				trackers.forEach(tracker => {
					if (logTrackerTags.indexOf(tracker.tag) > -1) {
						hasMatchingTracker = true;
					}
				});
				return hasMatchingTracker;
			});
		// generate CSV array
		let csvArray = this.logsToCSV(logs, trackers);
		let filename = `nomie4-${dayjs(start).format('YYYY-MM-DD')}-${dayjs(end).format('YYYY-MM-DD')}.csv`;
		this.download(filename, csvArray);
	}
}
