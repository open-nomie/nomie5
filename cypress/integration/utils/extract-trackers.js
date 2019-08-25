import extractor from '../../../src/utils/extract-trackers/extract-trackers';

describe('utils/extract-trackers', function() {
	it('extract-tracker', () => {
		let note = 'This is a #test of Nomies #extractor(4) #home(0) and #cheese #cheese #cheese';
		let results = extractor(note);

		expect(results.test.tracker).to.equal('test');
		expect(results.test.value).to.equal(1);
		expect(results.extractor.value).to.equal(4);
		expect(results.cheese.value).to.equal(3);
		expect(results.home.value).to.equal(0);

		// expect(math.sum([1, 2])).to.equal(3);
	});
});
