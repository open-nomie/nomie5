import time from '../../../src/utils/time/time';

describe('utils/time', function() {
	it('padTime', () => {
		expect(time.padTime(1)).to.equal('01');
	});
	it('secondsToTime', () => {
		expect(time.secondsToTime(60 * 60)).to.equal('1:00:00');
		expect(time.secondsToTime(10 * 60 * 60)).to.equal('10:00:00');
	});
	it('msToSecond', () => {
		expect(time.msToSecond(1000)).to.equal(1);
	});
	it('timestringToSeconds', () => {
		expect(time.timestringToSeconds('01:00:00')).to.equal(3600);
		expect(time.timestringToSeconds('01:00:05')).to.equal(3605);
		expect(time.timestringToSeconds('02:00:00')).to.equal(7200);
	});
	it('unitsToSeconds', () => {
		expect(time.unitsToSeconds(1, 0, 0)).to.equal(3600);
		expect(time.unitsToSeconds(1, 0, 5)).to.equal(3605);
		expect(time.unitsToSeconds(2, 0, 0)).to.equal(7200);
	});
	it('getNumberedArray', () => {
		expect(time.getNumberedArray(2)).to.include.members(['00', '01', '02']);
	});
});
