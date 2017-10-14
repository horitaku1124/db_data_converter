"use strict";

module.exports = class Node {
    constructor(type, value) {
        this._type = type;
        this._value = value;
    }

    get type() {
        return this._type;
    }
    set type(type) {
        this._type = type;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    get children() {
        return this._children;
    }
    set children(children) {
        this._children = children;
    }

    addChild(node) {
        if(typeof this._children === 'undefined') {
            this._children = [];
        }
        this._children.push(node);
    }
};