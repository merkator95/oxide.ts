import { T, Val, IterType, FalseyValues } from "./common";
import { Option } from "./option";
export type Ok<T> = ResultType<T, never>;
export type Err<E> = ResultType<never, E>;
export type Result<T, E> = ResultType<T, E>;
type From<T> = Exclude<T, Error | FalseyValues>;
type ResultTypes<R> = {
    [K in keyof R]: R[K] extends Result<infer T, any> ? T : never;
};
type ResultErrors<R> = {
    [K in keyof R]: R[K] extends Result<any, infer U> ? U : never;
};
export declare class ResultType<T, E> {
    readonly [T]: boolean;
    readonly [Val]: T | E;
    constructor(val: T | E, ok: boolean);
    [Symbol.iterator](this: Result<T, E>): IterType<T>;
    /**
     * Returns the contained `T`, or `err` if the result is `Err`. The `err`
     * value must be falsey and defaults to `undefined`.
     *
     * ```
     * const x = Ok(1);
     * assert.equal(x.into(), 1);
     *
     * const x = Err(1);
     * assert.equal(x.into(), undefined);
     *
     * const x = Err(1);
     * assert.equal(x.into(null), null);
     * ```
     */
    into(this: Result<T, E>): T | undefined;
    into<U extends FalseyValues>(this: Result<T, E>, err: U): T | U;
    /**
     * Returns a tuple of `[null, T]` if the result is `Ok`, or `[E, null]`
     * otherwise.
     *
     * ```
     * const x: Result<number, string> = Ok(1);
     * assert.deepEqual(x.intoTuple(), [null, 1]);
     *
     * const x: Result<number, string> = Err("error")
     * assert.deepEqual(x.intoTuple(), ["error", null]);
     * ```
     */
    intoTuple(this: Result<T, E>): [null, T] | [E, null];
    /**
     * Compares the Result to `cmp`, returns true if both are `Ok` or both
     * are `Err` and acts as a type guard.
     *
     * ```
     * const o = Ok(1);
     * const e = Err(1);
     *
     * assert.equal(o.isLike(Ok(1))), true);
     * assert.equal(e.isLike(Err(1)), true);
     * assert.equal(o.isLike(e), false);
     * ```
     */
    isLike(this: Result<T, E>, cmp: unknown): cmp is Result<unknown, unknown>;
    /**
     * Returns true if the Result is `Ok` and acts as a type guard.
     *
     * ```
     * const x = Ok(10);
     * assert.equal(x.isOk(), true);
     *
     * const x = Err(10);
     * assert.equal(x.isOk(), false);
     * ```
     */
    isOk(this: Result<T, E>): this is Ok<T>;
    /**
     * Returns true if the Result is `Err` and acts as a type guard.
     *
     * ```
     * const x = Ok(10);
     * assert.equal(x.isErr(), false);
     *
     * const x = Err(10);
     * assert.equal(x.isErr(), true);
     * ```
     */
    isErr(this: Result<T, E>): this is Err<E>;
    /**
     * Creates an `Option<T>` by calling `f` with the contained `Ok` value.
     * Converts `Ok` to `Some` if the filter returns true, or `None` otherwise.
     *
     * For more advanced filtering, consider `match`.
     *
     * ```
     * const x = Ok(1);
     * assert.equal(x.filter((v) => v < 5).isLike(Some(1)), true);
     * assert.equal(x.filter((v) => v < 5).unwrap(), 1);
     *
     * const x = Ok(10);
     * assert.equal(x.filter((v) => v < 5).isNone(), true);
     *
     * const x = Err(1);
     * assert.equal(x.filter((v) => v < 5).isNone(), true);
     * ```
     */
    filter(this: Result<T, E>, f: (val: T) => boolean): Option<T>;
    /**
     * Flatten a nested `Result<Result<T, E>, F>` to a `Result<T, E | F>`.
     *
     * ```
     * type NestedResult = Result<Result<string, number>, boolean>;
     *
     * const x: NestedResult = Ok(Ok(1));
     * assert.equal(x.flatten().unwrap(), 1);
     *
     * const x: NestedResult = Ok(Err(1));
     * assert.equal(x.flatten().unwrapErr(), 1);
     *
     * const x: NestedResult = Err(false);
     * assert.equal(x.flatten().unwrapErr(), false);
     * ```
     */
    flatten<U, F>(this: Result<Result<U, F>, E>): Result<U, E | F>;
    /**
     * Returns the contained `Ok` value and throws `Error(msg)` if `Err`.
     *
     * To avoid throwing, consider `isOk`, `unwrapOr`, `unwrapOrElse` or
     * `match` to handle the `Err` case.
     *
     * ```
     * const x = Ok(1);
     * assert.equal(x.expect("Was Err"), 1);
     *
     * const x = Err(1);
     * const y = x.expect("Was Err"); // throws
     * ```
     */
    expect(this: Result<T, E>, msg: string): T;
    /**
     * Returns the contained `Err` value and throws `Error(msg)` if `Ok`.
     *
     * To avoid throwing, consider `isErr` or `match` to handle the `Ok` case.
     *
     * ```
     * const x = Ok(1);
     * const y = x.expectErr("Was Ok"); // throws
     *
     * const x = Err(1);
     * assert.equal(x.expectErr("Was Ok"), 1);
     * ```
     */
    expectErr(this: Result<T, E>, msg: string): E;
    /**
     * Returns the contained `Ok` value and throws if `Err`.
     *
     * To avoid throwing, consider `isOk`, `unwrapOr`, `unwrapOrElse` or
     * `match` to handle the `Err` case. To throw a more informative error use
     * `expect`.
     *
     * ```
     * const x = Ok(1);
     * assert.equal(x.unwrap(), 1);
     *
     * const x = Err(1);
     * const y = x.unwrap(); // throws
     * ```
     */
    unwrap(this: Result<T, E>): T;
    /**
     * Returns the contained `Err` value and throws if `Ok`.
     *
     * To avoid throwing, consider `isErr` or `match` to handle the `Ok` case.
     * To throw a more informative error use `expectErr`.
     *
     * ```
     * const x = Ok(1);
     * const y = x.unwrap(); // throws
     *
     * const x = Err(1);
     * assert.equal(x.unwrap(), 1);
     * ```
     */
    unwrapErr(this: Result<T, E>): E;
    /**
     * Returns the contained `Ok` value or a provided default.
     *
     * The provided default is eagerly evaluated. If you are passing the result
     * of a function call, consider `unwrapOrElse`, which is lazily evaluated.
     *
     * ```
     * const x = Ok(10);
     * assert.equal(x.unwrapOr(1), 10);
     *
     * const x = Err(10);
     * assert.equal(x.unwrapOr(1), 1);
     * ```
     */
    unwrapOr(this: Result<T, E>, def: T): T;
    /**
     * Returns the contained `Ok` value or computes it from a function.
     *
     * ```
     * const x = Ok(10);
     * assert.equal(x.unwrapOrElse(() => 1 + 1), 10);
     *
     * const x = Err(10);
     * assert.equal(x.unwrapOrElse(() => 1 + 1), 2);
     * ```
     */
    unwrapOrElse(this: Result<T, E>, f: () => T): T;
    /**
     * Returns the contained `Ok` value or throws the provided error.
     * The error value must implement the `Error` interface.
     */
    unwrapOrThrow(this: Result<T, Error>): T;
    /**
     * Returns the contained `Ok` or `Err` value.
     *
     * Most problems are better solved using one of the other `unwrap_` methods.
     * This method should only be used when you are certain that you need it.
     *
     * ```
     * const x = Ok(10);
     * assert.equal(x.unwrapUnchecked(), 10);
     *
     * const x = Err(20);
     * assert.equal(x.unwrapUnchecked(), 20);
     * ```
     */
    unwrapUnchecked(this: Result<T, E>): T | E;
    /**
     * Returns the Option if it is `Ok`, otherwise returns `resb`.
     *
     * `resb` is eagerly evaluated. If you are passing the result of a function
     * call, consider `orElse`, which is lazily evaluated.
     *
     * ```
     * const x = Ok(10);
     * const xor = x.or(Ok(1));
     * assert.equal(xor.unwrap(), 10);
     *
     * const x = Err(10);
     * const xor = x.or(Ok(1));
     * assert.equal(xor.unwrap(), 1);
     * ```
     */
    or(this: Result<T, E>, resb: Result<T, E>): Result<T, E>;
    /**
     * Returns the Result if it is `Ok`, otherwise returns the value of `f()`
     * mapping `Result<T, E>` to `Result<T, F>`.
     *
     * ```
     * const x = Ok(10);
     * const xor = x.orElse(() => Ok(1));
     * assert.equal(xor.unwrap(), 10);
     *
     * const x = Err(10);
     * const xor = x.orElse(() => Ok(1));
     * assert.equal(xor.unwrap(), 1);
     *
     * const x = Err(10);
     * const xor = x.orElse((e) => Err(`val ${e}`));
     * assert.equal(xor.unwrapErr(), "val 10");
     * ```
     */
    orElse<F>(this: Result<T, E>, f: (err: E) => Result<T, F>): Result<T, F>;
    /**
     * Returns itself if the Result is `Err`, otherwise returns `resb`.
     *
     * ```
     * const x = Ok(10);
     * const xand = x.and(Ok(1));
     * assert.equal(xand.unwrap(), 1);
     *
     * const x = Err(10);
     * const xand = x.and(Ok(1));
     * assert.equal(xand.unwrapErr(), 10);
     *
     * const x = Ok(10);
     * const xand = x.and(Err(1));
     * assert.equal(xand.unwrapErr(), 1);
     * ```
     */
    and<U>(this: Result<T, E>, resb: Result<U, E>): Result<U, E>;
    /**
     * Returns itself if the Result is `Err`, otherwise calls `f` with the `Ok`
     * value and returns the result.
     *
     * ```
     * const x = Ok(10);
     * const xand = x.andThen((n) => n + 1);
     * assert.equal(xand.unwrap(), 11);
     *
     * const x = Err(10);
     * const xand = x.andThen((n) => n + 1);
     * assert.equal(xand.unwrapErr(), 10);
     *
     * const x = Ok(10);
     * const xand = x.and(Err(1));
     * assert.equal(xand.unwrapErr(), 1);
     * ```
     */
    andThen<U>(this: Result<T, E>, f: (val: T) => Result<U, E>): Result<U, E>;
    andThenAsync<U>(this: Result<T, E>, f: (val: T) => Promise<Result<U, E>>): Promise<Result<U, E>>;
    /**
     * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to the
     * `Ok` value.
     *
     * ```
     * const x = Ok(10);
     * const xmap = x.map((n) => `number ${n}`);
     * assert.equal(xmap.unwrap(), "number 10");
     * ```
     */
    map<U>(this: Result<T, E>, f: (val: T) => U): Result<U, E>;
    mapAsync<U>(this: Result<T, E>, f: (val: T) => Promise<Result<U, E>>): Promise<Result<U, E>>;
    /**
     * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to the
     * `Err` value.
     *
     * ```
     * const x = Err(10);
     * const xmap = x.mapErr((n) => `number ${n}`);
     * assert.equal(xmap.unwrapErr(), "number 10");
     * ```
     */
    mapErr<F>(this: Result<T, E>, op: (err: E) => F): Result<T, F>;
    /**
     * Returns the provided default if `Err`, otherwise calls `f` with the
     * `Ok` value and returns the result.
     *
     * The provided default is eagerly evaluated. If you are passing the result
     * of a function call, consider `mapOrElse`, which is lazily evaluated.
     *
     * ```
     * const x = Ok(10);
     * const xmap = x.mapOr(1, (n) => n + 1);
     * assert.equal(xmap.unwrap(), 11);
     *
     * const x = Err(10);
     * const xmap = x.mapOr(1, (n) => n + 1);
     * assert.equal(xmap.unwrap(), 1);
     * ```
     */
    mapOr<U>(this: Result<T, E>, def: U, f: (val: T) => U): U;
    /**
     * Computes a default return value if `Err`, otherwise calls `f` with the
     * `Ok` value and returns the result.
     *
     * ```
     * const x = Ok(10);
     * const xmap = x.mapOrElse(() => 1 + 1, (n) => n + 1);
     * assert.equal(xmap.unwrap(), 11);
     *
     * const x = Err(10);
     * const xmap = x.mapOrElse(() => 1 + 1, (n) => n + 1);
     * assert.equal(xmap.unwrap(), 2);
     * ```
     */
    mapOrElse<U>(this: Result<T, E>, def: (err: E) => U, f: (val: T) => U): U;
    /**
     * Transforms the `Result<T, E>` into an `Option<T>`, mapping `Ok(v)` to
     * `Some(v)`, discarding any `Err` value and mapping to None.
     *
     * ```
     * const x = Ok(10);
     * const opt = x.ok();
     * assert.equal(x.isSome(), true);
     * assert.equal(x.unwrap(), 10);
     *
     * const x = Err(10);
     * const opt = x.ok();
     * assert.equal(x.isNone(), true);
     * const y = x.unwrap(); // throws
     * ```
     */
    ok(this: Result<T, E>): Option<T>;
}
/**
 * A Result represents success, or failure. If we hold a value
 * of type `Result<T, E>`, we know it is either `Ok<T>` or `Err<E>`.
 *
 * As a function, `Result` is an alias for `Result.from`.
 *
 * ```
 * const users = ["Fry", "Bender"];
 * function fetch_user(username: string): Result<string, string> {
 *    return users.includes(username) ? Ok(username) : Err("Wha?");
 * }
 *
 * function greet(username: string): string {
 *    return fetch_user(username).mapOrElse(
 *       (err) => `Error: ${err}`,
 *       (user) => `Good news everyone, ${user} is here!`
 *    );
 * }
 *
 * assert.equal(greet("Bender"), "Good news everyone, Bender is here!");
 * assert.equal(greet("SuperKing"), "Error: Wha?");
 * ```
 */
