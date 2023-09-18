/**
 * Await End Of Stack
 */
export function awaitEOS() {
  return new Promise<void>((res) => {
    setTimeout(res);
  });
}
