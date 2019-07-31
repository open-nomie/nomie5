// vendors
import dayjs from 'dayjs';
// Modules
import Tracker from '../tracker/tracker';
import Log from '../nomie-log/nomie-log';
// Utils
import Logger from '../../utils/log/log';
import math from '../../utils/math/math';

const console = new Logger('📊 stats/overview');

export default class StatsProcessor {
	constructor(rows, tracker, date, caller) {
		caller = caller || 'unknown';
		this.date = date || dayjs();
		this.rows = rows;
		this.tracker = new Tracker(tracker);
		this.valueMap = {}; // holder of days and array of values
		// Convert to Logs if not already
		this.initialize();
		console.log('StatsProcessor initialized', caller);
	}

	initialize() {
		//('Load()');
		this.rows = this.rows
			.map(row => {
				let log = new Log(row);
				log.expand();
				return log;
			})
			.filter(row => {
				return row.hasTracker(this.tracker.tag);
			});

		this.results = {
			year: {},
			month: {},
			day: {},
		};

		this.prepare();
	}

	gotoDate(date) {
		this.date = date;
		this.prepare();
		return this;
	}

	prepare() {
		//console.log('Preparing');
		// filter rows for only this tracker.
		this.results.year.count = this.rows.length;

		this.results.valueMap = this.getValueMap(this.rows);
		this.results.valueTotalMap = this.getValueMapTotals(this.results.valueMap);

		this.results.year.sum = this.results.valueTotalMap.sum;
		this.results.year.avg = this.results.valueTotalMap.avg;

		this.results.year.chart = this.toChartData('year');

		this.results.year = { ...this.results.year, ...this.getMinMaxFromValueMap(this.results.valueMap) };

		console.log('Base Set', this.results);
		console.log('prepare', {
			results: this.results,
		});
		// Year is finished
		this.results.month = this.generate('month');
		this.results.day = this.generate('day');
	}

	date(date) {
		if (date) {
			if (dayjs.isDayjs(date)) {
				this.date = date;
			} else {
				this.date = dayjs(date);
			}
			return this.date;
		} else {
			// return the current
			return this.date;
		}
	}

	getValueMapTotals(valueMap) {
		let newMap = {
			sum: 0,
			avg: 0,
			days: {
				...valueMap,
			},
		};
		// Hold all values for total sum and avg
		let allValues = [];

		Object.keys(newMap.days).forEach(date => {
			let values = newMap.days[date];
			// If we should ignore zeros, then
			// filter them out.
			if (this.tracker.ignore_zeros) {
				values = values.filter(v => {
					return v !== 0 ? true : false;
				});
			}
			allValues = [...allValues, ...values];
			// Sum and Avg this day
			newMap.days[date] = {
				sum: math.sum(values),
				avg: math.average(values),
			};
		});

		newMap.sum = math.sum(allValues);
		newMap.avg = math.average(allValues);

		return newMap;
	}

	getValueMap(rows) {
		let valueMap = {};
		rows.forEach(row => {
			if (!row.trackers) {
				row.expand();
			}
			let dayKey = dayjs(row.end).format('YYYY-MM-DD');
			valueMap[dayKey] = valueMap[dayKey] || [];
			if (row.trackers[this.tracker.tag]) {
				let value = row.trackers[this.tracker.tag].value;
				value = isNaN(value) ? 0 : value;
				valueMap[dayKey].push(value);
			} else {
				//console.log(`row.trackers[${this.tracker.tag}] was not found`);
			}
		});
		return valueMap;
	}

	getLocations(mode) {
		mode = mode || 'year';
		let locations = {};
		this.getRows(mode).forEach(row => {
			if (row.lat) {
				let key;
				if (mode === 'year') {
					key = `${math.round(row.lat, 1000)},${math.round(row.lng, 1000)}`;
				} else {
					key = `${row.lat},${row.lng}`;
				}
				locations[key] = locations[key] || { lat: row.lat, lng: row.lng };
			}
		});
		return Object.keys(locations).map(key => {
			return locations[key];
		});
	}

	getRows(mode) {
		return this.rows
			.filter(row => {
				if (mode == 'month') {
					let monthKey = new Date(row.end).getMonth();
					if (monthKey === this.date.month()) {
						return true;
					} else {
						return false;
					}
				} else if (mode == 'day') {
					return this.date.toDate().toDateString() === new Date(row.end).toDateString();
				} else {
					return true;
				}
			})
			.sort((a, b) => {
				return a.end > b.end ? -1 : 1;
			});
	}

