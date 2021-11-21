import defaultPack from "./default-trackers";

const StarterPack: any = {};
StarterPack.packs = {
  default: defaultPack
};
StarterPack.methods = {
  asArray(is24) {
    // We're going to use is24 as a the basis for imperical vs metric
    // this might not be right - but we'll start with it.
    return Object.keys(StarterPack.packs).map(key => {
      let pack = StarterPack.packs[key];
      pack.key = key;
      return pack;
    });
  }
};

export default StarterPack;
