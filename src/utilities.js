let trackedIntervals = {};

/**
 * Helper function to use async/await to set a timeout.
 **/
function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Helper to manage setting and updating intervals based on a unique id.
 *
 * @param id: string - unique id to identify interval
 * @param milliseconds: number - time between calls of func
 * @param func: function - called every milliseconds passed
 **/
function updateIntervalFor(id, milliseconds, func) {
  const currentSetInterval = trackedIntervals[id];
  if (currentSetInterval) {
    clearInterval(currentSetInterval);
  }
  trackedIntervals[id] = setInterval(func, milliseconds);
}

module.exports = {
  delay,
  updateIntervalFor,
};
