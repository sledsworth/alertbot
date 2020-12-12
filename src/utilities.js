let trackedIntervals = {};

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function setIntervalFor(id, milliseconds, func) {
  const currentSetInterval = trackedIntervals[id];
  if (currentSetInterval) {
    clearInterval(currentSetInterval);
  }
  trackedIntervals[id] = setInterval(func, milliseconds);
}

module.exports = {
  delay,
  setIntervalFor,
};
