/**
 * @type {import('./dot.js').DotFn}
 */
const dot = function (target, key = "") {
  const parts = key.split(".");

  const first_path = parts.shift();

  if (!first_path) return target;

  if (first_path in target) return dot(target[first_path], parts.join("."));
};

module.exports.dot = dot;
