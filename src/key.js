const { v1, validate } = require("uuid");

class Key {
  #key_name = "";
  #created_at_ts = Date.now();
  #updated_at_ts = Date.now();
  #id = v1();

  get id() {
    return this.#id;
  }

  get created_at_ts() {
    return this.#created_at_ts;
  }

  get updated_at_ts() {
    return this.#updated_at_ts;
  }

  get name() {
    return this.#key_name;
  }

  set name(new_name) {
    this.#key_name = new_name;

    this.#updated_at_ts = Date.now();
  }

  constructor(name) {
    this.#key_name = name;
  }

  toSource() {
    return {
      id: this.#id,
      name: this.#key_name,
      created_at_ts: this.#created_at_ts,
      updated_at_ts: this.updated_at_ts,
    };
  }

  static fromSource(source) {
    if (!validate(source.id)) throw new Error("source#id is not an uuid");

    const key = new this(source.name);

    key.#id = source.id;
    key.#created_at_ts = source.created_at_ts;
    key.#updated_at_ts = source.updated_at_ts;

    return key;
  }
}

module.exports.Key = Key;
