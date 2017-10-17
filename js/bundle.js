/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const assert = __webpack_require__(2);
const QueryParser = __webpack_require__(7);

let headerCells;
let bodyData;
document.addEventListener('DOMContentLoaded', () => {
    console.log('loaded2');
    let performFromWb = document.getElementById('perform_from_wb');
    let performFromSql = document.getElementById('perform_from_sql');
    let generate = document.getElementById('generate');
    performFromWb.addEventListener('click', (e) => {
        onPerform();
    });
    performFromSql.addEventListener('click', (e) => {
        onPerformSql();
    });
    generate.addEventListener('click', (e) => {
        onGenerate();
    });
});


function onPerform() {
    let inputText = document.getElementById('inputSection').value;
    let lines = inputText.split('\n');
    let header = lines[0];
    headerCells = header.replace(/^# /, '').split(', ');

    bodyData = [];

    for (let i = 1;i < lines.length;i++) {
        if (lines[i] === '') continue;
        let cells = lines[i].split(', ');
        cells = cells.map(e => {
            let value = e.toUpperCase();
            let type = SQLValue_STRING;
            if (value === 'NULL') {
                type = SQLValue_NULL;
                value = null;
            } else {
                value = e.replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1');
                if (/^\d+$/.test(value)) {
                    type = SQLValue_NUMBER;
                }
            }
            return new SQLValue(value, type);
        });
        bodyData.push(cells);
    }

    createDataTable(headerCells, bodyData);
}
function onPerformSql() {
    let sql = document.getElementById('inputSection').value;
    let parser = new QueryParser([]);
    let parseResultList = parser.convert(sql);

    let newBodyData = [];
    for (let parseResult of parseResultList) {
        parseResult.records.forEach(row =>  {
            row = row.map(cell => {
                let type =  SQLValue_STRING;
                if (cell.toUpperCase() === 'NULL') {
                    type = SQLValue_NULL;
                    cell = null;
                } else if (/^\S+\(\)$/.test(cell)) {
                    type = SQLValue_FUNCTION;
                } else if (/^\d+$/.test(cell)) {
                    type = SQLValue_NUMBER;
                }
                return new SQLValue(cell, type)
            });
            newBodyData.push(row);
        });
    }
    bodyData = newBodyData;

    headerCells = parseResultList[0].selectors;
    document.getElementById('table_name').value = parseResultList[0].into;
    createDataTable(headerCells, bodyData);
}

function createDataTable(header, body) {
    let displayTable = document.createElement('table');
    let thead = document.createElement('thead');
    let tr = document.createElement('tr');

    // Control area
    tr.appendChild(document.createElement('th'));
    for (let i = 0;i < header.length;i++) {
        let index = i;
        let cell = header[i];
        let menuAction = document.createElement('div');
        menuAction.setAttribute('class', 'menu_action');

        let deleteThisColumn = document.createElement('input');
        deleteThisColumn.setAttribute('type', 'button');
        deleteThisColumn.setAttribute('class', 'delete_this_column');
        deleteThisColumn.setAttribute('value', 'Delete this column');
        deleteThisColumn.addEventListener('click', () => {
            headerCells.splice(index, 1);
            bodyData = bodyData.map(row => {
                row.splice(index, 1);
                return row;
            });
            createDataTable(headerCells, bodyData);
        });
        let changeThisColumn = document.createElement('input');
        changeThisColumn.setAttribute('type', 'button');
        changeThisColumn.setAttribute('class', 'change_this_to');
        changeThisColumn.setAttribute('value', 'Change this column');
        changeThisColumn.addEventListener('click', () => {
            menuAction.click();
            selectWindow(SQLValue_Select, (type) => {
                if (type === SQLValue_NULL[toString]()) {
                    bodyData = bodyData.map(row => {
                        row[index] = new SQLValue(null);
                        return row;
                    });
                    createDataTable(headerCells, bodyData);
                } else {
                    inputWindow(text => {
                        bodyData = bodyData.map(row => {
                            row[index] = new SQLValue(text, SQLValue.fromString(type));
                            return row;
                        });
                        createDataTable(headerCells, bodyData);
                    }, true);
                }
            });
        });

        menuAction.appendChild(deleteThisColumn);
        menuAction.appendChild(changeThisColumn);

        let menu = document.createElement('span');
        menu.setAttribute('class', 'menu_toggle');
        menu.addEventListener('click', () => {
            if(menuAction.style.display === 'block') {
                menuAction.style.display = 'none';
            } else {
                menuAction.style.display = 'block';
            }
        });
        menu.innerText = '▽';
        let cellElm = document.createElement('th');
        let cellEllipsisElm = document.createElement('span');
        cellEllipsisElm.setAttribute('class', 'text_area');
        cellEllipsisElm.innerText = cell;
        cellElm.appendChild(cellEllipsisElm);
        cellElm.setAttribute('title', cell);
        cellElm.appendChild(menu);
        cellElm.appendChild(menuAction);
        tr.appendChild(cellElm);
    }
    thead.appendChild(tr);
    displayTable.appendChild(thead);

    let tbody = document.createElement('tbody');
    for (let i = 0;i < body.length;i++) {
        let tr = document.createElement('tr');
        let cells = body[i];

        // Control Area
        let controlArea = document.createElement('td');
        let cpButton = document.createElement('input');
        cpButton.setAttribute('type', 'button');
        cpButton.setAttribute('value', 'cp');
        cpButton.addEventListener('click', () => {
            bodyData.push(bodyData[i].map(e => e.clone()));
            createDataTable(headerCells, bodyData);
        });
        let delButton = document.createElement('input');
        delButton.setAttribute('type', 'button');
        delButton.addEventListener('click', () => {
            bodyData.splice(i, 1);
            createDataTable(headerCells, bodyData);
        });
        delButton.setAttribute('value', 'del');

        controlArea.appendChild(cpButton);
        controlArea.appendChild(delButton);
        tr.appendChild(controlArea);
        for (let j = 0;j < cells.length;j++) {
            let cell = cells[j];
            let cellElm = document.createElement('td');

            if (cell.type !== SQLValue_NULL) {
                cellElm.setAttribute('id', "cell_" + i + "_" + j);
                cellElm.setAttribute('data-id', i + "_" + j);
                cellElm.setAttribute('data-appended', "0");
                cellElm.addEventListener('mouseover', mouseOverEvent);

                let cellText = document.createElement('span');
                cellText.innerText = cell.value;
                cellElm.appendChild(cellText);
            }
            let typeSelector =  document.createElement('span');
            typeSelector.innerHTML = cell.type[toString]();
            typeSelector.setAttribute('class', 'type_selector');
            typeSelector.addEventListener('click', () => {
                selectWindow(SQLValue_Select, (type) => {
                    if (type === SQLValue_NULL[toString]()) {
                        bodyData[i][j] = new SQLValue(null);
                    }
                    if (cell.type === SQLValue_NULL && type === SQLValue_STRING[toString]()) {
                        bodyData[i][j] = new SQLValue('', SQLValue_STRING);
                    }
                    if (cell.type === SQLValue_STRING && type === SQLValue_NUMBER[toString]()) {
                        bodyData[i][j] = new SQLValue(bodyData[i][j].value, SQLValue_NUMBER);
                    }
                    if (type === SQLValue_FUNCTION[toString]()) {
                        bodyData[i][j] = new SQLValue('', SQLValue_FUNCTION);
                    }
                    console.log(cell.type[toString](), type);
                    createDataTable(headerCells, bodyData);
                });
            });
            cellElm.appendChild(typeSelector);

            tr.appendChild(cellElm);
        }
        tbody.appendChild(tr);
    }
    displayTable.appendChild(tbody);
    document.getElementById('displayTable').innerHTML = '';

    document.getElementById('displayTable').appendChild(displayTable);
    document.getElementById('generate').removeAttribute('disabled');
}

function onGenerate() {
    let combineToOneQuery = document.querySelector('#combine_1_query').checked;
    let tableName = document.getElementById('table_name').value;
    let insertSql = "INSERT INTO `" + tableName + "` (";
    insertSql += headerCells.map(e => "`" + e + "`").join(',');
    insertSql += ') VALUES ';

    let outputSql = "";
    if (combineToOneQuery) {
        outputSql = insertSql + "\r\n(";
        outputSql += bodyData.map(row => row
            .map(e => {
                if (e.type === SQLValue_NULL) {
                    return "NULL";
                } else if (e.type === SQLValue_FUNCTION) {
                    return e.value;
                } else if (e.type === SQLValue_NUMBER) {
                    return e.value;
                } else {
                    e = e.value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    return "'" + e + "'";
                }
            }).join(",")).join(")\r\n(");
        outputSql += ");"
    } else {
        for (let row of bodyData) {
            outputSql += insertSql + "("
                + (row
                    .map(e => {
                        if (e.type === SQLValue_NULL) {
                            return "NULL";
                        } else if (e.type === SQLValue_FUNCTION) {
                            return e.value;
                        } else if (e.type === SQLValue_NUMBER) {
                            return e.value;
                        } else {
                            e = e.value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                            return "'" + e + "'";
                        }
                    }).join(','))
                + ');\r\n';
        }
    }
    document.getElementById('outputText').innerHTML = outputSql;
}
let onMouseTd = null;
function mouseOverEvent(event) {
    let td = this;
    if (onMouseTd && onMouseTd.id === td.id) {
        return;
    }
    let isAppended = td.getAttribute('data-appended') === '1';
    let [row, cell] = td.getAttribute('data-id').split('_');
//    console.log(isAppended, row, cell);

    if (onMouseTd) {
        addClass(onMouseTd.querySelector('input'), 'hidden');
        removeClass(onMouseTd.querySelector('span'), 'hidden');
    }

    if (isAppended) {
        td.querySelector('span').setAttribute('class', 'hidden');
        removeClass(td.querySelector('input'), 'hidden');
    } else {
        let input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('value', bodyData[row][cell].value);
        addClass(input, 'editable');
        td.appendChild(input);
        td.setAttribute('data-appended', '1');
        addClass(td.querySelector('span'), 'hidden');
        input.addEventListener('change', () => {
            bodyData[row][cell] = new SQLValue(input.value, bodyData[row][cell].type);
            td.querySelector('span').innerHTML = input.value;
        });
    }
    onMouseTd = td;
}
function addClass(target, className) {
    let classValue = target.getAttribute('class') || '';
    let classValues = classValue.split(' ');
    if (!classValues.includes(className)) {
        classValues.push(className);
    }
    target.setAttribute('class', classValues.join(' '))
}

function removeClass(target, className) {
    let classValue = target.getAttribute('class');
    classValue = classValue.split(' ').filter(e => e !== className).join(' ');
    target.setAttribute('class', classValue);
}

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
function selectWindow(array, callback) {
    let selectorWindow = document.getElementById('selectorWindowArea');
    if(!selectorWindow) {
        selectorWindow = document.createElement('div');
        selectorWindow.setAttribute('id', 'selectorWindowArea');
        document.body.appendChild(selectorWindow);

        selectorWindow.setAttribute('style', 'position:fixed;top:0;left:0;background-color:rgba(200,200,200,0.7);width:100%;height:100%;');
    } else {
        selectorWindow.innerHTML = '';
        selectorWindow.style.display = '';
    }

    array.forEach(e => {
        let radios = document.createElement('p');
        radios.setAttribute('style', 'background-color: white;padding:0;margin:0;width:100px;');
        radios.innerHTML = e;
        radios.addEventListener('click', () => {
            selectorWindow.style.display = 'none';
            callback(e);
        });

        selectorWindow.appendChild(radios);
    });

    document.addEventListener('keyup', function(event) {
        if (event.key === 'Escape') {
            selectorWindow.style.display = 'none';
        }
    });
}
function inputWindow(callback, doFocus = false) {
    let inputWindow = document.getElementById('inputWindowArea');
    if(!inputWindow) {
        inputWindow = document.createElement('div');
        inputWindow.setAttribute('id', 'inputWindowArea');
        document.body.appendChild(inputWindow);
    } else {
        inputWindow.style.display = '';
        inputWindow.innerHTML = '';
    }
    inputWindow.setAttribute('style', 'position:fixed;top:0;left:0;background-color:rgba(200,200,200,0.7);width:100%;height:100%;');

    let inputText = document.createElement('input');
    inputText.setAttribute('id', 'inputWindowArea_input');
    let goButton = document.createElement('input');
    goButton.setAttribute('type', 'button');
    goButton.setAttribute('value', 'Apply');
    goButton.addEventListener('click', () => {
        inputWindow.style.display = 'none';
        callback(inputText.value);
    });

    inputWindow.appendChild(inputText);
    inputWindow.appendChild(goButton);

    document.addEventListener('keyup', function(event) {
        if (event.key === 'Escape') {
            inputWindow.style.display = 'none';
        }
    });
    if(doFocus) {
        inputText.focus();
    }
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = __webpack_require__(3);
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__(5);

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = __webpack_require__(6);

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0), __webpack_require__(4)))

