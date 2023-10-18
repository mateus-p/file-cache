const { awaitEOS } = require("./await_eos");

async function waitUntil(predicate) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (predicate()) break;
    await awaitEOS();
  }
}

module.exports.waitUntil = waitUntil;
