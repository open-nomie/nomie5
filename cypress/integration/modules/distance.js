import distance from '../../../src/modules/locate/distance';

let locations = [
	[39.9576259, -85.9004901],
	[39.9572825, -85.9008173],
	[39.9568893, -85.9009447],
	[39.9831302, -83.1309127],
];

describe('modules/locate/distance', () => {
	it('distance is calculated', () => {
		let dist = distance.between(locations[0], locations[1]);
		let indy2ColumbusNauticalMiles = Math.round(
			distance.between([42.6769715, -79.8837796], [39.9831302, -83.1309127], 'nm')
		);
		let indy2ColumbusKM = Math.round(distance.between([42.6769715, -79.8837796], [39.9831302, -83.1309127]));
		expect(indy2ColumbusNauticalMiles).to.equal(218);
		expect(indy2ColumbusKM).to.equal(404);
	});
	it('determine max distance between multiple points', () => {
		let furthest = Math.round(distance.furthest(locations));
		expect(furthest).to.equal(127);
	});
	it('return zero if only one provied', () => {
		let furthest = Math.round(distance.furthest([[39.9576259, -85.9004901]]));
		expect(furthest).to.equal(0);
	});
});
