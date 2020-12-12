const { setIntervalFor } = require("./utilities");

let trackedIntervals = {};

function setIntervalFor(id, milliseconds, func) {
  const currentSetInterval = trackedIntervals[id];
  if (currentSetInterval) {
    clearInterval(currentSetInterval);
  }
  trackedIntervals[id] = setInterval(func, milliseconds);
}

function scheduleFuncForInterval(func, id, interval) {
  setInterval(id, interval, func);
}
