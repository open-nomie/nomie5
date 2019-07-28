import { BoardStore } from '../../../src/store/boards';

// TODO: Make more complete
describe('store/board', function() {
	it('base data', () => {
		expect(BoardStore.data().active).to.equal('all');
		expect(BoardStore.data().boards).to.be.instanceOf(Array);
	});
});
