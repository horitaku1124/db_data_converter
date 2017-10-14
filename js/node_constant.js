"use strict";

module.exports = {
    TYPE_NONE: Symbol('NONE'),
    TYPE_COLUMN: Symbol('COLUMN'),
    TYPE_FROM: Symbol('FROM'),
    TYPE_WHERE: Symbol('WHERE'),
    TYPE_VALUES: Symbol('VALUES'),

    NODE_TYPE_SELECT: Symbol('SELECT'),
    NODE_TYPE_UPDATE: Symbol('UPDATE'),
    NODE_TYPE_INSERT: Symbol('INSERT'),
    NODE_TYPE_DELETE: Symbol('DELETE'),

    NODE_VALUE: Symbol('VALUE'),
    NODE_CHILD_TYPE_COLUMN: Symbol('TYPE_COLUMN'),
    NODE_CHILD_TYPE_FROM: Symbol('TYPE_FROM'),
    NODE_CHILD_TYPE_WHERE: Symbol('TYPE_WHERE'),
    NODE_CHILD_TYPE_VALUES: Symbol('TYPE_VALUES'),
    NODE_CHILD_TYPE_INTO: Symbol('TYPE_INTO'),
};
