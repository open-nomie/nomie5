import md5 from "md5";
import math from "../../utils/math/math";
import Geohash from "latlon-geohash";

export interface ILocation {
  lat: number;
  lng: number;
  name: string;
  hash?: string;
  id?: string;
}

export default class Location implements ILocation {
  lat: number;
  lng: number;
  name: string;
  hash?: string;
  id?: string;

  constructor(starter) {
    starter = starter || {};
    this.lat = starter.lat;
    this.lng = starter.lng;
    this.name = starter.name;
    this.hash = starter.geohash || this.getGeoHash();
    this.id = starter.id || this.hash; // deprecated
  }
  getGeoHash() {
    return Geohash.encode(this.lat, this.lng, 10);
  }
}
