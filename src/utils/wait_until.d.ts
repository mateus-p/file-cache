/**
 * @param predicate If returned == false, keep waiting
 */
export declare function waitUntil(predicate: () => boolean): Promise<void>;
