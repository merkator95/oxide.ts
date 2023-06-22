"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.None = exports.Some = exports.Option = void 0;
const common_1 = require("./common");
const result_1 = require("./result");
class OptionType {
    constructor(val, some) {
        this[common_1.T] = some;
        this[common_1.Val] = val;
    }
    [Symbol.iterator]() {
        return this[common_1.T]
            ? this[common_1.Val][Symbol.iterator]()
            : common_1.EmptyArray[Symbol.iterator]();
    }
    into(none) {
        return this[common_1.T] ? this[common_1.Val] : none;
    }
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
    isLike(cmp) {
        return cmp instanceof OptionType && this[common_1.T] === cmp[common_1.T];
    }
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
    isSome() {
        return this[common_1.T];
    }
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
    isNone() {
        return !this[common_1.T];
    }
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
    filter(f) {
        return this[common_1.T] && f(this[common_1.Val]) ? this : exports.None;
    }
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
    flatten() {
        return this[common_1.T] ? this[common_1.Val] : exports.None;
    }
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
    expect(msg) {
        if (this[common_1.T]) {
            return this[common_1.Val];
        }
        else {
            throw new Error(msg);
        }
    }
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
    unwrap() {
        return this.expect("Failed to unwrap Option (found None)");
    }
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
    unwrapOr(def) {
        return this[common_1.T] ? this[common_1.Val] : def;
    }
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
    unwrapOrElse(f) {
        return this[common_1.T] ? this[common_1.Val] : f();
    }
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
    unwrapUnchecked() {
        return this[common_1.Val];
    }
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
    or(optb) {
        return this[common_1.T] ? this : optb;
    }
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
    orElse(f) {
        return this[common_1.T] ? this : f();
    }
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
    and(optb) {
        return this[common_1.T] ? optb : exports.None;
    }
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
    andThen(f) {
        return this[common_1.T] ? f(this[common_1.Val]) : exports.None;
    }
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
    map(f) {
        return this[common_1.T] ? new OptionType(f(this[common_1.Val]), true) : exports.None;
    }
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
    mapOr(def, f) {
        return this[common_1.T] ? f(this[common_1.Val]) : def;
    }
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
    mapOrElse(def, f) {
        return this[common_1.T] ? f(this[common_1.Val]) : def();
    }
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
    okOr(err) {
        return this[common_1.T] ? (0, result_1.Ok)(this[common_1.Val]) : (0, result_1.Err)(err);
    }
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
    okOrElse(f) {
        return this[common_1.T] ? (0, result_1.Ok)(this[common_1.Val]) : (0, result_1.Err)(f());
    }
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
function Option(val) {
    return from(val);
}
exports.Option = Option;
Option.is = is;
Option.from = from;
Option.nonNull = nonNull;
Option.qty = qty;
Option.safe = safe;
Option.all = all;
Option.any = any;
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
function Some(val) {
    return new OptionType(val, true);
}
exports.Some = Some;
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
exports.None = Object.freeze(new OptionType(undefined, false));
/**
 * Tests whether the provided `val` is an Option, and acts as a type guard.
 *
 * ```
 * assert.equal(Option.is(Some(1), true);
 * assert.equal(Option.is(None, true));
 * assert.equal(Option.is(Ok(1), false));
 * ```
 */
function is(val) {
    return val instanceof OptionType;
}
/**
 * Creates a new `Option<T>` which is `Some` unless the provided `val` is
 * falsey, an instance of `Error` or an invalid `Date`. This function is
 * aliased by `Option`.
 *
 * The `T` type is narrowed to exclude falsey orError values.
 *
 * ```
 * assert.equal(Option.from(1).unwrap(), 1);
 * assert.equal(from(0).isNone(), true);
 *
 * const err = Option.from(new Error("msg"));
 * assert.equal(err.isNone(), true);
 * ```
 */
function from(val) {
    return (0, common_1.isTruthy)(val) && !(val instanceof Error) ? Some(val) : exports.None;
}
/**
 * Creates a new `Option<T>` which is `Some` unless the provided `val` is
 * `undefined`, `null` or `NaN`.
 *
 * ```
 * assert.equal(Option.nonNull(1).unwrap(), 1);
 * assert.equal(Option.nonNull(0).unwrap(), 0);
 * assert.equal(Option.nonNull(null).isNone(), true);
 * ```
 */
function nonNull(val) {
    return val === undefined || val === null || val !== val
        ? exports.None
        : Some(val);
}
/**
 * Creates a new Option<number> which is `Some` when the provided `val` is a
 * finite integer greater than or equal to 0.
 *
 * ```
 * const x = Option.qty("test".indexOf("s"));
 * assert.equal(x.unwrap(), 2);
 *
 * const x = Option.qty("test".indexOf("z"));
 * assert.equal(x.isNone(), true);
 * ```
 */
function qty(val) {
    return val >= 0 && Number.isInteger(val) ? Some(val) : exports.None;
}
function safe(fn, ...args) {
    if (fn instanceof Promise) {
        return fn.then((val) => Some(val), () => exports.None);
    }
    try {
        return Some(fn(...args));
    }
    catch {
        return exports.None;
    }
}
/**
 * Converts a number of `Option`s into a single Option. If any of the provided
 * Options are `None` then the new Option is also None. Otherwise the new
 * Option is `Some` and contains an array of all the unwrapped values.
 *
 * ```
 * function num(val: number): Option<number> {
 *    return val > 10 ? Some(val) : None;
 * }
 *
 * const xyz = Option.all(num(20), num(30), num(40));
 * const [x, y, z] = xyz.unwrap();
 * assert.equal(x, 20);
 * assert.equal(y, 30);
 * assert.equal(z, 40);
 *
 * const x = Option.all(num(20), num(5), num(40));
 * assert.equal(x.isNone(), true);
 * ```
 */
function all(...options) {
    const some = [];
    for (const option of options) {
        if (option.isSome()) {
            some.push(option.unwrapUnchecked());
        }
        else {
            return exports.None;
        }
    }
    return Some(some);
}
/**
 * Converts a number of `Options`s into a single Option. The first `Some` found
 * (if any) is returned, otherwise the new Option is `None`.
 *
 * ```
 * function num(val: number): Option<number> {
 *    return val > 10 ? Some(val) : None;
 * }
 *
 * const x = Option.any(num(5), num(20), num(2));
 * assert.equal(x.unwrap(), 20);
 *
 * const x = Option.any(num(2), num(5), num(8));
 * assert.equal(x.isNone(), true);
 * ```
 */
function any(...options) {
    for (const option of options) {
        if (option.isSome()) {
            return option;
        }
    }
    return exports.None;
}
