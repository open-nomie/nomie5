import defaultPack from './default-trackers';

const StarterPack = {};
StarterPack.packs = {
	default: defaultPack,
};
StarterPack.methods = {
	asArray() {
		return Object.keys(StarterPack.packs).map(key => {
			let pack = StarterPack.packs[key];
			pack.key = key;
			return pack;
		});
	},
};

export default StarterPack;