/***/ }),
/* 4 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),
/* 6 */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const constant = __webpack_require__(8);
const Node = __webpack_require__(9);

module.exports = class QueryParser {
    constructor(global)
    {
        this._global = global;
    }
    test() {
        return constant.TYPE_NONE;
    }
    static exeVerse(type, queryTokens, verse) {
        if(type === constant.TYPE_COLUMN) {
            queryTokens.columns.push(verse);
        }
        if(type === constant.TYPE_FROM) {
            queryTokens.froms.push(verse);
        }
        if(type === constant.TYPE_WHERE) {
            if(/^and$/i.test(verse)) {
                verse = verse.toUpperCase();
            }
            queryTokens.wheres.push(verse);
        }
        if(type === constant.TYPE_VALUES) {
            queryTokens.values.push(verse);
        }
    }

    static makeSyntaxTree(queryType, queryTokens)
    {
        let root = new Node();
        switch (queryType) {
            case "select":
                root.type = constant.NODE_TYPE_SELECT;
                break;
            case "update":
                root.type = constant.NODE_TYPE_UPDATE;
                break;
            case "insert":
                root.type = constant.NODE_TYPE_INSERT;
                break;
            case "delete":
                root.type = constant.NODE_TYPE_DELETE;
                break;
            default:
                throw Error("error");
                break;
        }

        if(root.type === constant.NODE_TYPE_SELECT || root.type === constant.NODE_TYPE_INSERT){
            let columnNode = new Node(constant.NODE_CHILD_TYPE_COLUMN);

            if(root.type === constant.NODE_TYPE_INSERT) {
                let into = queryTokens.columns[0].toLowerCase();
                if(into !== "into") {
                    throw Error('INSERT "INTO" error');
                }

                let node = new Node(constant.NODE_CHILD_TYPE_INTO, queryTokens.columns[1]);
                root.addChild(node);
            }

            for(let i = 2;i < queryTokens.columns.length;i++) {
                let column = queryTokens.columns[i];
                if(column !== "," && column !== "("  && column !== ")") {
                    let node = new Node(constant.NODE_VALUE, column);
                    columnNode.addChild(node);
                }
            }
            root.addChild(columnNode);
        }
        if(root.type === constant.NODE_TYPE_SELECT || root.type === constant.NODE_TYPE_UPDATE ||  root.type === constant.NODE_TYPE_DELETE){
            let fromNode = new Node(constant.NODE_CHILD_TYPE_FROM);

            for(let i = 0;i < queryTokens.froms.length;i++) {
                let column = queryTokens.froms[i];
                if(column !== ",") {
                    let node = new Node(constant.NODE_VALUE, column);
                    fromNode.addChild(node);
                }
            }
            root.addChild(fromNode);
        }
        if(root.type === constant.NODE_TYPE_SELECT || root.type === constant.NODE_TYPE_UPDATE ||  root.type === constant.NODE_TYPE_DELETE){
            let whereNode = new Node(constant.NODE_CHILD_TYPE_WHERE);

            let length = queryTokens.wheres.length;
            for(let i = 0;i < length;i++) {
                let column = queryTokens.wheres[i];

                if(column === ",") {
                    continue;
                }
                if(column === "AND") {
                    let node = new Node(constant.NODE_VALUE, "AND");
                    whereNode.addChild(node);
                    continue;
                }
                let formulas = [column];
                for(let j = 0;j < 2;j++) {
                    if((i + 2 <= length) &&  queryTokens.wheres[i + 1] !== "and") {
                        formulas.push(queryTokens.wheres[i + 1]);
                        i++;
                    } else {
                        break;
                    }
                }
                let node = new Node(constant.NODE_VALUE, formulas);
                whereNode.addChild(node);
            }
            root.addChild(whereNode);
        }
        if(root.type === constant.NODE_TYPE_INSERT){
            let valuesNode, nestDepth = 0;

            for(let i = 0;i < queryTokens.values.length;i++) {
                let column = queryTokens.values[i];
                if(column === ";") {
                    break;
                }
                if(column === '(') {
                    valuesNode = new Node(constant.NODE_CHILD_TYPE_VALUES);
                    nestDepth++;
                }
                if(column === ')') {
                    root.addChild(valuesNode);
                    nestDepth--;
                }
                if(/[a-zA-Z0-9\_]+/.test(column)) {
                    let next = queryTokens.values[i + 1] !== undefined ? queryTokens.values[i + 1] : null;
                    let next2 = queryTokens.values[i + 2] !== undefined ? queryTokens.values[i + 2] : null;
                    if(next === "(" && next2 === ")") {
                        let node = new Node(constant.NODE_VALUE, column + next + next2);
                        valuesNode.addChild(node);
                        i += 2;
                        continue;
                    }
                }
                // Value type
                if(column !== "," && column !== "("  && column !== ")") {
                    // if(column.indexOf("\\") >= 0) {
                    //     column = QueryParser.escapeByCharacter(column);
                    // }
                    let node = new Node(constant.NODE_VALUE, column);
                    valuesNode.addChild(node);
                }
            }
            let nameCount = root.children[1].children.length;
            for(let i = 2;i < root.children.length;i++) {
                if(nameCount !== root.children[i].children.length) {
                    throw new Error("length error");
                }
            }
        }
        return root;
    }

    static escapeByCharacter(chars) {
        let index = 0;
        while(true) {
            index = chars.indexOf("\\", index);
            if(index < 0) {
                break;
            }
            let c = chars.charAt(index + 1);
            let replaceTo = " ";
            switch (c) {
                case "'":
                    replaceTo = "'";
                    break;
                case "\"":
                    replaceTo = "\"";
                    break;
                case "n":
                    replaceTo = "\n";
                    break;
                default:
                    break;
            }
            chars = chars.substring(0, index) + replaceTo + chars.substring(index + 2);
            index--;
        }
        return chars;
    }


    convert(sql)
    {
        let queryTokens = {
            columns: [],
            froms: [],
            wheres: [],
            values: [],
            into: null
        };
        let queryTokensList = [];

        let verse = "", quote = null, queryType;
        let queryTypeDecided = false;
        let type = constant.TYPE_NONE;
        for(let i = 0;i < sql.length;i++) {
            const char = sql[i];
            if(quote !== null) {
                if(char === quote) {
                    quote = null;
                    QueryParser.exeVerse(type, queryTokens, verse);
                    verse = "";
                } else {
                    verse += char;
                }
                continue;
            }
            if(char === '\'' || char === '"' || char === '`') {
                quote = char;
            } else if(char === ' ' || char === '\t' || char === '\r' || char === '\n') {
                let verse2 = verse.toLowerCase();
                if(verse2 === "select" || verse2 === "insert") {
                    type = constant.TYPE_COLUMN;
                    queryType = verse2;
                    queryTypeDecided = true;
                } else if(verse2 === "from") {
                    type = constant.TYPE_FROM;
                } else if(verse2 === "where") {
                    type = constant.TYPE_WHERE;
                } else if(verse2 === "values") {
                    type = constant.TYPE_VALUES;
                } else {
                    if(verse !== "") {
                        QueryParser.exeVerse(type, queryTokens, verse);
                    }
                }
                verse = "";
            } else if(char === ',' || char === '(' || char === ')') {
                if(verse !== "") {
                    QueryParser.exeVerse(type, queryTokens, verse);
                }
                QueryParser.exeVerse(type, queryTokens, char);
                verse = "";
            } else if(char === ';') {
                queryTokensList.push([queryType, queryTokens]);
                queryTokens = {
                    columns: [],
                    froms: [],
                    wheres: [],
                    values: [],
                    into: null
                };
            } else {
                verse += char;
            }
        }
        if(verse !== "") {
            QueryParser.exeVerse(queryType, queryTokens, verse);
        }
        if (queryTokens.columns.length > 0 && queryTokens.values.length > 0) {
            queryTokensList.push([type, queryTokens]);
        }

        let parseResultList = [];
        for (let [queryType, queryTokens] of queryTokensList) {
            let syntaxTree = QueryParser.makeSyntaxTree(queryType, queryTokens);

            let selectors = [], froms = [], wheres = [], records = [], into = null;
            for(let i = 0;i < syntaxTree.children.length;i++) {
                let node = syntaxTree.children[i];
                if(node.type === constant.NODE_CHILD_TYPE_COLUMN) {
                    for(let child of node.children) {
                        selectors.push(child.value);
                    }
                }
                if(node.type === constant.NODE_CHILD_TYPE_FROM) {
                    for(let child of node.children) {
                        froms.push(child.value);
                    }
                }
                if(node.type === constant.NODE_CHILD_TYPE_WHERE) {
                    for(let child of node.children) {
                        wheres.push(child.value);
                    }
                }
                if(node.type === constant.NODE_CHILD_TYPE_VALUES) {
                    let values = [];
                    for(let child of node.children) {
                        values.push(child.value);
                    }
                    records.push(values);
                }
                if(node.type === constant.NODE_CHILD_TYPE_INTO) {
                    into = node.value;
                }
            }
            let parseResult = {type: queryType};
            if(queryType === "select" || queryType === "update" || queryType === "delete") {
                let dataSource = fromToDataSource(this._global, froms);
                dataSource = filterByWhere(dataSource, wheres, selectors);
                parseResult["dataSource"] = dataSource;
                parseResultList.push(parseResult);
            } else if(queryType === "insert") {
                parseResult["selectors"] = selectors;
                parseResult["records"] = records;
                parseResult["into"] = into;
                parseResultList.push(parseResult);
            }
        }
        return parseResultList;
    }
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

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


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ })
/******/ ]);