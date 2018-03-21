"use strict";


const SQLValue_NULL     = Symbol('NULL'),
    SQLValue_NUMBER   = Symbol('NUMBER'),
    SQLValue_STRING   = Symbol('STRING'),
    SQLValue_FUNCTION = Symbol('FUNCTION');
const toString = Symbol('TO_STRING');
Symbol.prototype[toString] = function() {
    let value = "Unknown";
    switch (this) {
        case SQLValue_NULL:
            value = "Null";
            break;
        case SQLValue_NUMBER:
            value = "Number";
            break;
        case SQLValue_STRING:
            value = "String";
            break;
        case SQLValue_FUNCTION:
            value = "Function";
            break;
    }
    return value;
};

const SQLValue_Select = [
    SQLValue_NULL[toString](),
    SQLValue_NUMBER[toString](),
    SQLValue_STRING[toString](),
    SQLValue_FUNCTION[toString](),
];
class SQLValue {
    constructor (value, type) {
        this._value = value;
        if (typeof type === 'undefined') {
            if (value === null) {
                type = SQLValue_NULL;
            } else if(typeof value === 'string') {
                type = SQLValue_STRING;
            }
        }
        this._type = type;
    }
    get type() {
        return this._type;
    }
    get value() {
        return this._value;
    }
    clone() {
        return new SQLValue(this._value, this._type);
    }
    static fromString(string) {
        if (string === SQLValue_NULL[toString]()) {
            return SQLValue_NULL;
        } else if (string === (SQLValue_STRING[toString]())){
            return SQLValue_STRING;
        } else if (string === (SQLValue_FUNCTION[toString]())){
            return SQLValue_FUNCTION;
        } else if (string === (SQLValue_NUMBER[toString]())){
            return SQLValue_NUMBER;
        }
        return "";
    }
}