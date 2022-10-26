# shell-sleeper
An alternative to setTimeout and setInterval powered by the shell sleep command.

## Requirements

- Node.js 14 or newer
- A system-level `sleep` utility (comes with most Linux distros) to get the most from the library

## Installation

Exhaustion can be installed using `npm`:

```sh
npm install --save shell-sleeper
```

## Usage

Usage is very straightforward, `shell-sleeper` can serve as a drop-in replacement for `setInterval` and `setTimeout`:

```js
import {
    isSleepAvailable,
    setShellInterval,
    setShellTimeout,
    clearShellTimeout,
    clearShellInterval,
    shellSleep,
} from 'shell-sleeper';

// Check if a system-level shell `sleep` utility is available.
if (isSleepAvailable()) {
    console.log('System-level sleep is available!');
} else {
    console.log('System-level sleep is not available!');
}

// setShellInterval and setShellTimeout function identically to setInterval and setTimeout.
const interval = setShellInterval(() => console.log("Will execute every 5 seconds."), 5000);
const timeout = setShellTimeout(() => console.log("Will execute after 5 seconds."), 5000);

// You can clear them in just the same way too.
clearShellInterval(interval);
clearShellTimeout(timeout);

// An extra `shellSleep` command is also included.
(async () => {
    await shellSleep(10000); // Will block for 10 seconds.
})();
```

If a system-level shell-based `sleep` utility it not available, the library will fall back to use `setInterval` and `setTimeout`.

## Related Projects

This library uses the [command-exists](https://www.npmjs.com/package/command-exists) package to check for the existence of an available `sleep` command-line utility.

## License

[MIT](LICENSE) © [lambdacasserole](https://github.com/lambdacasserole).
