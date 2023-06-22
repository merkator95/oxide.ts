import { T, Val, IterType, FalseyValues } from "./common";
import { Result } from "./result";
export type Some<T> = OptionType<T> & {
    [T]: true;
};
export type None = OptionType<never> & {
    [T]: false;
};
export type Option<T> = OptionType<T>;
type From<T> = Exclude<T, Error | FalseyValues>;
type OptionTypes<O> = {
    [K in keyof O]: O[K] extends Option<infer T> ? T : never;
};
declare class OptionType<T> {
    readonly [T]: boolean;
    readonly [Val]: T;
    constructor(val: T, some: boolean);
    [Symbol.iterator](this: Option<T>): IterType<T>;
    /**
     * Return the contained `T`, or `none` if the option is `None`. The `none`
     * value must be falsey and defaults to `undefined`.
     *
     * ```
     * const x: Option<number> = Some(1);
     * assert.equal(x.into(), 1);
     *
     * const x: Option<number> = None;
     * assert.equal(x.into(), undefined);
     *
     * const x: Option<number> = None;
     * assert.equal(x.into(null), null);
     * ```
     */
    into(this: Option<T>): T | undefined;
    into<U extends FalseyValues>(this: Option<T>, none: U): T | U;
    /**
     * Compares the Option to `cmp`, returns true if both are `Some` or both
     * are `None` and acts as a type guard.
     *
     * ```
     * const s: Option<number> = Some(1);
     * const n: Option<number> = None;
     *
     * assert.equal(s.isLike(Some(10)), true);
     * assert.equal(n.isLike(None), true);
     * assert.equal(s.isLike(n), false);
     * ```
     */
    isLike(this: Option<T>, cmp: unknown): cmp is Option<unknown>;
    /**
     * Returns true if the Option is `Some` and acts as a type guard.
     *
     * ```
     * const x = Some(10);
     * assert.equal(x.Is(), true);
     *
     * const x: Option<number> = None;
     * assert.equal(x.Is(), false);
     * ```
     */
    isSome(this: Option<T>): this is Some<T>;
    /**
     * Returns true if the Option is `None` and acts as a type guard.
     *
     * ```
     * const x = Some(10);
     * assert.equal(x.isNone(), false);
     *
     * const x: Option<number> = None;
     * assert.equal(x.isNone(), true);
     * ```
     */
    isNone(this: Option<T>): this is None;
    /**
     * Calls `f` with the contained `Some` value, converting `Some` to `None` if
     * the filter returns false.
     *
     * For more advanced filtering, consider `match`.
     *
     * ```
     * const x = Some(1);
     * assert.equal(x.filter((v) => v < 5).unwrap(), 1);
     *
     * const x = Some(10);
     * assert.equal(x.filter((v) => v < 5).isNone(), true);
     *
     * const x: Option<number> = None;
     * assert.equal(x.filter((v) => v < 5).isNone(), true);
     * ```
     */
    filter(this: Option<T>, f: (val: T) => boolean): Option<T>;
    /**
     * Flatten a nested `Option<Option<T>>` to an `Option<T>`.
     *
     * ```
     * type NestedOption = Option<Option<number>>;
     *
     * const x: NestedOption = Some(Some(1));
     * assert.equal(x.flatten().unwrap(), 1);
     *
     * const x: NestedOption = Some(None);
     * assert.equal(x.flatten().isNone(), true);
     *
     * const x: NestedOption = None;
     * assert.equal(x.flatten().isNone(), true);
     * ```
     */
    flatten<U>(this: Option<Option<U>>): Option<U>;
    /**
     * Returns the contained `Some` value and throws `Error(msg)` if `None`.
     *
     * To avoid throwing, consider `Is`, `unwrapOr`, `unwrapOrElse` or
     * `match` to handle the `None` case.
     *
     * ```
     * const x = Some(1);
     * assert.equal(x.expect("Is empty"), 1);
     *
     * const x: Option<number> = None;
     * const y = x.expect("Is empty"); // throws
     * ```
     */
    expect(this: Option<T>, msg: string): T;
    /**
     * Returns the contained `Some` value and throws if `None`.
     *
     * To avoid throwing, consider `isSome`, `unwrapOr`, `unwrapOrElse` or
     * `match` to handle the `None` case. To throw a more informative error use
     * `expect`.
     *
     * ```
     * const x = Some(1);
     * assert.equal(x.unwrap(), 1);
     *
     * const x: Option<number> = None;
     * const y = x.unwrap(); // throws
     * ```
     */
    unwrap(this: Option<T>): T;
    /**
     * Returns the contained `Some` value or a provided default.
     *
     * The provided default is eagerly evaluated. If you are passing the result
     * of a function call, consider `unwrapOrElse`, which is lazily evaluated.
     *
     * ```
     * const x = Some(10);
     * assert.equal(x.unwrapOr(1), 10);
     *
     * const x: Option<number> = None;
     * assert.equal(x.unwrapOr(1), 1);
     * ```
     */
    unwrapOr(this: Option<T>, def: T): T;
    /**
     * Returns the contained `Some` value or computes it from a function.
     *
     * ```
     * const x = Some(10);
     * assert.equal(x.unwrapOrElse(() => 1 + 1), 10);
     *
     * const x: Option<number> = None;
     * assert.equal(x.unwrapOrElse(() => 1 + 1), 2);
     * ```
     */
    unwrapOrElse(this: Option<T>, f: () => T): T;
    /**
     * Returns the contained `Some` value or undefined if `None`.
     *
     * Most problems are better solved using one of the other `unwrap_` methods.
     * This method should only be used when you are certain that you need it.
     *
     * ```
     * const x = Some(10);
     * assert.equal(x.unwrapUnchecked(), 10);
     *
     * const x: Option<number> = None;
     * assert.equal(x.unwrapUnchecked(), undefined);
     * ```
     */
    unwrapUnchecked(this: Option<T>): T | undefined;
    /**
     * Returns the Option if it is `Some`, otherwise returns `optb`.
     *
     * `optb` is eagerly evaluated. If you are passing the result of a function
     * call, consider `orElse`, which is lazily evaluated.
     *
     * ```
     * const x = Some(10);
     * const xor = x.or(Some(1));
     * assert.equal(xor.unwrap(), 10);
     *
     * const x: Option<number> = None;
     * const xor = x.or(Some(1));
     * assert.equal(xor.unwrap(), 1);
     * ```
     */
    or(this: Option<T>, optb: Option<T>): Option<T>;
    /**
     * Returns the Option if it is `Some`, otherwise returns the value of `f()`.
     *
     * ```
     * const x = Some(10);
     * const xor = x.orElse(() => Some(1));
     * assert.equal(xor.unwrap(), 10);
     *
     * const x: Option<number> = None;
     * const xor = x.orElse(() => Some(1));
     * assert.equal(xor.unwrap(), 1);
     * ```
     */
    orElse(this: Option<T>, f: () => Option<T>): Option<T>;
    /**
     * Returns `None` if the Option is `None`, otherwise returns `optb`.
     *
     * ```
     * const x = Some(10);
     * const xand = x.and(Some(1));
     * assert.equal(xand.unwrap(), 1);
     *
     * const x: Option<number> = None;
     * const xand = x.and(Some(1));
     * assert.equal(xand.isNone(), true);
     *
     * const x = Some(10);
     * const xand = x.and(None);
     * assert.equal(xand.isNone(), true);
     * ```
     */
    and<U>(this: Option<T>, optb: Option<U>): Option<U>;
    /**
     * Returns `None` if the option is `None`, otherwise calls `f` with the
     * `Some` value and returns the result.
     *
     * ```
     * const x = Some(10);
     * const xand = x.andThen((n) => n + 1);
     * assert.equal(xand.unwrap(), 11);
     *
     * const x: Option<number> = None;
     * const xand = x.andThen((n) => n + 1);
     * assert.equal(xand.isNone(), true);
     *
     * const x = Some(10);
     * const xand = x.andThen(() => None);
     * assert.equal(xand.isNone(), true);
     * ```
     */
    andThen<U>(this: Option<T>, f: (val: T) => Option<U>): Option<U>;
    /**
     * Maps an `Option<T>` to `Option<U>` by applying a function to the `Some`
     * value.
     *
     * ```
     * const x = Some(10);
     * const xmap = x.map((n) => `number ${n}`);
     * assert.equal(xmap.unwrap(), "number 10");
     * ```
     */
    map<U>(this: Option<T>, f: (val: T) => U): Option<U>;
    /**
     * Returns the provided default if `None`, otherwise calls `f` with the
     * `Some` value and returns the result.
     *
     * The provided default is eagerly evaluated. If you are passing the result
     * of a function call, consider `mapOrElse`, which is lazily evaluated.
     *
     * ```
     * const x = Some(10);
     * const xmap = x.mapOr(1, (n) => n + 1);
     * assert.equal(xmap.unwrap(), 11);
     *
     * const x: Option<number> = None;
     * const xmap = x.mapOr(1, (n) => n + 1);
     * assert.equal(xmap.unwrap(), 1);
     * ```
     */
    mapOr<U>(this: Option<T>, def: U, f: (val: T) => U): U;
    /**
     * Computes a default return value if `None`, otherwise calls `f` with the
     * `Some` value and returns the result.
     *
     * const x = Some(10);
     * const xmap = x.mapOrElse(() => 1 + 1, (n) => n + 1);
     * assert.equal(xmap.unwrap(), 11);
     *
     * const x: Option<number> = None;
     * const xmap = x.mapOrElse(() => 1 + 1, (n) => n + 1);
     * assert.equal(xmap.unwrap(), 2);
     * ```
     */
    mapOrElse<U>(this: Option<T>, def: () => U, f: (val: T) => U): U;
    /**
     * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to
     * `Ok(v)` and `None` to `Err(err)`.
     *
     * ```
     * const x = Some(10);
     * const res = x.okOr("Is empty");
     * assert.equal(x.isOk(), true);
     * assert.equal(x.unwrap(), 10);
     *
     * const x: Option<number> = None;
     * const res = x.okOr("Is empty");
     * assert.equal(x.isErr(), true);
     * assert.equal(x.unwrap_err(), "Is empty");
     * ```
     */
    okOr<E>(this: Option<T>, err: E): Result<T, E>;
    /**
     * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to
     * `Ok(v)` and `None` to `Err(f())`.
     *
     * ```
     * const x = Some(10);
     * const res = x.okOrElse(() => ["Is", "empty"].join(" "));
     * assert.equal(x.isOk(), true);
     * assert.equal(x.unwrap(), 10);
     *
     * const x: Option<number> = None;
     * const res = x.okOrElse(() => ["Is", "empty"].join(" "));
     * assert.equal(x.isErr(), true);
     * assert.equal(x.unwrap_err(), "Is empty");
     * ```
     */
    okOrElse<E>(this: Option<T>, f: () => E): Result<T, E>;
}
/**
 * An Option represents either something, or nothing. If we hold a value
 * of type `Option<T>`, we know it is either `Some<T>` or `None`.
 *
 * As a function, `Option` is an alias for `Option.from`.
 *
 * ```
 * const users = ["Fry", "Bender"];
 * function fetch_user(username: string): Option<string> {
 *    return users.includes(username) ? Some(username) : None;
 * }
 *
 * function greet(username: string): string {
 *    return fetch_user(username)
 *       .map((user) => `Good news everyone, ${user} is here!`)
 *       .unwrapOr("Wha?");
 * }
 *
 * assert.equal(greet("Bender"), "Good news everyone, Bender is here!");
 * assert.equal(greet("SuperKing"), "Wha?");
 * ```
 */
