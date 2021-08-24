"use strict";

const QueryParser = require('../js/query_parser');
const PluginRemoveNulls = require('../js/plugin_removenulls');
const SeparatedValue = require('../js/separated_value');

let headerCells;
let bodyData;
document.addEventListener('DOMContentLoaded', () => {
    console.log('loaded2');
    let performFromWb = document.getElementById('perform_from_wb');
    let performFromSql = document.getElementById('perform_from_sql');
    let performRemoveNull = document.getElementById('perform_remove_null');
    let outputText = document.getElementById('outputText');
    let generateSQL = document.getElementById('generate_sql');
    let generateFactory = document.getElementById('generate_factory');
    let generateXml = document.getElementById('generate_xml');
    performFromWb.addEventListener('click', (e) => {
        onPerform();
    });
    performFromSql.addEventListener('click', (e) => {
        onPerformSql();
    });
    generateSQL.addEventListener('click', (e) => {
        onGenerateSql();
        outputText.addEventListener('dblclick', doubleclickSelectAll);
    });
    generateFactory.addEventListener('click', (e) => {
        onGenerateFactory();
        outputText.addEventListener('dblclick', doubleclickSelectAll);
    });
    generateXml.addEventListener('click', (e) => {
        onGenerateXml();
        outputText.addEventListener('dblclick', doubleclickSelectAll);
    });
    performRemoveNull.addEventListener('click', (e) => {
        let plugin = new PluginRemoveNulls;
        let [newHeaderCells, newBodyData] = plugin.performe(headerCells, bodyData, SQLValue_NULL);
        headerCells = newHeaderCells;
        bodyData = newBodyData;

        createDataTable(headerCells, bodyData);
    });
    let doubleclickSelectAll = () => {
        console.log("outputText.dblclick", this);
        let range = document.createRange();
        range.selectNode(outputText);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
});


function onPerform() {
    let inputText = document.getElementById('inputSection').value;
    let lines = inputText.split('\n');
    let header = lines[0];
    headerCells = header.replace(/^# /, '').split(', ');

    bodyData = [];

    for (let i = 1;i < lines.length;i++) {
        if (lines[i] === '') continue;
        let cells = SeparatedValue.parse(lines[i]);
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
    let parser = new QueryParser();
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
    document.getElementById('generate_sql').removeAttribute('disabled');
    document.getElementById('generate_factory').removeAttribute('disabled');
    document.getElementById('generate_xml').removeAttribute('disabled');
}

function onGenerateSql() {
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
            }).join(",")).join("),\r\n(");
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

function onGenerateFactory() {
    const varName = "$instance";
    let tableName = document.getElementById('table_name').value;
    let className = snakeToCamel(tableName);
    let outputFactory = "";

    bodyData.forEach(row => {
        outputFactory += varName + " = new " + className + ";\n";

        for (let i = 0;i < headerCells.length;i++) {
            outputFactory += varName + "->" + headerCells[i] + " = ";
            outputFactory += (e => {
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
            })(row[i]);
            outputFactory += ";\n";
        }
        outputFactory += "\n";
    })

    document.getElementById('outputText').innerHTML = outputFactory;
}
function onGenerateXml() {
    const varName = "$instance";
    let tableName = document.getElementById('table_name').value;
    let className = snakeToCamel(tableName);
    let outputFactory = `<?xml version="1.0" encoding="UTF-8"?>
<dataset>\n`;

    bodyData.forEach(row => {
        outputFactory += "  <" + tableName + "\n";

        for (let i = 0;i < headerCells.length;i++) {
            const e = row[i];
            if (e.type !== SQLValue_NULL) {
                outputFactory += "    " + headerCells[i] + "=\"";
                if (e.type === SQLValue_STRING) {
                    outputFactory += e.value
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                } else {
                    outputFactory += e.value;
                }
                outputFactory += "\"\n";
            }
        }
        outputFactory += "  />\n";
    });
    outputFactory += `</dataset>`;

    outputFactory = outputFactory
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
    document.getElementById('outputText').innerHTML = outputFactory;
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

function snakeToCamel(str) {
    const cols = str.split(/_/);
    return cols.map(s => {
       return s.length > 0 ? s[0].toUpperCase() + s.substr(1) : ''
    }).join("")
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
    let dispose = () => {
        inputWindow.style.display = 'none';
    };
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
        dispose();
        callback(inputText.value);
    });

    inputWindow.appendChild(inputText);
    inputWindow.appendChild(goButton);

    document.addEventListener('keyup', function(event) {
        if (event.key === 'Escape') {
            inputWindow.style.display = 'none';
        }
    });
    let lastKeyDown = -1;
    inputWindow.addEventListener('keyup', function(event) {
        // console.log('keyup', event.key, event.keyCode, 'lastKeyDown=' + lastKeyDown);
        if (lastKeyDown !== 229 && event.key === 'Enter') {
            dispose();
            callback(inputText.value);
        }
        lastKeyDown = -1;
    });
    inputWindow.addEventListener('keydown', function(event) {
        // console.log('keydown', event.key, event.keyCode);
        lastKeyDown = event.keyCode;
    });
    if(doFocus) {
        inputText.focus();
    }
}