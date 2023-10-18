"use strict";

const key = require("./key");
const v8 = require("v8");

class Metadata {
  #created_at_ts = Date.now();
  #modified_at_ts = this.#created_at_ts;

  get created_at_ts() {
    return this.#created_at_ts;
  }

  get modified_at_ts() {
    return this.#modified_at_ts;
  }

  touch() {
    this.#modified_at_ts = Date.now();
  }

  toSource() {
    return {
      key: this.key.toSource(),
      created_at_ts: this.#created_at_ts,
      modified_at_ts: this.#modified_at_ts,
    };
  }

  /**
   * @param {key.KeySouce} source
   */
  static fromSource(source) {
    const meta = new this(key.Key.fromSource(source.key));

    meta.#created_at_ts = source.created_at_ts;
    meta.#modified_at_ts = source.modified_at_ts;

    return meta;
  }

  /**
   * @param {Buffer} buffer
   */
  static fromBuffer(buffer) {
    return this.fromSource(v8.deserialize(buffer));
  }

  /**
   *
   * @param {key.Key} key
   */
  constructor(key) {
    this.key = key;
  }
}

module.exports.Metadata = Metadata;
