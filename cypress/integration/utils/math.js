import math from '../../../src/utils/math/math';

describe('utils/math', function() {
	it('math.sum', () => {
		expect(math.sum([1, 2])).to.equal(3);
	});
	it('math.average', () => {
		expect(math.average([30, 344, 21, 23])).to.equal(104.5);
	});
	it('math.round - default', () => {
		expect(math.round(10.12345)).to.equal(10.12);
	});
	it('math.round - 1000', () => {
		expect(math.round(10.12345, 1000)).to.equal(10.123);
	});
	it('math.round - 10', () => {
		expect(math.round(10.12345, 10)).to.equal(10.1);
	});
	it('math.max', () => {
		expect(math.max([0, 12, 223, 332, 12, 345, 32.32, -324])).to.equal(345);
	});
	it('math.min - negative', () => {
		expect(math.min([0, 12, 223, 332, 12, 345, 32.32, -324, 443])).to.equal(-324);
	});
	it('math.min - no negative', () => {
		expect(math.min([1, 12, 223, 332, 12, 345, 32.32, 443])).to.equal(1);
	});
	it('math.percentage', () => {
		expect(math.percentage(100, 50)).to.equal(50);
	});
	it('math.random', () => {
		expect(math.random([10, 20, 30])).to.be.oneOf([10, 20, 30]);
	});
	it('math.random_range', () => {
		expect(math.random_range(0, 100)).to.be.within(0, 100);
	});
	it('math.percentile', () => {
		expect(math.percentile([0, 50, 100])).to.include.members([0, 50, 100]);
	});
	it('math.trustfulNumber', () => {
		expect(math.trustfulNumber(32 + 'abc', 0)).to.equal(0);
	});
});
