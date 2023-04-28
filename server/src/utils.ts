export const utils = {
    now: (): number => (new Date()).getTime(),
    deepCopy: <T>(o: T): T => JSON.parse(JSON.stringify(o))
}

export type WS = import("ws");

export type JsMap<K extends string, V> = { [key in K]: V; };

console.debug("process.argv =", process.argv);
export const config = {
    isLocalMongo: (): boolean => process.argv.includes("--localMongo")
}