export declare function Result<T>(val: T): Result<From<T>, (T extends Error ? T : never) | (Extract<FalseyValues, T> extends never ? never : null)>;
export declare namespace Result {
    var is: (val: unknown) => val is Result<unknown, unknown>;
    var from: <T>(val: T) => Result<Exclude<T, Error | FalseyValues>, (T extends Error ? T : never) | (Extract<undefined, T> | Extract<null, T> | Extract<false, T> | Extract<"", T> | Extract<0, T> | Extract<0n, T> extends never ? never : null)>;
    var nonNull: <T>(val: T) => Result<NonNullable<T>, null>;
    var qty: <T extends number>(val: T) => Result<number, null>;
    var safe: {
        <T, A extends any[]>(fn: (...args: A) => T extends PromiseLike<any> ? never : T, ...args: A): Result<T, Error>;
        <T_1>(promise: Promise<T_1>): Promise<Result<T_1, Error>>;
    };
    var all: <R extends Result<any, any>[]>(...results: R) => Result<ResultTypes<R>, ResultErrors<R>[number]>;
    var any: <R extends Result<any, any>[]>(...results: R) => Result<ResultTypes<R>[number], ResultErrors<R>>;
}
/**
 * Creates an `Ok<T>` value, which can be used where a `Result<T, E>` is
 * required. See Result for more examples.
 *
 * Note that the counterpart `Err` type `E` is set to the same type as `T`
 * by default. TypeScript will usually infer the correct `E` type from the
 * context (e.g. a function which accepts or returns a Result).
 *
 * ```
 * const x = Ok(10);
 * assert.equal(x.isSome(), true);
 * assert.equal(x.unwrap(), 10);
 * ```
 */
export declare function Ok<T>(val: T): Ok<T>;
/**
 * Creates an `Err<E>` value, which can be used where a `Result<T, E>` is
 * required. See Result for more examples.
 *
 * Note that the counterpart `Ok` type `T` is set to the same type as `E`
 * by default. TypeScript will usually infer the correct `T` type from the
 * context (e.g. a function which accepts or returns a Result).
 *
 * ```
 * const x = Err(10);
 * assert.equal(x.isErr(), true);
 * assert.equal(x.unwrapErr(), 10);
 * ```
 */
export declare function Err<E>(val: E): Err<E>;
export {};
