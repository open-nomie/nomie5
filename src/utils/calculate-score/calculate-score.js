import ExtractTrackers from "../extract-trackers/extract-trackers";

// Simple isTrue comparison function
const isTrue = (condition, baseValue) => {
  let response = false;
  let value = parseFloat(condition.v);
  if (condition.is == "gt") {
    response = baseValue > value;
  } else if (condition.is == "lt") {
    response = baseValue < value;
  } else if (condition.is == "lte") {
    response = baseValue <= value;
  } else if (condition.is == "gte") {
    response = baseValue >= value;
  } else if (condition.is == "eq") {
    response = baseValue == value;
  }
  return response;
};

export default (note, endTime) => {
  endTime = endTime || new Date().getTime();

  let trackers = window.$TrackerStore; // hack - fucking hell
  let score = 0;
  // Extract Trackers
  let trackersInNotes = ExtractTrackers(note || "");
  let tkrKeys = Object.keys(trackersInNotes);

  // Check if condition is true
  const checkCondition = (condition, value) => {
    let response = {
      true: false,
      next: true,
      score: 0
    };
    switch (condition.if) {
      case "hour":
        let hour = new Date(endTime).getHours();
        response.true = isTrue(condition, parseInt(hour));
        break;
      case "month":
        let dayOfMonth = parseInt(dayjs(endTime).format("DD"));
        response.true = isTrue(condition, parseInt(dayOfMonth));
        break;
      case "value":
        response.true = isTrue(condition, parseFloat(value));
        break;
      case "today":
        // let todayValue = this.props.user.today.byTracker[tracker.tag] || 0;
        // response.true = this.isTrue(condition, todayValue);
        break;
    }
    response.next = false;
    response.score = condition.sc;
    return response;
  };

  // Loop over tags array
  tkrKeys.forEach(tag => {
    // If trackers has this tag
    if (trackers[tag]) {
      // If the tracker has a score of custom
      if (trackers[tag].score === "custom") {
        let calc = trackers[tag].score_calc || [];
        let met = false;
        let value = trackersInNotes[tag].value;
        calc.forEach(condition => {
          if (!met) {
            let passes = checkCondition(condition, value);
            if (passes.true) {
              // set met to stop others
              met = true;
              score = score + parseInt(condition.sc);
            }
          }
        });
      } else if (
        trackers[tag].score !== "" &&
        trackers[tag].score !== null &&
        trackers[tag].score !== "0"
      ) {
        // Else if the tracker has a set value
        let thisScore = parseInt(trackers[tag].score);
        score = score + thisScore;
      }
    }
  });
  return isNaN(score) ? 0 : score;
};
