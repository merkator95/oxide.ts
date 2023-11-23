"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Err = exports.Ok = exports.Result = exports.ResultType = void 0;
const common_1 = require("./common");
const option_1 = require("./option");
class ResultType {
    constructor(val, ok) {
        this[common_1.Val] = val;
        this[common_1.T] = ok;
    }
    [Symbol.iterator]() {
        return this[common_1.T]
            ? this[common_1.Val][Symbol.iterator]()
            : common_1.EmptyArray[Symbol.iterator]();
    }
    into(err) {
        return this[common_1.T] ? this[common_1.Val] : err;
    }
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
    intoTuple() {
        return this[common_1.T] ? [null, this[common_1.Val]] : [this[common_1.Val], null];
    }
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
    isLike(cmp) {
        return cmp instanceof ResultType && this[common_1.T] === cmp[common_1.T];
    }
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
    isOk() {
        return this[common_1.T];
    }
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
    isErr() {
        return !this[common_1.T];
    }
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
    filter(f) {
        return this[common_1.T] && f(this[common_1.Val]) ? (0, option_1.Some)(this[common_1.Val]) : option_1.None;
    }
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
    flatten() {
        return this[common_1.T] ? this[common_1.Val] : this;
    }
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
    expect(msg) {
        if (this[common_1.T]) {
            return this[common_1.Val];
        }
        else {
            throw new Error(msg);
        }
    }
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
    expectErr(msg) {
        if (this[common_1.T]) {
            throw new Error(msg);
        }
        else {
            return this[common_1.Val];
        }
    }
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
    unwrap() {
        return this.expect("Failed to unwrap Result (found Err)");
    }
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
    unwrapErr() {
        return this.expectErr("Failed to unwrapErr Result (found Ok)");
    }
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
    unwrapOr(def) {
        return this[common_1.T] ? this[common_1.Val] : def;
    }
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
    unwrapOrElse(f) {
        return this[common_1.T] ? this[common_1.Val] : f();
    }
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
    unwrapUnchecked() {
        return this[common_1.Val];
    }
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
    or(resb) {
        return this[common_1.T] ? this : resb;
    }
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
    orElse(f) {
        return this[common_1.T] ? this : f(this[common_1.Val]);
    }
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
    and(resb) {
        return this[common_1.T] ? resb : this;
    }
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
    andThen(f) {
        return this[common_1.T] ? f(this[common_1.Val]) : this;
    }
    async andThenAsync(f) {
        return this[common_1.T] ? await f(this[common_1.Val]) : this;
    }
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
    map(f) {
        return new ResultType(this[common_1.T] ? f(this[common_1.Val]) : this[common_1.Val], this[common_1.T]);
    }
    async mapAsync(f) {
        return new ResultType(this[common_1.T] ? await f(this[common_1.Val]) : this[common_1.Val], this[common_1.T]);
    }
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
    mapErr(op) {
        return new ResultType(this[common_1.T] ? this[common_1.Val] : op(this[common_1.Val]), this[common_1.T]);
    }
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
    mapOr(def, f) {
        return this[common_1.T] ? f(this[common_1.Val]) : def;
    }
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
    mapOrElse(def, f) {
        return this[common_1.T] ? f(this[common_1.Val]) : def(this[common_1.Val]);
    }
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
    ok() {
        return this[common_1.T] ? (0, option_1.Some)(this[common_1.Val]) : option_1.None;
    }
}
exports.ResultType = ResultType;
/**
 * Tests the provided `val` is an Result and acts as a type guard.
 *
 * ```
 * assert.equal(Result.is(Ok(1), true);
 * assert.equal(Result.is(Err(1), true));
 * assert.equal(Result.is(Some(1), false));
 * ```
 */
