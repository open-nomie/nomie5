import Tracker from '../../../src/modules/tracker/tracker';

describe('modules/tracker', function() {
	let tracker;
	let stub = {
		tag: 'taggy_tag',
		label: 'Tester',
		uom: 'mile',
		emoji: '🥪',
		type: 'value',
		color: '#555555',
		default: 10,
		math: 'mean',
	};

	it('tracker initializes', () => {
		tracker = new Tracker(stub);
		expect(tracker).to.be.instanceOf(Tracker);
		expect(tracker.label).to.equal(stub.label);
		expect(tracker.tag).to.equal(stub.tag);
		expect(tracker.emoji).to.equal(stub.emoji);
		expect(tracker.type).to.equal(stub.type);
		expect(tracker.default).to.equal(stub.default);
		expect(tracker.color).to.equal(stub.color);
		expect(tracker.uom).to.equal(stub.uom);
		expect(tracker.math).oneOf(['sum', 'mean']);
		// expect(math.sum([1, 2])).to.equal(3);
	});
	it('tracker.displayValue', () => {
		tracker = new Tracker(stub);
		expect(tracker.displayValue(100)).to.equal('100mi');
		// expect(math.sum([1, 2])).to.equal(3);
	});
	it('tracker.displayTag', () => {
		tracker = new Tracker(stub);
		expect(tracker.displayTag()).to.equal('Taggy Tag');
		// expect(math.sum([1, 2])).to.equal(3);
	});
	it('tracker.toTag', () => {
		tracker = new Tracker(stub);
		expect(tracker.toTag('Brandon Is Good !!!')).to.equal('brandon_is_good');
		// expect(math.sum([1, 2])).to.equal(3);
	});
});
