// Fuck this is old code.. needs some serious work.

import dayjs from 'dayjs';

function CalendarMap(options) {
	// Defaults
	options = options || {};
	options.timeGroup = options.timeGroup || 'day';
	options.start =
		options.start ||
		dayjs()
			.startOf('month')
			.toDate()
			.getTime();
	options.end =
		options.end ||
		dayjs()
			.endOf('month')
			.toDate()
			.getTime();
	options.label = options.label || 'YYYY-MM-DD';
	options.rows = options.rows || [];

	// Setup base Map
	let map = {
		times: [],
		count: [],
		value: [],
		location: [],
		label: [],
		meta: {
			start: null,
			end: null,
		},
	};

	var start = dayjs(options.start);
	var end = dayjs(options.end);

	var starti = dayjs(start);
	var unitDiff = end.diff(start, options.timeGroup) + 1;

	// this was set to 2 - not sure why.
	// it should be the start minus the end + 1 unit.

	map.meta.start = options.start;
	map.meta.end = options.end;

	map.toXY = () => {
		return map.times.map((date, i) => {
			return {
				x: dayjs(new Date(date)),
				y: map.value[i],
			};
		});
	};

	// loop over Units of Difference to build empty Map
	for (var i = 0; i < unitDiff; i++) {
		map.times.push(starti.toDate().getTime());
		map.count.push(0);
		map.value.push(0);
		map.label.push(
			dayjs(starti)
				.add(i, options.timeGroup)
				.format(options.label)
		);
		starti.add(1, options.timeGroup);
	} // end looping over items

	return map;
}

function CalendarFormat(groupBy) {
	groupBy = groupBy || 'day';

	switch (groupBy) {
		case 'dayName':
			labelFormat = 'ddd';
			slotFormat = 'dddd';
			break;

		case 'day':
			labelFormat = 'MM/DD/YY';
			slotFormat = 'YYYY/MM/DD';
			break;

		case 'hour':
			labelFormat = 'ddd ha';
			slotFormat = 'YYYY/MM/DD ha';
			break;

		case 'week':
			labelFormat = 'WW YYYY';
			slotFormat = 'YYYY/WW';
			break;

		case 'month':
			labelFormat = 'MM/YYYY';
			slotFormat = 'YYYY/MM';
			break;

		case 'monthName':
			labelFormat = 'MMMM';
			slotFormat = 'MM';
			break;

		case 'year':
			labelFormat = 'YYYY';
			slotFormat = 'YYYY';
			break;
	}

	return {
		label: labelFormat,
		slot: slotFormat,
	};
} // end Calendar Format

export default CalendarMap;