function is(val) {
    return val instanceof ResultType;
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
function Result(val) {
    return from(val);
}
exports.Result = Result;
Result.is = is;
Result.from = from;
Result.nonNull = nonNull;
Result.qty = qty;
Result.safe = safe;
Result.all = all;
Result.any = any;
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
function Ok(val) {
    return new ResultType(val, true);
}
exports.Ok = Ok;
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
function Err(val) {
    return new ResultType(val, false);
}
exports.Err = Err;
/**
 * Creates a new `Result<T, E>` which is `Ok<T>` unless the provided `val` is
 * falsey, an instance of `Error` or an invalid `Date`.
 *
 * The `T` is narrowed to exclude any falsey values or Errors.
 *
 * The `E` type includes:
 * - `null` (if `val` could have been falsey or an invalid date)
 * - `Error` types excluded from `T` (if there are any)
 *
 * **Note:** `null` is not a useful value. Consider `Option.from` or `mapErr`.
 *
 * ```
 * assert.equal(Result.from(1).unwrap(), 1);
 * assert.equal(Result(0).isErr(), true);
 *
 * const err = Result.from(new Error("msg"));
 * assert.equal(err.unwrapErr().message, "msg");
 *
 * // Create a Result<number, string>
 * const x = Option.from(1).okOr("Falsey Value");
 * ```
 */
function from(val) {
    return (0, common_1.isTruthy)(val)
        ? new ResultType(val, !(val instanceof Error))
        : Err(null);
}
/**
 * Creates a new `Result<T, null>` which is `Ok` unless the provided `val` is
 * `undefined`, `null` or `NaN`.
 *
 * **Note:** `null` is not a useful value. Consider `Option.nonNull` or
 * `mapErr`.
 *
 * ```
 * assert.equal(Result.nonNull(1).unwrap(), 1);
 * assert.equal(Result.nonNull(0).unwrap(), 0);
 * assert.equal(Result.nonNull(null).isErr(), true);
 *
 * // Create a Result<number, string>
 * const x = Option.nonNull(1).okOr("Nullish Value");
 * ```
 */
function nonNull(val) {
    return val === undefined || val === null || val !== val
        ? Err(null)
        : Ok(val);
}
/**
 * Creates a new Result<number, null> which is `Ok` when the provided `val` is
 * a finite integer greater than or equal to 0.
 *
 * **Note:** `null` is not a useful value. Consider `Option.qty` or `mapErr`.
 *
 * ```
 * const x = Result.qty("test".indexOf("s"));
 * assert.equal(x.unwrap(), 2);
 *
 * const x = Result.qty("test".indexOf("z"));
 * assert.equal(x.unwrapErr(), null);
 *
 * // Create a Result<number, string>
 * const x = Result.qty("test".indexOf("s")).mapErr(() => "Not Found");
 * ```
 */
function qty(val) {
    return val >= 0 && Number.isInteger(val) ? Ok(val) : Err(null);
}
function safe(fn, ...args) {
    if (fn instanceof Promise) {
        return fn.then((val) => Ok(val), toError);
    }
    try {
        return Ok(fn(...args));
    }
    catch (err) {
        return toError(err);
    }
}
function toError(err) {
    return err instanceof Error ? Err(err) : Err(new Error(String(err)));
}
/**
 * Converts a number of `Result`s into a single Result. The first `Err` found
 * (if any) is returned, otherwise the new Result is `Ok` and contains an array
 * of all the unwrapped values.
 *
 * ```
 * function num(val: number): Result<number, string> {
 *    return val > 10 ? Ok(val) : Err(`Value ${val} is too low.`);
 * }
 *
 * const xyz = Result.all(num(20), num(30), num(40));
 * const [x, y, z] = xyz.unwrap();
 * assert.equal(x, 20);
 * assert.equal(y, 30);
 * assert.equal(z, 40);
 *
 * const err = Result.all(num(20), num(5), num(40));
 * assert.equal(err.isErr(), true);
 * assert.equal(err.unwrapErr(), "Value 5 is too low.");
 * ```
 */
function all(...results) {
    const ok = [];
    for (const result of results) {
        if (result.isOk()) {
            ok.push(result.unwrapUnchecked());
        }
        else {
            return result;
        }
    }
    return Ok(ok);
}
/**
 * Converts a number of `Result`s into a single Result. The first `Ok` found
 * (if any) is returned, otherwise the new Result is an `Err` containing an
 * array of all the unwrapped errors.
 *
 * ```
 * function num(val: number): Result<number, string> {
 *    return val > 10 ? Ok(val) : Err(`Value ${val} is too low.`);
 * }
 *
 * const x = Result.any(num(5), num(20), num(2));
 * assert.equal(x.unwrap(), 20);
 *
 * const efg = Result.any(num(2), num(5), num(8));
 * const [e, f, g] = efg.unwrapErr();
 * assert.equal(e, "Value 2 is too low.");
 * assert.equal(f, "Value 5 is too low.");
 * assert.equal(g, "Value 8 is too low.");
 * ```
 */
function any(...results) {
    const err = [];
    for (const result of results) {
        if (result.isOk()) {
            return result;
        }
        else {
            err.push(result.unwrapUnchecked());
        }
    }
    return Err(err);
}
