import { exec } from 'child_process';

import { sync as commandExistsSync } from 'command-exists';


/**
 * A dictionary of handles to shell-based delays.
 */
const shellDelays = {}

/**
 * The next shell-based delay ID to dispense.
 */
let nextshellDelayId = 0;


/**
 * Gets whether or not a system sleep utility is available.
 *
 * @returns {bool} true if a system sleep utility is available, otherwise false
 */
export function isSleepAvailable() {
	return commandExistsSync('sleep');
}


/**
 * Executes a callback after a delay, using the system sleep utility if available and optionally repeating.
 *
 * @param {function} callback the callback to execute
 * @param {number} ms the number of milliseconds to delay
 * @param {bool} recur whether to initiate the delay again after it elapses
 * @returns {number} a handle that can be used to cancel the delay
 */
function setShellDelay(callback, ms, recur = false) {

	// If sleep command not available, fall back to setInterval/setTimeout.
	if (!isSleepAvailable()) {
		return recur ? setInterval(callback, ms) : setTimeout(callback, ms);
	}

	// Sleep command available, so use it.
	const delayId = nextshellDelayId++;
	shellDelays[delayId] = exec(`sleep ${ms / 1000}s`, (error) => {

		// An error indicates the process was killed.
		if (!error) {

			// If recur flag is set, an interval was created (instead of a timeout).
			if (recur) {
				shellDelays[delayId] = setShellDelay(callback, ms, true);
			}
			callback();
		}
	});
	return delayId; // Return ID that can be used to abort sleep process.
}


/**
 * Repeatedly executes a callback after a delay, using the system sleep utility if available.
 *
 * @param {function} callback the callback to execute
 * @param {number} ms the number of milliseconds to delay
 * @returns {number} a handle that can be used to cancel the delay
 */
export function setShellInterval(callback, ms) {
	return setShellDelay(callback, ms, true);
}


/**
 * Executes a callback after a delay, using the system sleep utility if available.
 *
 * @param {function} callback the callback to execute
 * @param {number} ms the number of milliseconds to delay
 * @returns {number} a handle that can be used to cancel the delay
 */
export function setShellTimeout(callback, ms) {
	return setShellDelay(callback, ms, false);
}


/**
 * Cancels execution of a callback previously scheduled via `setShellDelay`.
 *
 * @param {number} handle the handle of the scheduled task to cancel
 * @returns {any} the result of killing the scheduled task
 */
function clearShellDelay(handle) {

	// Follow handle chain until we hit a process, then kill it.
	let currentHandle;
	do {
		currentHandle = shellDelays[handle];
		while (typeof (currentHandle) === 'number') {
			currentHandle = shellDelays[currentHandle];
		}
	} while (!currentHandle.kill()); // We risk failing to clear a recurring task if we do not ensure the task has been killed.
}


/**
 * Cancels a delayed execution previously scheduled via `setShellTimeout`.
 *
 * @param {number} handle the handle of the delayed execution to cancel
 * @returns {any} the result of killing the scIDheduled task
 */
export function clearShellTimeout(handle) {
	return isSleepAvailable() ? clearShellDelay(handle) : clearTimeout(handle);
}


/**
 * Cancels execution of a callback previously scheduled via `setShellInterval`.
 *
 * @param {number} handle the handle of the scheduled task to cancel
 * @returns {any} the result of killing the scIDheduled task
 */
export function clearShellInterval(handle) {
	return isSleepAvailable() ? clearShellDelay(handle) : clearInterval(handle);
}


/**
 * Blocks program execution for the specified number of milliseconds, using the system sleep utility if available.
 *
 * @param {number} ms the number of milliseconds to sleep for
 * @returns {Promise<void>} a promise that will resolve after the given number of milliseconds
 */
export function shellSleep(ms) {
	return new Promise((resolve) => setShellTimeout(resolve, ms));
}
