// 1: Sunday, 2: Monday, etc.

import dayjs, { Dayjs } from "dayjs";

const NDate = {
  firstDayOfWeek: "1", // default to Sunday
  // Set the day of week - based on the $UserStore.meta.firstDayOfWeek value
  setFirstDayOfWeek(firstDayOfWeek: "1" | "2"): typeof NDate {
    NDate.firstDayOfWeek = firstDayOfWeek;
    return NDate;
  },
  getFirstDayOfWeek(starterDate?: Dayjs): Dayjs {
    return NDate.thisWeek(starterDate)[0];
  },
  getLastDayOfWeek(starterDate?: Dayjs): Dayjs {
    return NDate.thisWeek(starterDate)[6];
  },
  // Get this Week
  thisWeek(starterDate?: Dayjs): Array<Dayjs> {
    starterDate = starterDate || dayjs();
    let currentDay = starterDate.day();
    // Get default Week Start
    let thisWeekStart = starterDate.startOf("week");
    // If it's sunday and our week starts on monday
    if (currentDay === 0 && NDate.firstDayOfWeek == "2") {
      // Set the week back, and add a day
      thisWeekStart = thisWeekStart.subtract(1, "week").add(1, "day");
      // If its not sun and the week starts on monday
    } else if (NDate.firstDayOfWeek == "2") {
      // Add a day
      thisWeekStart = thisWeekStart.add(1, "day");
    }
    // Loop over days
    let days = [];
    // Push days into array
    for (var i = 0; i < 7; i++) {
      days.push(thisWeekStart.add(i, "day"));
    }
    return days;
  },
  // Get Last Week
  lastWeek(): Array<Dayjs> {
    return NDate.thisWeek().map((date) => {
      return dayjs(date).subtract(7, "day");
    });
  },
};
export default NDate;