	getMinMaxFromValueMap(valueMap) {
		let min = { value: null, dateKey: null, date: null };
		let max = { value: null, dateKey: null, date: null };
		let valueArray = Object.keys(valueMap)
			.map(dateKey => {
				let value;
				if (this.tracker.math === 'sum') {
					value = math.sum(valueMap[dateKey]);
				} else {
					value = math.average(valueMap[dateKey]);
				}
				return {
					dateKey,
					value,
					date: dayjs(dateKey),
				};
			})
			.sort((a, b) => {
				return a.value < b.value ? -1 : 1;
			});

		if (valueArray.length) {
			min = valueArray[0];
			max = valueArray[valueArray.length - 1];
		}

		return { min, max };
	}

	toChartData(mode) {
		let chartData = {
			labels: [],
			points: [],
		};
		let dateMap = {};
		let dateKey = 'YYYY-MM-DD';
		let start = null;
		let dayCount = 0;

		if (mode === 'month') {
			dateKey = 'YYYY-MM';
			dayCount = this.date
				.endOf('month')
				.toDate()
				.getDate();
			start = this.date.startOf('month');
			for (let i = 0; i < dayCount; i++) {
				let thisDate = start.add(i, 'days');
				let dayLabel = thisDate.format('DD');
				chartData.labels.push(dayLabel);
				let dayValue = this.results.valueTotalMap.days[thisDate.format('YYYY-MM-DD')];
				let point = {
					date: thisDate,
					x: dayLabel,
					y: 0,
				};
				if (dayValue) {
					point.y = this.tracker.math === 'sum' ? dayValue.sum : dayValue.avg;
				}
				chartData.points.push(point);
			} // end looping over days
		} else if (mode === 'year') {
			dateKey = 'YYYY-MM';
			let start = dayjs(this.date).startOf('year');
			let yearMap = {};
			for (var i = 0; i < 12; i++) {
				let month = dayjs(start).month(i);
				yearMap[month.format('YYYY-MM')] = [];
			}
			this.rows.forEach(row => {
				let end = dayjs(row.end);
				if (row.trackers[this.tracker.tag]) {
					yearMap[end.format('YYYY-MM')] = yearMap[end.format('YYYY-MM')] || [];
					yearMap[end.format('YYYY-MM')].push(row.trackers[this.tracker.tag].value);
				}
			});

			Object.keys(yearMap).forEach(dateKey => {
				let point = {
					x: dateKey,
					y: this.tracker.math == 'sum' ? math.sum(yearMap[dateKey]) : math.average(yearMap[dateKey]),
					date: dayjs(`${dateKey}-01`),
				};
				chartData.labels.push(dateKey);
				chartData.points.push(point);
			});
		}
		//console.log(`Chart data is done for ${mode}`, chartData);
		return chartData;
	} // end toChartData()

	generate(mode) {
		// Setup labels, points, row holder
		let points = []; // holds x/y
		// if we're doing a month
		let rows = this.getRows(mode);

		let valueMap = this.getValueMap(rows);
		let valueMapTotals = this.getValueMapTotals(valueMap);

		let response = {
			avg: valueMapTotals.avg,
			sum: valueMapTotals.sum,
			...this.getMinMaxFromValueMap(valueMap),
			count: rows.length,
			chart: this.toChartData(mode),
		};

		// console.log(mode + ' Response', response);

		return response;
		// let calendar = CalendarMap({
		// 	start: dayjs(this.date)
		// 		.startOf('month')
		// 		.toDate()
		// 		.getTime(),
		// 	end: dayjs(this.date)
		// 		.endOf('month')
		// 		.toDate()
		// 		.getTime(),
		// 	mode: 'day',
		// });

		// calendar.label.forEach((dayKey, index) => {
		// 	if (valueMap[dayKey]) {
		// 		if (this.tracker.math === 'sum') {
		// 			calendar.value[index] = math.sum(valueMap[dayKey]);
		// 		} else {
		// 			calendar.value[index] = math.average(valueMap[dayKey]);
		// 		}
		// 	}
		// });

		// let labels = calendar.label.map((dayKey, index) => {
		// 	return dayjs(dayKey).format('D');
		// });
		// // TODO: Implement IgnoreZeros
		// // Day Totals

		// let results = {};

		// results.day.total = math.sum(valueMap[date.format('YYYY-MM-DD')] || [0]);
		// results.day.avg = math.average(valueMap[date.format('YYYY-MM-DD')] || [0]);
		// // Month Totals

		// results.month.total = math.round(math.sum(calendar.value.filter(v => v !== 0)));
		// results.month.avg = math.average(calendar.value.filter(v => v !== 0));
		// results.month.chart = {
		// 	labels: labels,
		// 	points: calendar.value.map((value, index) => {
		// 		return {
		// 			x: labels[index],
		// 			y: value,
		// 		};
		// 	}),
		// };
	}
}
