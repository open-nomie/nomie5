function isConditionTrue(condition, baseValue) {
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
}

function checkCondition(condition, value) {
  let response = {
    true: false,
    next: true,
    score: 0,
  };
  switch (condition.if) {
    case "hour":
      let hour = new Date(endTime).getHours();
      response.true = isConditionTrue(condition, parseInt(hour));
      break;
    case "month":
      let dayOfMonth = parseInt(dayjs(endTime).format("DD"));
      response.true = isConditionTrue(condition, parseInt(dayOfMonth));
      break;
    case "value":
      response.true = isConditionTrue(condition, parseFloat(value));
      break;
    case "today":
      console.log("TODAY"); // TODO
      // let todayValue = this.props.user.today.byTracker[tracker.tag] || 0;
      // response.true = this.isTrue(condition, todayValue);
      break;
  }
  response.next = !response.true;
  response.score = condition.sc;
  return response;
}

function main(value, tracker, todaysTrackers) {
  console.log("Today's Trackers", todaysTrackers);
  let score = 0;
  if (tracker.score && !tracker.score_calc) {
    score = parseInt(tracker.score);
  } else if (tracker.score_calc) {
    let conditionsMet = tracker.score_calc.map((condition) => {
      return checkCondition(condition, value);
    });
    let met = conditionsMet.filter((condition) => condition.true);
    score = met.length ? parseFloat(met[0].score) : score;
  }
  return score;
}

export default main;
