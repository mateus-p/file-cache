import { awaitEOS } from "./await_eos";

/**
 * @param predicate If returned == false, keep waiting
 */

export async function waitUntil(predicate: () => boolean) {
  while (true) {
    if (predicate()) break;
    await awaitEOS();
  }
}
