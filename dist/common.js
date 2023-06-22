"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTruthy = exports.EmptyArray = exports.FnVal = exports.Val = exports.T = void 0;
/**
 * Unique marker for `Option` and `Result` types.
 *
 * ### Warning
 * This library sometimes assumes a value with this key is an Option or Result
 * without explicitly checking the instance type or other properties.
 */
exports.T = Symbol("T");
exports.Val = Symbol("Val");
exports.FnVal = Symbol("FnVal");
exports.EmptyArray = Object.freeze([]);
function isTruthy(val) {
    return val instanceof Date ? val.getTime() === val.getTime() : !!val;
}
exports.isTruthy = isTruthy;
