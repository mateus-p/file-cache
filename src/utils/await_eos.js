function awaitEOS() {
  return new Promise((res) => {
    setTimeout(res);
  });
}

module.exports.awaitEOS = awaitEOS;
