/**
 * Await End Of Stack
 */
export function awaitEOS() {
  return new Promise<void>((res) => {
    setTimeout(res);
  });
}

/**
 * @param predicate If returned == false, keep waiting
 */
export async function waitUntil(predicate: () => boolean) {
  while (!predicate()) {
    await awaitEOS();
  }
}
