import math from '../math/math';
import regexs from '../regex';
import Log from '../log/log';
const log = new Log('utils/extract-trackers');
export default function(text) {
	// Get all trackers from the text
	// Including #this and #this(123)
	// let trackers = text.match(/(#[a-z0-9_]+\((.+?\))|#[a-z0-9_]+)/gi) || [];
	let trackers = text.match(new RegExp(regexs.tag, 'gi')) || [];
	// Create a Map for easy following
	let map = {};
	// Loop over each of the trackers found

	trackers.map(tracker => {
		// Reaplace and # or )
		tracker = tracker.replace(/(\#|\))/gi, '');

		// Split it on (  to see if it's a value based tracker
		let trackerArr = tracker.split('(');
		// Get name from TrackerArr - even if its not a value based, it will be at 0 index
		let trackerName = trackerArr[0]
			.replace('#', '')
			.replace('\n', '')
			.toLowerCase();
		// Default the value to 1
		let value = 1;
		// It's trackerArr is more than 1, its a value based
		if (trackerArr.length > 1) {
			// Get the value from the 2nd part *asdfasdf* of the #key(asdfasdf)
			value = parseFloat(trackerArr[1].replace(/([a-zA-Z ])/g, ''));
		}
		// Add this to the map
		map[trackerName] = map[trackerName] || {
			tracker: trackerName,
			values: [],
		};
		// Push the Value to this tracker names values
		map[trackerName].values.push(value);
	});

	// Lets get a final array ready
	let final = {};
	// Loop over the Map's keys (tracker names)
	for (var i in map) {
		// only save those that aren't standard
		if (['#nomie', 'nomie', 'score', 'rating', 'enc', 'b64img'].indexOf(i) == -1) {
			map[i].value = math.sum(map[i].values);
			final[i] = {
				tracker: map[i].tracker,
				value: map[i].value,
			};
		}
	}

	return final;
}
