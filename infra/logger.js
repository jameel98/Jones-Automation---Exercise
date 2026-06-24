// infra/logger.js
// Tiny, dependency-free logger so a test run shows which step it's on.
// Each line is timestamped and level-prefixed and goes to stdout/stderr.
// Page-object actions call logger.step(...) so the step trail appears for
// every test automatically, without cluttering the specs.

const timestamp = () => new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm

const logger = {
  step(message) {
    console.log(`[${timestamp()}] [STEP]  ${message}`);
  },
  info(message) {
    console.log(`[${timestamp()}] [INFO]  ${message}`);
  },
  error(message) {
    console.error(`[${timestamp()}] [ERROR] ${message}`);
  },
};

module.exports = { logger };
