import { T, FnVal } from "./common";
import { Option, Some, None } from "./option";
import { Result, Ok, Err } from "./result";
type MappedBranches<T, U> = (T extends Option<infer V> ? OptionMapped<V, U> : never) | (T extends Result<infer V, infer E> ? ResultMapped<V, E, U> : never);
type ChainedBranches<T, U> = Branch<T, U>[] | [...Branch<T, U>[], DefaultBranch<U>];
type BranchCondition<T> = Mapped<T, boolean> | (T extends {
    [T]: boolean;
} ? MonadCondition<T> : Condition<T>);
type Branch<T, U> = [BranchCondition<T>, BranchResult<T, U>];
type Mapped<T, U> = (val: T) => U;
type Wide<T> = T extends [...infer U] ? U[number][] : Partial<T>;
type BranchResult<T, U> = U | ((val: T) => U);
type DefaultBranch<U> = () => U;
interface OptionMapped<T, U> {
    Some?: MonadMapped<T, U>;
    None?: DefaultBranch<U>;
    _?: DefaultBranch<U>;
}
interface ResultMapped<T, E, U> {
    Ok?: MonadMapped<T, U>;
    Err?: MonadMapped<E, U>;
    _?: DefaultBranch<U>;
}
type Condition<T> = T extends object ? {
    [K in keyof T]?: BranchCondition<T[K]>;
} : T;
type MonadCondition<T> = T extends Option<infer U> ? Some<MonadCondition<U>> | None : T extends Result<infer U, infer E> ? Ok<MonadCondition<U>> | Err<MonadCondition<E>> : Wide<T>;
type MonadMapped<T, U> = Mapped<T, U> | ChainedBranches<T, U> | MappedBranches<T, U>;
/**
 * Concisely determine what action should be taken for a given input value.
 *
 * ### Mapped Matching
 *
 * Mapped matching is possible on `Option` and `Result` types. Passing any
 * other type will throw an invalid pattern error.
 *
 * ```
 * const num = Option(10);
 * const res = match(num, {
 *    Some: (n) => n + 1,
 *    None: () => 0,
 * });
 *
 * assert.equal(res, 11);
 * ```
 *
 * You can nest mapped matching patterns and provide defaults. If a default is
 * not found in the current level it will fall back to the previous level. When
 * no suitable match or default is found, an exhausted error is thrown.
 *
 * ```
 * function nested(val: Result<Option<number>, string>): string {
 *    return match(val, {
 *       Ok: { Some: (num) => `found ${num}` },
 *       _: () => "nothing",
 *    });
 * }
 *
 * assert.equal(nested(Ok(Some(10))), "found 10");
 * assert.equal(nested(Ok(None)), "nothing");
 * assert.equal(nested(Err("Not a number")), "nothing");
 * ```
 *
 * ### Combined Matching
 *
 * Mapped Matching and Chained Matching can be combined. A match chain can be
 * provided instead of a function for `Some`, `Ok` and `Err`. E.g.
 *
 * ```
 * function matchNum(val: Option<number>): string {
 *    return match(val, {
 *       Some: [
 *          [5, "5"],
 *          [(x) => x < 10, "< 10"],
 *          [(x) => x > 20, "> 20"],
 *       ],
 *       _: () => "none or not matched",
 *    });
 * }
 *
 * assert.equal(matchNum(Some(5)), "5");
 * assert.equal(matchNum(Some(7)), "< 10");
 * assert.equal(matchNum(Some(25)), "> 20");
 * assert.equal(matchNum(Some(15)), "none or not matched");
 * assert.equal(matchNum(None), "none or not matched");
 * ```
 *
 * ### Async
 *
 * A `condition` is always a sync function. The `result` can be an async
 * function, providing that all branches return an async function.
 *
 * ### Chained Matching
 *
 * Chained matching is possible on any type. Branches are formed by associating
 * a `condition` with a `result`, and the chain is an array of branches. The
 * last item in a chain may be a function (called to determine the default
 * result when no branches match).
 *
 * A `condition` can be a:
 * - primitive (to test for equality)
 * - filter function which returns a boolean (to use a custom test)
 * - partial object/array of `conditions` (to test for matching keys)
 * - `Some`, `Ok` or `Err` containing a `condition` which is not a filter
 *   function (and which does not included a nested filter function).
 * - function wrapped with `Fn` (to test for equality)
 * - `_` or `Default` (to match any value at this position)
 *
 * A `result` can be:
 * - any non-function value to be used as the result
 * - a function which returns the result when called
 * - a function wrapped with `Fn` to be used as the result
 *
 * If no branch matches and there is no default available, an exhausted error
 * is thrown.
 *
 * #### Primitive
 *
 * The branch succeeds if the `condition` is strictly equal to the provided
 * value.
 *
 * ```
 * function matchNum(num: number): string {
 *    return match(num, [
 *       [5, "five"],
 *       [10, "ten"],
 *       [15, (x) => `fifteen (${x})`], // result function
 *       () => "other",
 *    ]);
 * }
 *
 * assert.equal(matchNum(5), "five");
 * assert.equal(matchNum(10), "ten");
 * assert.equal(matchNum(15), "fifteen (15)");
 * assert.equal(matchNum(20), "other");
 * ```
 *
 * #### Filter Function
 *
 * The branch succeeds if the `condition` returns true.
 *
 * ```
 * function matchNum(num: number): string {
 *    return match(num, [
 *       [5, "five"], // Primitive Match
 *       [(x) => x < 20, "< 20"],
 *       [(x) => x > 30, "> 30"],
 *       () => "other",
 *    ]);
 * }
 *
 * assert.equal(matchNum(5), "five");
 * assert.equal(matchNum(15), "< 20");
 * assert.equal(matchNum(50), "> 30");
 * assert.equal(matchNum(25), "other");
 * ```
 *
 * #### Object
 *
 * The branch succeeds if all the keys in `condition` match those in the
 * provided value. Using `_` allows any value (even undefined), but the key
 * must still be present.
 *
 *
 * ```
 * interface ExampleObj {
 *    a: number;
 *    b?: { c: number };
 *    o?: number;
 * }
 *
 * function matchObj(obj: ExampleObj): string {
 *    return match(obj, [
 *       [{ a: 5 }, "a = 5"],
 *       [{ b: { c: 5 } }, "c = 5"],
 *       [{ a: 10, o: _ }, "a = 10, o = _"],
 *       [{ a: 15, b: { c: (n) => n > 10 } }, "a = 15; c > 10"],
 *       () => "other",
 *    ]);
 * }
 *
 * assert.equal(matchObj({ a: 5 }), "a = 5");
 * assert.equal(matchObj({ a: 50, b: { c: 5 } }), "c = 5");
 * assert.equal(matchObj({ a: 10 }), "other");
 * assert.equal(matchObj({ a: 10, o: 1 }), "a = 10, o = _");
 * assert.equal(matchObj({ a: 15, b: { c: 20 } }), "a = 15; c > 10");
 * assert.equal(matchObj({ a: 8, b: { c: 8 }, o: 1 }), "other");
 * ```
 *
 * #### Array
 *
 * The branch succeeds if all the indexes in `condition` match those in the
 * provided value. Using `_` allows any value (even undefined), but the index
 * must still be present.
 *
 * ```
 * function matchArr(arr: number[]): string {
 *    return match(arr, [
 *       [[1], "1"],
 *       [[2, (x) => x > 10], "2, > 10"],
 *       [[_, 6, 9, _], (a) => a.join(", ")],
 *       () => "other",
 *    ]);
 * }
 *
 * assert.equal(matchArr([1, 2, 3]), "1");
 * assert.equal(matchArr([2, 12, 6]), "2, > 10");
 * assert.equal(matchArr([3, 6, 9]), "other");
 * assert.equal(matchArr([3, 6, 9, 12]), "3, 6, 9, 12");
 * assert.equal(matchArr([2, 4, 6]), "other");
 * ```
 *
 * #### Some, Ok and Err
 *
 * The branch succeeds if the wrapping monad (e.g. `Some`) is the same as the
 * provided value and the inner `condition` matches the inner value.
 *
 * **Note:** Filter functions are not called for any condition wrapped in a
 * monad. See the section on Combined Matching for a way to match inner values.
 *
 * ```
 * type NumberMonad = Option<number> | Result<number, number>;
 *
 * function matchMonad(val: NumberMonad): string {
 *    return match(val, [
 *       [Some(1), "Some"],
 *       [Ok(1), "Ok"],
 *       [Err(1), "Err"],
 *       () => "None",
 *    ]);
 * }
 *
 * assert.equal(matchMonad(Some(1)), "Some");
 * assert.equal(matchMonad(Ok(1)), "Ok");
 * assert.equal(matchMonad(Err(1)), "Err");
 * assert.equal(matchMonad(None), "None");
 * ```
 *
 * #### Fn (function as value)
 *
 * This wrapper distinguishes between a function to be called and a function to
 * be treated as a value. It is needed where the function value could be confused
 * with a filter function or result function.
 *
 * ```
 * const fnOne = () => 1;
 * const fnTwo = () => 2;
 * const fnDefault = () => "fnDefault";
 *
 * function matchFn(fnVal: (...args: any) => any): () => string {
 *    return match(fnVal, [
 *       [Fn(fnOne), () => () => "fnOne"], // Manual result wrapper
 *       [Fn(fnTwo), Fn(() => "fnTwo")], // Fn result wrapper
 *       () => fnDefault,
 *    ]);
 * }
 *
 * assert.equal(matchFn(fnOne)(), "fnOne");
 * assert.equal(matchFn(fnTwo)(), "fnTwo");
 * assert.equal(matchFn(() => 0)(), "fnDefault");
 * ```
 */
export declare function match<T, U>(val: T, pattern: MappedBranches<T, U> | ChainedBranches<T, U>): U;
export declare namespace match {
    var compile: {
        <T, U>(pattern: MappedBranches<T, U> | ChainedBranches<T, U>): (val: T) => U;
        <T_1, U_1>(pattern: OptionMapped<T_1, U_1>): (val: Option<T_1>) => U_1;
        <T_2, E, U_2>(pattern: ResultMapped<T_2, E, U_2>): (val: Result<T_2, E>) => U_2;
    };
}
export type match = typeof match;
/**
 * The `Default` (or `_`) value. Used as a marker to indicate "any value".
 */
export declare const Default: any;
export type Default = any;
/**
 * The `_` value. Used as a marker to indicate "any value".
 */
export declare const _: any;
export type _ = any;
/**
 * Creates a wrapper for a function so that it will be treated as a value
 * within a chained matching block. See `match` for more information about
 * when this needs to be used.
 */
export declare function Fn<T extends (...args: any) => any>(fn: T): () => T;
export type Fn<T> = {
    (): never;
    [FnVal]: T;
};
export {};
