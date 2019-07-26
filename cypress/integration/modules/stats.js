import Stats from '../../../src/modules/stats/stats';
import NomieLog from '../../../src/modules/nomie-log/nomie-log';
import Tracker from '../../../src/modules/tracker/tracker';
import dayjs from 'dayjs';

// TODO: write tests for mean math trackers

describe('modules/nomie-log', function() {
	let rows = [
		new NomieLog({
			note: `I'm the #first #note and I'm #good(10)`,
		}),
		new NomieLog({
			note: `I'm the #middle #note and I'm #good(104) too`,
			end: dayjs()
				.subtract(1, 'day')
				.toDate()
				.getTime(),
		}),
		new NomieLog({
			note: `I'm the #last #note and I'm #bad and #good(1)`,
		}),
		new NomieLog({
			note: `I'm a thing`,
		}),
	];

	let stats = new Stats(rows, new Tracker({ tag: 'good' }));

	it('stats initializes', () => {
		expect(stats).to.be.instanceOf(Stats);
	});
	it('stats rows should expand', () => {
		expect(stats.rows[0].trackers.first.value).to.equal(1);
	});
	it('results.year.count', () => {
		expect(stats.results.year.count).to.equal(3);
	});
	it('results.month.count', () => {
		expect(stats.results.month.count).to.equal(3);
	});
	it('results.day.count', () => {
		expect(stats.results.day.count).to.equal(2);
	});
	it('getValueMap', () => {
		let todayKey = dayjs().format('YYYY-MM-DD');
		let yesterdayKey = dayjs()
			.subtract(1, 'day')
			.format('YYYY-MM-DD');
		let valueMap = stats.getValueMap(rows);
		expect(valueMap[todayKey]).to.be.instanceOf(Array);
		expect(valueMap[todayKey]).to.include.members([10, 1]);
		expect(valueMap[yesterdayKey]).to.include.members([104]);
	});

	it('getMinMaxFromValueMap()', () => {
		let valueMap = stats.getValueMap(rows);
		expect(stats.getMinMaxFromValueMap(valueMap).min.value).to.equal(11);
		expect(stats.getMinMaxFromValueMap(valueMap).max.value).to.equal(104);
	});

	it('getRows - day', () => {
		// number of days the tag shows up in the day
		expect(stats.getRows('day').length).to.equal(2);
	});

	it('getRows - month', () => {
		// number of days the tag shows up in the month
		expect(stats.getRows('month').length).to.equal(3);
	});

	it('getChartData - month', () => {
		// number of days the tag shows up in the month
		expect(stats.toChartData('month').labels[0]).to.equal('01');
		// Check today's value
		expect(stats.toChartData('month').points[new Date().getDate() - 1].y).to.equal(11);
	});
});
