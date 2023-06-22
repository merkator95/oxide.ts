/**
 * Unique marker for `Option` and `Result` types.
 *
 * ### Warning
 * This library sometimes assumes a value with this key is an Option or Result
 * without explicitly checking the instance type or other properties.
 */
export declare const T: unique symbol;
export declare const Val: unique symbol;
export declare const FnVal: unique symbol;
export declare const EmptyArray: readonly any[];
export type FalseyValues = false | null | undefined | 0 | 0n | "";
export declare function isTruthy(val: unknown): boolean;
export type IterType<T> = T extends {
    [Symbol.iterator](): infer I;
} ? I : unknown;