export declare function Option<T>(val: T): Option<From<T>>;
export declare namespace Option {
    var is: (val: unknown) => val is Option<unknown>;
    var from: <T>(val: T) => Option<Exclude<T, Error | FalseyValues>>;
    var nonNull: <T>(val: T) => Option<NonNullable<T>>;
    var qty: <T extends number>(val: T) => Option<number>;
    var safe: {
        <T, A extends any[]>(fn: (...args: A) => T extends PromiseLike<any> ? never : T, ...args: A): Option<T>;
        <T_1>(promise: Promise<T_1>): Promise<Option<T_1>>;
    };
    var all: <O extends Option<any>[]>(...options: O) => Option<OptionTypes<O>>;
    var any: <O extends Option<any>[]>(...options: O) => Option<OptionTypes<O>[number]>;
}
/**
 * Creates a `Some<T>` value, which can be used where an `Option<T>` is
 * required. See Option for more examples.
 *
 * ```
 * const x = Some(10);
 * assert.equal(x.isSome(), true);
 * assert.equal(x.unwrap(), 10);
 * ```
 */
export declare function Some<T>(val: T): Some<T>;
/**
 * The `None` value, which can be used where an `Option<T>` is required.
 * See Option for more examples.
 *
 * ```
 * const x = None;
 * assert.equal(x.isNone(), true);
 * const y = x.unwrap(); // throws
 * ```
 */
export declare const None: Readonly<OptionType<never>>;
export {};
