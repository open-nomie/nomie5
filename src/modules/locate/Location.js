import md5 from "md5";
import math from "../../utils/math/math";
export default class Location {
  constructor(starter) {
    starter = starter || {};
    this.lat = starter.lat;
    this.lng = starter.lng;
    this.name = starter.name;
    this.id = starter.id || this.getLid(); // deprecated
    this.lid = starter.lid || this.getLid();
  }

  getLid() {
    let str = `${math.round(this.lat, 1000)},${math.round(this.lng, 1000)}`;
    console.log("lid", str);
    return md5(str);
  }
}
