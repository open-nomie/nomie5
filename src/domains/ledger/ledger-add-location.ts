import type NLog from "../../modules/nomie-log/nomie-log";
import locate from "../../modules/locate/locate";
import Location from "../../modules/locate/Location";
import { Locations } from "../../store/locations";
import appConfig from "../../config/appConfig";

export async function logAppendLocationIfNeeded(log: NLog): Promise<NLog> {
  // Should we locate?
  let shouldLocate = JSON.parse(localStorage.getItem(appConfig.always_locate_key) || "false");
  if (shouldLocate) {
    try {
      // Get the Location
      let theLoc: any = await locate();
      // make it a location
      let location = new Location({ lat: theLoc.latitude, lng: theLoc.longitude });
      // Find any favorited that are super close
      let nearest = Locations.findClosestTo(location);
      // If we have a nearest and a name
      if (nearest && nearest.name) {
        location.name = nearest.name;
      }
      if (location && !log.lat) {
        log.lat = location.lat;
        log.lng = location.lng;
        log.location = location.name;
      }
      // Return the match - or the location if we didnt any favorites
      return log;
    } catch (e) {
      // Any location errors
      console.error(`Non-fatal location error`, e.message);
      return log;
    }
  } else {
    return log;
  }
}
